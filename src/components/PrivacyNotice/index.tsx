import React from 'react';
import {Alert, Typography} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Translate from '@docusaurus/Translate';

interface PrivacyNoticeProps {
  content?: string;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({content}) => {
  return (
    <Alert
      severity="success"
      icon={<LockOutlinedIcon fontSize="small"/>}
      sx={{
        mb: 2,
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        '& .MuiAlert-message': {width: '100%'},
      }}
    >
      <Typography variant="body2" sx={{color: '#166534'}}>
        {content || (
          <Translate>
            所有计算均在本地完成，数据不会上传至服务器。
          </Translate>
        )}
      </Typography>
    </Alert>
  );
};

export default PrivacyNotice;
