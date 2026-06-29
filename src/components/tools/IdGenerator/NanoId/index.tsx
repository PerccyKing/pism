import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {customAlphabet, nanoid} from 'nanoid';
import Translate, {translate} from '@docusaurus/Translate';

const ALPHABET_PRESETS = [
  {label: translate({message: '默认'}), value: 'default', alphabet: ''},
  {label: translate({message: '数字'}), value: 'numbers', alphabet: '0123456789'},
  {label: translate({message: 'Base58'}), value: 'base58', alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'},
  {label: translate({message: '十六进制'}), value: 'hex', alphabet: '0123456789abcdef'},
  {label: translate({message: '自定义'}), value: 'custom', alphabet: ''},
];

export default function NanoID() {
  const [nanoidList, setNanoIDList] = useState<string[]>([]);
  const [preset, setPreset] = useState('default');
  const [customAlphabetStr, setCustomAlphabetStr] = useState('');
  const [length, setLength] = useState(21);
  const [uppercase, setUppercase] = useState(false);
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; msg: string; severity: 'success' | 'error'}>({
    open: false, msg: '', severity: 'success',
  });

  useEffect(() => {
    generateNanoIDs();
  }, []);

  const getAlphabet = (): string => {
    const selected = ALPHABET_PRESETS.find(p => p.value === preset);
    if (!selected || selected.value === 'default') return '';
    if (selected.value === 'custom') return customAlphabetStr;
    let alpha = selected.alphabet;
    if (excludeSimilar) {
      alpha = alpha.replace(/[0OIl1]/g, '');
    }
    return alpha;
  };

  const generateNanoIDs = () => {
    const alphabet = getAlphabet();
    if (preset === 'custom' && !alphabet) {
      setSnackbar({open: true, msg: translate({message: '请输入自定义字符集'}), severity: 'error'});
      return;
    }

    const generator = alphabet ? customAlphabet(alphabet, length) : () => nanoid(length);
    const list: string[] = [];

    for (let i = 0; i < count; i++) {
      let id = generator();
      if (uppercase) id = id.toUpperCase();
      id = prefix + id + suffix;
      list.push(id);
    }

    setNanoIDList(list);
  };

  const copyToClipboard = async (text: string, msg?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({open: true, msg: msg || translate({message: '复制成功！'}), severity: 'success'});
    } catch {
      setSnackbar({open: true, msg: translate({message: '复制失败'}), severity: 'error'});
    }
  };

  return (
    <Container maxWidth="lg" sx={{py: 3}}>
      <Grid container spacing={3}>
        {/* Config Panel */}
        <Grid size={{xs: 12, md: 5, lg: 4}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa'}}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
              <Translate>NanoID 配置</Translate>
            </Typography>

            <FormControl fullWidth sx={{mb: 2}}>
              <InputLabel><Translate>字母表预设</Translate></InputLabel>
              <Select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                label={translate({message: '字母表预设'})}
              >
                {ALPHABET_PRESETS.map(p => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {preset === 'custom' && (
              <TextField
                value={customAlphabetStr}
                onChange={(e) => setCustomAlphabetStr(e.target.value)}
                label={translate({message: '自定义字符集'})}
                fullWidth
                sx={{mb: 2}}
                size="small"
                placeholder={translate({message: '输入自定义字符集'})}
              />
            )}

            <TextField
              type="number"
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(128, Number(e.target.value))))}
              label={translate({message: 'ID 长度'})}
              fullWidth
              sx={{mb: 2}}
              size="small"
              inputProps={{min: 1, max: 128}}
            />

            <Grid container spacing={1} sx={{mb: 2}}>
              <Grid size={6}>
                <TextField
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  label={translate({message: '前缀'})}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  label={translate({message: '后缀'})}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{my: 2}}/>

            <FormControlLabel
              control={<Checkbox checked={uppercase} onChange={() => setUppercase(!uppercase)} size="small"/>}
              label={<Translate>转为大写</Translate>}
            />
            {preset !== 'custom' && preset !== 'numbers' && (
              <FormControlLabel
                control={<Checkbox checked={excludeSimilar} onChange={() => setExcludeSimilar(!excludeSimilar)} size="small"/>}
                label={<Translate>排除相似字符 (0OIl1)</Translate>}
              />
            )}

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

            <Button variant="contained" color="primary" fullWidth onClick={generateNanoIDs} size="large">
              <Translate>生成 NanoID</Translate>
            </Button>
          </Box>
        </Grid>

        {/* Result Panel */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                <Translate>生成结果</Translate>
                <Chip label={nanoidList.length} size="small" sx={{ml: 1}}/>
              </Typography>
              {nanoidList.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(nanoidList.join('\n'), translate({message: '已复制全部 NanoID'}))}
                >
                  <Translate>批量复制</Translate>
                </Button>
              )}
            </Box>

            <Stack spacing={1}>
              {nanoidList.map((id, index) => (
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

            {nanoidList.length === 0 && (
              <Box sx={{textAlign: 'center', py: 6, color: '#9e9e9e'}}>
                <Translate>点击"生成 NanoID"开始</Translate>
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
