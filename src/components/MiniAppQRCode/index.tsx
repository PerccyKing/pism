import React from 'react';
import {Box, Typography, Paper} from '@mui/material';
import {getQRCodeForTool, type QRCodeConfig} from '@site/src/config/qrcode.config';
import Translate from '@docusaurus/Translate';

interface MiniAppQRCodeProps {
  /** 工具 ID，用于查找对应的工具小程序码 */
  toolId?: string;
  /** 紧凑模式（横向布局，用于工具页底部） */
  compact?: boolean;
}

const MiniAppQRCode: React.FC<MiniAppQRCodeProps> = ({toolId, compact = false}) => {
  const config = getQRCodeForTool(toolId);
  const imgSrc = `/img/mini_app_code/${config.image}`;
  const label = config.label || '手机微信扫码，体验 PISM 小程序';

  if (compact) {
    return (
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          mt: 3,
          backgroundColor: '#fafbfc',
          borderRadius: 2,
        }}
      >
        <Box
          component="img"
          src={imgSrc}
          alt={label}
          sx={{width: 100, height: 100, borderRadius: 1.5, flexShrink: 0}}
        />
        <Box>
          <Typography variant="body2" sx={{fontWeight: 600, mb: 0.5}}>
            <Translate>小程序体验</Translate>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        p: 2,
        background: '#fafbfc',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Box
        component="img"
        src={imgSrc}
        alt={label}
        sx={{width: 180, height: 180, borderRadius: 2, mb: 1.5}}
      />
      <Typography variant="subtitle1" color="text.secondary" align="center">
        {label}
        <br/>
        <Box component="span" sx={{color: '#f44336', fontWeight: 500}}>
          <Translate>建议在手机上使用</Translate>
        </Box>
      </Typography>
    </Paper>
  );
};

export default MiniAppQRCode;
