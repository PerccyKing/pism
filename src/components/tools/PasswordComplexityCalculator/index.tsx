import React, {useState} from 'react';
import {Box, Container, TextField, Typography} from '@mui/material';
import Translate, {translate} from '@docusaurus/Translate';
import PasswordStrengthMeter from '@site/src/components/PasswordStrengthMeter';
import PrivacyNotice from '@site/src/components/PrivacyNotice';

const PasswordComplexityCalculator = () => {
  const [password, setPassword] = useState('');

  return (
    <Container maxWidth="md" sx={{py: 3}}>
      <Box sx={{p: 3, border: '1px solid #e0e0e0', borderRadius: 2}}>
        <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
          <Translate>密码复杂度计算器</Translate>
        </Typography>

        <PrivacyNotice
          content={translate({message: '所有密码强度计算均在本地完成，不会记录或上传您的密码数据。'})}
        />

        <TextField
          label={translate({message: '输入密码'})}
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{mb: 3}}
        />

        <PasswordStrengthMeter password={password}/>
      </Box>

      {/* Usage guide */}
      <Box sx={{p: 3, mt: 3, border: '1px solid #e0e0e0', borderRadius: 2}}>
        <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2}}>
          <Translate>密码强度评分标准</Translate>
        </Typography>
        <Box component="ul" sx={{pl: 2, m: 0, '& li': {mb: 0.5, fontSize: '0.9rem', color: '#475569'}}}>
          <li><Translate>密码长度（建议12位以上）</Translate></li>
          <li><Translate>字符多样性（包含大小写字母、数字、特殊字符）</Translate></li>
          <li><Translate>避免连续字符（如：abc、123）</Translate></li>
          <li><Translate>避免重复字符（如：aaa、111）</Translate></li>
          <li><Translate>避免键盘模式（如：qwerty、asdf）</Translate></li>
        </Box>

        <Typography variant="subtitle1" sx={{fontWeight: 700, mt: 2, mb: 1}}>
          <Translate>评分等级</Translate>
        </Typography>
        <Box component="ul" sx={{pl: 2, m: 0, '& li': {mb: 0.5, fontSize: '0.9rem', color: '#475569'}}}>
          <li><Translate>弱：0-39分</Translate></li>
          <li><Translate>中等：40-59分</Translate></li>
          <li><Translate>强：60-79分</Translate></li>
          <li><Translate>非常强：80-100分</Translate></li>
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordComplexityCalculator;
