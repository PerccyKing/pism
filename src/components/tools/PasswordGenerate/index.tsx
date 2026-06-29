import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Translate, {translate} from '@docusaurus/Translate';
import PasswordStrengthMeter from '@site/src/components/PasswordStrengthMeter';
import PrivacyNotice from '@site/src/components/PrivacyNotice';

export default function RandomPasswordGenerator() {
  const defaultUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const defaultNumbers = '0123456789';
  const defaultSymbols = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

  const [passwordList, setPasswordList] = useState<string[]>([]);
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [notRep, setNotRep] = useState(false);
  const [customUppercase, setCustomUppercase] = useState(defaultUppercase);
  const [customNumbers, setCustomNumbers] = useState(defaultNumbers);
  const [customSymbols, setCustomSymbols] = useState(defaultSymbols);
  const [excludeChars, setExcludeChars] = useState('');
  const [count, setCount] = useState(1);
  const [snackbar, setSnackbar] = useState<{open: boolean; msg: string; severity: 'success' | 'error'}>({
    open: false, msg: '', severity: 'success',
  });

  useEffect(() => {
    generatePassword();
  }, []);

  const getValidCharset = (custom: string, fallback: string) => {
    return custom.trim() === '' ? fallback : custom;
  };

  const generatePassword = () => {
    let availableCharset = 'abcdefghijklmnopqrstuvwxyz';

    if (uppercase) availableCharset += getValidCharset(customUppercase, defaultUppercase);
    if (numbers) availableCharset += getValidCharset(customNumbers, defaultNumbers);
    if (symbols) availableCharset += getValidCharset(customSymbols, defaultSymbols);

    const filteredCharset = availableCharset.replace(new RegExp(`[${excludeChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'), '');

    if (filteredCharset.length === 0) {
      setSnackbar({open: true, msg: translate({message: '可用字符集为空，请检查配置'}), severity: 'error'});
      return;
    }

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let password = '';
      const charsetArray = filteredCharset.split('');
      if (notRep && length <= charsetArray.length) {
        const shuffled = [...charsetArray].sort(() => Math.random() - 0.5);
        password = shuffled.slice(0, length).join('');
      } else {
        for (let j = 0; j < length; j++) {
          password += filteredCharset[Math.floor(Math.random() * filteredCharset.length)];
        }
      }
      list.push(password);
    }
    setPasswordList(list);
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
            <PrivacyNotice/>

            <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
              <Translate>随机密码生成配置</Translate>
            </Typography>

            <TextField
              type="number"
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(128, Number(e.target.value))))}
              label={translate({message: '密码长度'})}
              fullWidth
              sx={{mb: 2}}
              size="small"
              inputProps={{min: 1, max: 128}}
            />

            <FormControlLabel
              control={<Checkbox checked={uppercase} onChange={() => setUppercase(!uppercase)} size="small"/>}
              label={<Translate>包含大写字母</Translate>}
            />
            {uppercase && (
              <TextField
                value={customUppercase}
                onChange={(e) => setCustomUppercase(e.target.value)}
                label={translate({message: '自定义大写字母'})}
                fullWidth
                sx={{mb: 1}}
                size="small"
              />
            )}

            <FormControlLabel
              control={<Checkbox checked={numbers} onChange={() => setNumbers(!numbers)} size="small"/>}
              label={<Translate>包含数字</Translate>}
            />
            {numbers && (
              <TextField
                value={customNumbers}
                onChange={(e) => setCustomNumbers(e.target.value)}
                label={translate({message: '自定义数字'})}
                fullWidth
                sx={{mb: 1}}
                size="small"
              />
            )}

            <FormControlLabel
              control={<Checkbox checked={symbols} onChange={() => setSymbols(!symbols)} size="small"/>}
              label={<Translate>包含特殊字符</Translate>}
            />
            {symbols && (
              <TextField
                value={customSymbols}
                onChange={(e) => setCustomSymbols(e.target.value)}
                label={translate({message: '自定义特殊字符'})}
                fullWidth
                sx={{mb: 1}}
                size="small"
              />
            )}

            <Divider sx={{my: 1.5}}/>

            <FormControlLabel
              control={<Checkbox checked={notRep} onChange={() => setNotRep(!notRep)} size="small"/>}
              label={<Translate>字符不重复</Translate>}
            />
            <TextField
              value={excludeChars}
              onChange={(e) => setExcludeChars(e.target.value)}
              label={translate({message: '排除字符'})}
              fullWidth
              sx={{my: 1}}
              size="small"
              placeholder={translate({message: '输入要排除的字符'})}
            />

            <TextField
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              label={translate({message: '生成个数'})}
              fullWidth
              sx={{my: 1}}
              size="small"
              inputProps={{min: 1, max: 50}}
            />

            <Button variant="contained" color="primary" fullWidth onClick={generatePassword} size="large">
              <Translate>生成密码</Translate>
            </Button>
          </Box>
        </Grid>

        {/* Result Panel */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                <Translate>生成结果</Translate>
                <Chip label={passwordList.length} size="small" sx={{ml: 1}}/>
              </Typography>
              {passwordList.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(passwordList.join('\n'), translate({message: '已复制全部密码'}))}
                >
                  <Translate>批量复制</Translate>
                </Button>
              )}
            </Box>

            <Stack spacing={2}>
              {passwordList.map((password, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1.5,
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.9rem',
                        wordBreak: 'break-all',
                        cursor: 'pointer',
                        userSelect: 'all',
                      }}
                      onClick={() => copyToClipboard(password)}
                    >
                      {password}
                    </Typography>
                    <Tooltip title={translate({message: '复制'})}>
                      <IconButton size="small" onClick={() => copyToClipboard(password)}>
                        <ContentCopyIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <PasswordStrengthMeter password={password}/>
                </Box>
              ))}
            </Stack>

            {passwordList.length === 0 && (
              <Box sx={{textAlign: 'center', py: 6, color: '#9e9e9e'}}>
                <Translate>点击"生成密码"开始</Translate>
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
