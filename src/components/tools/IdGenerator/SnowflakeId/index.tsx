import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Snowflake} from '@sapphire/snowflake';
import Translate, {translate} from "@docusaurus/Translate";

export default function SnowflakePage() {
  const [snowflakeList, setSnowflakeList] = useState<string[]>([]);
  const [epoch, setEpoch] = useState<string>('2020-01-01');
  const [count, setCount] = useState<number>(1);
  const [workerId, setWorkerId] = useState<number>(0);
  const [processId, setProcessId] = useState<number>(1);
  const [snackbar, setSnackbar] = useState<{open: boolean; msg: string; severity: 'success' | 'error'}>({
    open: false, msg: '', severity: 'success',
  });

  useEffect(() => {
    generateSnowflakes();
  }, []);

  const generateSnowflakes = () => {
    try {
      const epochDate = new Date(epoch);
      if (isNaN(epochDate.getTime())) {
        setSnackbar({open: true, msg: translate({message: '请输入有效的日期'}), severity: 'error'});
        return;
      }
      const snowflakeGenerator = new Snowflake(epochDate);
      const list: string[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const snowflake = snowflakeGenerator.generate({
            timestamp: Date.now(),
            workerId: BigInt(workerId),
            processId: BigInt(processId),
          });
          list.push(snowflake.toString());
        } catch (e) {
          list.push(translate({message: '生成失败'}));
        }
      }
      setSnowflakeList(list);
    } catch (e) {
      setSnackbar({open: true, msg: translate({message: 'Epoch 时间格式错误'}), severity: 'error'});
    }
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
              <Translate>Snowflake 配置</Translate>
            </Typography>

            {/* Epoch */}
            <Box sx={{mb: 2}}>
              <TextField
                value={epoch}
                onChange={(e) => setEpoch(e.target.value)}
                label={translate({message: 'Epoch 时间'})}
                fullWidth
                size="small"
                type="date"
                slotProps={{inputLabel: {shrink: true}}}
              />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
                <InfoOutlinedIcon sx={{fontSize: 14, color: '#9e9e9e'}}/>
                <Typography variant="caption" color="text.secondary">
                  <Translate>起始时间点，用于计算时间戳偏移量</Translate>
                </Typography>
              </Box>
            </Box>

            {/* Worker ID */}
            <Box sx={{mb: 2}}>
              <TextField
                type="number"
                value={workerId}
                onChange={(e) => setWorkerId(Math.max(0, Math.min(31, Number(e.target.value))))}
                label="Worker ID"
                fullWidth
                size="small"
                inputProps={{min: 0, max: 31}}
              />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
                <InfoOutlinedIcon sx={{fontSize: 14, color: '#9e9e9e'}}/>
                <Typography variant="caption" color="text.secondary">
                  <Translate>区分不同工作节点，范围 0-31</Translate>
                </Typography>
              </Box>
            </Box>

            {/* Process ID */}
            <Box sx={{mb: 2}}>
              <TextField
                type="number"
                value={processId}
                onChange={(e) => setProcessId(Math.max(0, Math.min(31, Number(e.target.value))))}
                label="Process ID"
                fullWidth
                size="small"
                inputProps={{min: 0, max: 31}}
              />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
                <InfoOutlinedIcon sx={{fontSize: 14, color: '#9e9e9e'}}/>
                <Typography variant="caption" color="text.secondary">
                  <Translate>区分同一节点的不同进程，范围 0-31</Translate>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{my: 2}}/>

            <TextField
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              label={translate({message: '生成个数'})}
              fullWidth
              sx={{mb: 2}}
              size="small"
              inputProps={{min: 1, max: 100}}
            />

            <Button variant="contained" color="primary" fullWidth onClick={generateSnowflakes} size="large">
              <Translate>生成 Snowflake</Translate>
            </Button>
          </Box>
        </Grid>

        {/* Result Panel */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Box sx={{p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                <Translate>生成结果</Translate>
                <Chip label={snowflakeList.length} size="small" sx={{ml: 1}}/>
              </Typography>
              {snowflakeList.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(snowflakeList.join('\n'), translate({message: '已复制全部 Snowflake'}))}
                >
                  <Translate>批量复制</Translate>
                </Button>
              )}
            </Box>

            <Stack spacing={1}>
              {snowflakeList.map((id, index) => (
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

            {snowflakeList.length === 0 && (
              <Box sx={{textAlign: 'center', py: 6, color: '#9e9e9e'}}>
                <Translate>点击"生成 Snowflake"开始</Translate>
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
