import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, validate} from 'uuid';
import Translate, {translate} from '@docusaurus/Translate';

const NAMESPACE_OPTIONS = [
  {label: 'DNS', value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'},
  {label: 'URL', value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8'},
  {label: 'OID', value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8'},
  {label: 'X500', value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'},
  {label: translate({message: '自定义'}), value: 'custom'},
];

export default function UUID() {
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [uuidVersion, setUuidVersion] = useState('v4');
  const [uppercase, setUppercase] = useState(false);
  const [separator, setSeparator] = useState<'-' | 'none'>('-');
  const [count, setCount] = useState(1);
  const [namespacePreset, setNamespacePreset] = useState('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  const [customNamespace, setCustomNamespace] = useState('');
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean; msg: string; severity: 'success' | 'error'}>({
    open: false, msg: '', severity: 'success',
  });

  useEffect(() => {
    generateUUIDs();
  }, []);

  const getNamespace = (): string => {
    if (namespacePreset === 'custom') return customNamespace;
    return namespacePreset;
  };

  const generateUUIDs = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = '';
      switch (uuidVersion) {
        case 'v1':
          id = uuidv1();
          break;
        case 'v3': {
          const ns = getNamespace();
          if (!ns || !validate(ns)) {
            setSnackbar({open: true, msg: translate({message: 'v3需要有效的命名空间UUID'}), severity: 'error'});
            return;
          }
          if (!name.trim()) {
            setSnackbar({open: true, msg: translate({message: 'v3需要输入名称'}), severity: 'error'});
            return;
          }
          id = uuidv3(name.trim(), ns);
          break;
        }
        case 'v4':
          id = uuidv4();
          break;
        case 'v5': {
          const ns = getNamespace();
          if (!ns || !validate(ns)) {
            setSnackbar({open: true, msg: translate({message: 'v5需要有效的命名空间UUID'}), severity: 'error'});
            return;
          }
          if (!name.trim()) {
            setSnackbar({open: true, msg: translate({message: 'v5需要输入名称'}), severity: 'error'});
            return;
          }
          id = uuidv5(name.trim(), ns);
          break;
        }
        default:
          id = uuidv4();
      }

      if (separator === 'none') id = id.replace(/-/g, '');
      id = uppercase ? id.toUpperCase() : id.toLowerCase();
      list.push(id);
    }
    setUuidList(list);
  };

  const copyToClipboard = async (text: string, msg?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({open: true, msg: msg || translate({message: '复制成功！'}), severity: 'success'});
    } catch {
      setSnackbar({open: true, msg: translate({message: '复制失败'}), severity: 'error'});
    }
  };

  const needsNamespace = uuidVersion === 'v3' || uuidVersion === 'v5';

  return (
    <Container maxWidth="lg" sx={{py: 3}}>
      <Grid container spacing={3}>
        {/* Config Panel */}
        <Grid size={{xs: 12, md: 5, lg: 4}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa'}}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
              <Translate>UUID 配置</Translate>
            </Typography>

            <FormControl fullWidth sx={{mb: 2}}>
              <InputLabel><Translate>UUID 版本</Translate></InputLabel>
              <Select
                value={uuidVersion}
                onChange={(e) => setUuidVersion(e.target.value)}
                label={translate({message: 'UUID 版本'})}
              >
                <MenuItem value="v4">v4 (<Translate>随机生成</Translate>)</MenuItem>
                <MenuItem value="v1">v1 (<Translate>基于时间戳</Translate>)</MenuItem>
                <MenuItem value="v3">v3 (<Translate>基于名称 (MD5)</Translate>)</MenuItem>
                <MenuItem value="v5">v5 (<Translate>基于名称 (SHA-1)</Translate>)</MenuItem>
              </Select>
            </FormControl>

            {needsNamespace && (
              <>
                <FormControl fullWidth sx={{mb: 2}}>
                  <InputLabel><Translate>命名空间</Translate></InputLabel>
                  <Select
                    value={namespacePreset}
                    onChange={(e) => setNamespacePreset(e.target.value)}
                    label={translate({message: '命名空间'})}
                  >
                    {NAMESPACE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {namespacePreset === 'custom' && (
                  <TextField
                    value={customNamespace}
                    onChange={(e) => setCustomNamespace(e.target.value)}
                    label={translate({message: '自定义命名空间 UUID'})}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    fullWidth
                    sx={{mb: 2}}
                    size="small"
                  />
                )}

                <TextField
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  label={translate({message: '名称'})}
                  placeholder={translate({message: '输入用于生成的名称'})}
                  fullWidth
                  sx={{mb: 2}}
                  size="small"
                />

                <Alert severity="info" sx={{mb: 2, fontSize: '0.8rem'}}>
                  <Translate>
                    相同的命名空间和名称将始终生成相同的UUID
                  </Translate>
                </Alert>
              </>
            )}

            <Divider sx={{my: 2}}/>

            <FormControlLabel
              control={<Checkbox checked={uppercase} onChange={() => setUppercase(!uppercase)} size="small"/>}
              label={<Translate>转为大写</Translate>}
            />

            <FormControl fullWidth sx={{mb: 2}} size="small">
              <InputLabel><Translate>分隔符</Translate></InputLabel>
              <Select
                value={separator}
                onChange={(e) => setSeparator(e.target.value as '-' | 'none')}
                label={translate({message: '分隔符'})}
              >
                <MenuItem value="-">- (<Translate>连字符</Translate>)</MenuItem>
                <MenuItem value="none"><Translate>无分隔符</Translate></MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              label={translate({message: '生成个数'})}
              fullWidth
              sx={{my: 2}}
              size="small"
              inputProps={{min: 1, max: 100}}
            />

            <Button variant="contained" color="primary" fullWidth onClick={generateUUIDs} size="large">
              <Translate>生成 UUID</Translate>
            </Button>
          </Box>
        </Grid>

        {/* Result Panel */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                <Translate>生成结果</Translate>
                <Chip label={uuidList.length} size="small" sx={{ml: 1}}/>
              </Typography>
              {uuidList.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(uuidList.join('\n'), translate({message: '已复制全部 UUID'}))}
                >
                  <Translate>批量复制</Translate>
                </Button>
              )}
            </Box>

            <Stack spacing={1}>
              {uuidList.map((id, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1,
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                      cursor: 'pointer',
                      userSelect: 'all',
                    }}
                    onClick={() => copyToClipboard(id)}
                  >
                    {id}
                  </Typography>
                  <Tooltip title={translate({message: '复制'})}>
                    <IconButton size="small" onClick={() => copyToClipboard(id)}>
                      <ContentCopyIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>

            {uuidList.length === 0 && (
              <Box sx={{textAlign: 'center', py: 6, color: '#9e9e9e'}}>
                <Translate>点击"生成 UUID"开始</Translate>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(s => ({...s, open: false}))}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({...s, open: false}))}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
