import React, {useState} from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Translate, {translate} from '@docusaurus/Translate';

interface SlopeResults {
  horizontal: number;
  vertical: number;
  hypotenuse: number;
  angle: number;
  ratio: number;
}

const USAGE_EXAMPLES = [
  {
    title: '已知水平距离和垂直高度',
    desc: '输入：水平距离=100cm，垂直高度=20cm',
    result: '计算：斜边长度=101.98cm，坡度角度=11.31°，坡度比=1:5',
  },
  {
    title: '已知坡度角度和垂直高度',
    desc: '输入：坡度角度=30°，垂直高度=50cm',
    result: '计算：水平距离=86.60cm，斜边长度=100cm，坡度比=1:1.73',
  },
  {
    title: '已知坡度比和水平距离',
    desc: '输入：坡度比=1:8，水平距离=80cm',
    result: '计算：垂直高度=10cm，斜边长度=80.62cm，坡度角度=7.13°',
  },
];

export default function SlopeCalculator() {
  const [inputs, setInputs] = useState({
    horizontalDistance: '',
    verticalHeight: '',
    hypotenuseLength: '',
    slopeAngle: '',
    slopeRatio: '',
  });
  const [results, setResults] = useState<SlopeResults | null>(null);
  const [showUsage, setShowUsage] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({...prev, [field]: value}));
    setError('');
  };

  const calculate = () => {
    const h = parseFloat(inputs.horizontalDistance) || null;
    const v = parseFloat(inputs.verticalHeight) || null;
    const hyp = parseFloat(inputs.hypotenuseLength) || null;
    const angle = parseFloat(inputs.slopeAngle) || null;

    let ratio: number | null = null;
    if (inputs.slopeRatio.trim()) {
      const r = inputs.slopeRatio.trim();
      if (r.includes(':')) {
        const parts = r.split(':');
        if (parts.length === 2) {
          const rise = parseFloat(parts[0]);
          const run = parseFloat(parts[1]);
          if (!isNaN(rise) && !isNaN(run) && run > 0) ratio = rise / run;
        }
      } else {
        ratio = parseFloat(r);
        if (isNaN(ratio)) ratio = null;
      }
    }

    const nonEmpty = [h, v, hyp, angle, ratio].filter(x => x !== null).length;
    if (nonEmpty < 2) {
      setError(translate({message: '请至少输入两个参数'}));
      return;
    }

    // Validate
    if (h !== null && h <= 0) { setError(translate({message: '水平距离必须大于0'})); return; }
    if (v !== null && v <= 0) { setError(translate({message: '垂直高度必须大于0'})); return; }
    if (hyp !== null && hyp <= 0) { setError(translate({message: '斜边长度必须大于0'})); return; }
    if (angle !== null && (angle <= 0 || angle >= 90)) { setError(translate({message: '角度必须在0-90°之间'})); return; }
    if (ratio !== null && ratio <= 0) { setError(translate({message: '坡度比必须大于0'})); return; }

    try {
      let res: SlopeResults | null = null;

      // 9 calculation scenarios
      if (h !== null && v !== null) {
        const hypCalc = Math.sqrt(h * h + v * v);
        res = {horizontal: h, vertical: v, hypotenuse: hypCalc, angle: Math.atan(v / h) * 180 / Math.PI, ratio: v / h};
      } else if (h !== null && hyp !== null) {
        if (h >= hyp) { setError(translate({message: '水平距离不能大于等于斜边长度'})); return; }
        const vCalc = Math.sqrt(hyp * hyp - h * h);
        res = {horizontal: h, vertical: vCalc, hypotenuse: hyp, angle: Math.acos(h / hyp) * 180 / Math.PI, ratio: vCalc / h};
      } else if (v !== null && hyp !== null) {
        if (v >= hyp) { setError(translate({message: '垂直高度不能大于等于斜边长度'})); return; }
        const hCalc = Math.sqrt(hyp * hyp - v * v);
        res = {horizontal: hCalc, vertical: v, hypotenuse: hyp, angle: Math.asin(v / hyp) * 180 / Math.PI, ratio: v / hCalc};
      } else if (h !== null && angle !== null) {
        const rad = angle * Math.PI / 180;
        res = {horizontal: h, vertical: h * Math.tan(rad), hypotenuse: h / Math.cos(rad), angle, ratio: Math.tan(rad)};
      } else if (v !== null && angle !== null) {
        const rad = angle * Math.PI / 180;
        res = {horizontal: v / Math.tan(rad), vertical: v, hypotenuse: v / Math.sin(rad), angle, ratio: Math.tan(rad)};
      } else if (hyp !== null && angle !== null) {
        const rad = angle * Math.PI / 180;
        res = {horizontal: hyp * Math.cos(rad), vertical: hyp * Math.sin(rad), hypotenuse: hyp, angle, ratio: Math.tan(rad)};
      } else if (h !== null && ratio !== null) {
        const vCalc = h * ratio;
        res = {horizontal: h, vertical: vCalc, hypotenuse: Math.sqrt(h * h + vCalc * vCalc), angle: Math.atan(ratio) * 180 / Math.PI, ratio};
      } else if (v !== null && ratio !== null) {
        const hCalc = v / ratio;
        res = {horizontal: hCalc, vertical: v, hypotenuse: Math.sqrt(hCalc * hCalc + v * v), angle: Math.atan(ratio) * 180 / Math.PI, ratio};
      } else if (ratio !== null && angle !== null) {
        const rad = angle * Math.PI / 180;
        res = {horizontal: 1 / Math.tan(rad), vertical: 1, hypotenuse: 1 / Math.sin(rad), angle, ratio: Math.tan(rad)};
      }

      if (!res) {
        setError(translate({message: '无法根据提供的参数计算'}));
        return;
      }
      setResults(res);
      setError('');
    } catch (e) {
      setError(translate({message: '计算出错'}) + ': ' + (e as Error).message);
    }
  };

  const clear = () => {
    setInputs({horizontalDistance: '', verticalHeight: '', hypotenuseLength: '', slopeAngle: '', slopeRatio: ''});
    setResults(null);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{py: 3}}>
      {/* Input Section */}
      <Paper variant="outlined" sx={{p: 3, mb: 3}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
          <Typography variant="h6" sx={{fontWeight: 700}}>
            <Translate>工程坡度计算器</Translate>
          </Typography>
          <IconButton onClick={() => setShowUsage(true)} size="small">
            <HelpOutlineIcon/>
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
          <Translate>请输入两个已知参数，系统将自动计算其他未知参数</Translate>
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{xs: 12, sm: 6}}>
            <TextField
              type="number"
              label={translate({message: '水平距离 (cm)'})}
              placeholder={translate({message: '输入水平距离'})}
              value={inputs.horizontalDistance}
              onChange={(e) => handleInputChange('horizontalDistance', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <TextField
              type="number"
              label={translate({message: '垂直高度 (cm)'})}
              placeholder={translate({message: '输入垂直高度'})}
              value={inputs.verticalHeight}
              onChange={(e) => handleInputChange('verticalHeight', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <TextField
              type="number"
              label={translate({message: '斜边长度 (cm)'})}
              placeholder={translate({message: '输入斜边长度'})}
              value={inputs.hypotenuseLength}
              onChange={(e) => handleInputChange('hypotenuseLength', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <TextField
              type="number"
              label={translate({message: '坡度角度 (°)'})}
              placeholder={translate({message: '输入坡度角度'})}
              value={inputs.slopeAngle}
              onChange={(e) => handleInputChange('slopeAngle', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label={translate({message: '坡度比 (高:长)'})}
              placeholder="1:10 或 0.1"
              value={inputs.slopeRatio}
              onChange={(e) => handleInputChange('slopeRatio', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" variant="body2" sx={{mt: 1}}>
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} sx={{mt: 2.5}}>
          <Button variant="contained" onClick={calculate} sx={{flex: 1}}>
            <Translate>计算</Translate>
          </Button>
          <Button variant="outlined" onClick={clear} sx={{flex: 1}}>
            <Translate>清空</Translate>
          </Button>
        </Stack>
      </Paper>

      {/* Results Section */}
      {results && (
        <Paper variant="outlined" sx={{p: 3}}>
          <Typography variant="h6" sx={{fontWeight: 700, mb: 2}}>
            <Translate>计算结果</Translate>
          </Typography>

          {/* Highlight results */}
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid size={6}>
              <Paper sx={{p: 2, textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca'}}>
                <Typography variant="caption" color="text.secondary"><Translate>坡度角度</Translate></Typography>
                <Typography variant="h5" sx={{fontWeight: 700, color: '#dc2626', fontFamily: 'monospace'}}>
                  {results.angle.toFixed(2)}°
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{p: 2, textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca'}}>
                <Typography variant="caption" color="text.secondary"><Translate>坡度比</Translate></Typography>
                <Typography variant="h5" sx={{fontWeight: 700, color: '#dc2626', fontFamily: 'monospace'}}>
                  1:{(1 / results.ratio).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Detail results */}
          <Grid container spacing={1.5}>
            {[
              {label: translate({message: '水平距离'}), value: `${results.horizontal.toFixed(2)} cm`},
              {label: translate({message: '垂直高度'}), value: `${results.vertical.toFixed(2)} cm`},
              {label: translate({message: '斜边长度'}), value: `${results.hypotenuse.toFixed(2)} cm`},
            ].map(item => (
              <Grid size={4} key={item.label}>
                <Paper variant="outlined" sx={{p: 1.5, textAlign: 'center'}}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body1" sx={{fontWeight: 700, fontFamily: 'monospace'}}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Usage Dialog */}
      <Dialog open={showUsage} onClose={() => setShowUsage(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{fontWeight: 700}}>
          <Translate>坡度计算器使用说明</Translate>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            <Translate>请输入两个已知参数，系统将自动计算其他未知参数</Translate>
          </Typography>

          <Typography variant="subtitle2" sx={{fontWeight: 700, mb: 1}}>
            <Translate>功能特点</Translate>
          </Typography>
          <Box component="ul" sx={{pl: 2, mb: 2, '& li': {fontSize: '0.85rem', color: '#475569', mb: 0.5}}}>
            <li><Translate>支持水平距离、垂直高度、斜边长度、坡度角度、坡度比等参数</Translate></li>
            <li><Translate>任意两个已知参数即可计算出其他所有参数</Translate></li>
            <li><Translate>坡度比支持 1:10 或 0.1 两种格式输入</Translate></li>
            <li><Translate>所有长度单位统一使用厘米(cm)</Translate></li>
          </Box>

          <Typography variant="subtitle2" sx={{fontWeight: 700, mb: 1}}>
            <Translate>使用示例</Translate>
          </Typography>
          {USAGE_EXAMPLES.map((ex, i) => (
            <Paper key={i} variant="outlined" sx={{p: 1.5, mb: 1.5, backgroundColor: '#f8f9fa'}}>
              <Typography variant="body2" sx={{fontWeight: 700, color: '#1976d2', mb: 0.5}}>{ex.title}</Typography>
              <Typography variant="caption" display="block" color="text.secondary">{ex.desc}</Typography>
              <Typography variant="caption" display="block" sx={{fontFamily: 'monospace', mt: 0.5}}>{ex.result}</Typography>
            </Paper>
          ))}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
