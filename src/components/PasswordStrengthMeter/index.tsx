import React from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Translate, {translate} from '@docusaurus/Translate';
import {calculatePasswordStrength, PasswordStrength} from '@site/src/utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password: string;
}

const levelConfig: Record<PasswordStrength['level'], {label: string; color: string; bgColor: string}> = {
  'weak': {label: '弱', color: '#d32f2f', bgColor: '#ffebee'},
  'medium': {label: '中等', color: '#ed6c02', bgColor: '#fff3e0'},
  'strong': {label: '强', color: '#2e7d32', bgColor: '#e8f5e9'},
  'very-strong': {label: '非常强', color: '#1565c0', bgColor: '#e3f2fd'},
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({password}) => {
  if (!password) return null;

  const result = calculatePasswordStrength(password);
  const config = levelConfig[result.level];

  const getProgressColor = (): 'error' | 'warning' | 'success' | 'info' => {
    switch (result.level) {
      case 'weak': return 'error';
      case 'medium': return 'warning';
      case 'strong': return 'success';
      case 'very-strong': return 'info';
    }
  };

  const scenarios = [
    {label: translate({message: '在线攻击'}), value: result.crackTime.scenarios.online, desc: translate({message: '每秒100次'})},
    {label: translate({message: '离线慢速'}), value: result.crackTime.scenarios.offline_slow, desc: translate({message: '每秒1万次'})},
    {label: translate({message: '离线快速'}), value: result.crackTime.scenarios.offline_fast, desc: translate({message: '每秒100亿次'})},
    {label: translate({message: '量子计算'}), value: result.crackTime.scenarios.quantum, desc: translate({message: '每秒10万亿次'})},
  ];

  return (
    <Box>
      {/* Score bar */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
        <LinearProgress
          variant="determinate"
          value={result.score}
          color={getProgressColor()}
          sx={{flex: 1, height: 8, borderRadius: 4}}
        />
        <Chip
          label={`${config.label} (${result.score})`}
          size="small"
          sx={{
            backgroundColor: config.bgColor,
            color: config.color,
            fontWeight: 700,
            minWidth: 70,
          }}
        />
      </Box>

      {/* Crack time scenarios */}
      <Paper
        variant="outlined"
        sx={{p: 1.5, mt: 1.5, backgroundColor: '#fafafa', borderRadius: 2}}
      >
        <Typography variant="caption" sx={{fontWeight: 700, color: '#64748b', display: 'block', mb: 1}}>
          <Translate>破解时间估算</Translate>
        </Typography>
        <Stack spacing={0.8}>
          {scenarios.map((s) => (
            <Box key={s.label} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.8rem'}}>
                {s.label}
                <Typography component="span" variant="caption" sx={{ml: 0.5, color: '#94a3b8'}}>
                  ({s.desc})
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{fontWeight: 700, color: config.color, fontFamily: 'monospace', fontSize: '0.8rem'}}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Feedback tags */}
      {result.feedback.length > 0 && (
        <Box sx={{mt: 1.5}}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {result.feedback.map((msg, i) => (
              <Chip
                key={i}
                label={msg}
                size="small"
                variant="outlined"
                sx={{fontSize: '0.75rem', mb: 0.5}}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter;
