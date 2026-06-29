import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Translate, {translate} from '@docusaurus/Translate';

interface ProportionItem {
  id: string;
  name: string;
  ratio: number;
  actualValue: string;
}

interface ProportionCalculatorProps {
  type?: 'building' | 'cooking';
}

const DEFAULT_BUILDING: ProportionItem[] = [
  {id: '1', name: '主漆', ratio: 2, actualValue: ''},
  {id: '2', name: '固化剂', ratio: 1, actualValue: ''},
  {id: '3', name: '稀释剂', ratio: 1, actualValue: ''},
];

const DEFAULT_COOKING: ProportionItem[] = [
  {id: '1', name: '面粉', ratio: 100, actualValue: ''},
  {id: '2', name: '水', ratio: 50, actualValue: ''},
  {id: '3', name: '酵母', ratio: 1, actualValue: ''},
];

export default function ProportionCalculator({type = 'building'}: ProportionCalculatorProps) {
  const STORAGE_KEY = `pism_proportion_${type}`;

  const [items, setItems] = useState<ProportionItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formRatio, setFormRatio] = useState('1');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(type === 'cooking' ? DEFAULT_COOKING : DEFAULT_BUILDING);
      }
    } catch {
      setItems(type === 'cooking' ? DEFAULT_COOKING : DEFAULT_BUILDING);
    }
  }, [type]);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const openDialog = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setFormName(items[index].name);
      setFormRatio(items[index].ratio.toString());
    } else {
      setEditIndex(null);
      setFormName('');
      setFormRatio('1');
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const ratio = parseFloat(formRatio);
    if (isNaN(ratio) || ratio <= 0) return;

    const newItem: ProportionItem = {
      id: editIndex !== null ? items[editIndex].id : Date.now().toString(),
      name: formName.trim(),
      ratio,
      actualValue: '',
    };

    const newItems = [...items];
    if (editIndex !== null) {
      newItems[editIndex] = newItem;
    } else {
      newItems.push(newItem);
    }
    setItems(newItems);
    setShowDialog(false);
  };

  const handleDelete = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleActualValueChange = (index: number, valueStr: string) => {
    const value = parseFloat(valueStr);
    const newItems = [...items];

    if (isNaN(value)) {
      if (valueStr === '') {
        newItems.forEach(item => (item.actualValue = ''));
      } else {
        newItems[index].actualValue = valueStr;
      }
      setItems(newItems);
      return;
    }

    const multiplier = value / newItems[index].ratio;
    newItems.forEach((item, i) => {
      if (i === index) {
        item.actualValue = valueStr;
      } else {
        const computed = item.ratio * multiplier;
        item.actualValue = Number.isInteger(computed) ? computed.toString() : computed.toFixed(2);
      }
    });
    setItems(newItems);
  };

  const clearValues = () => {
    setItems(items.map(item => ({...item, actualValue: ''})));
  };

  return (
    <Container maxWidth="sm" sx={{py: 3}}>
      <Paper variant="outlined" sx={{p: 3, mb: 3}}>
        <Typography variant="h6" sx={{fontWeight: 700, mb: 0.5}}>
          {type === 'cooking' ? <Translate>配料比例计算器</Translate> : <Translate>比例计算器</Translate>}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
          <Translate>设定基准比例，输入任意一项的实际值自动计算其它项</Translate>
        </Typography>

        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <Paper
              key={item.id}
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': {borderColor: '#bdbdbd'},
              }}
              onClick={() => openDialog(index)}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#64748b',
                  flexShrink: 0,
                }}
              >
                #{index + 1}
              </Box>
              <Box sx={{flex: 1, minWidth: 0}}>
                <Typography variant="body2" sx={{fontWeight: 700}}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  <Translate>基准比例</Translate>: {item.ratio}
                </Typography>
              </Box>
              <TextField
                type="number"
                value={item.actualValue}
                onChange={(e) => {
                  e.stopPropagation();
                  handleActualValueChange(index, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="0.00"
                size="small"
                sx={{width: 100}}
                inputProps={{style: {textAlign: 'right', fontWeight: 700}}}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <DeleteOutlineIcon fontSize="small"/>
              </IconButton>
            </Paper>
          ))}
        </Stack>

        {/* Add button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon/>}
          onClick={() => openDialog()}
          sx={{
            mt: 2,
            borderStyle: 'dashed',
            color: '#94a3b8',
            borderColor: '#e2e8f0',
            '&:hover': {borderStyle: 'dashed', borderColor: '#94a3b8'},
          }}
        >
          <Translate>添加分项</Translate>
        </Button>

        {items.some(item => item.actualValue !== '') && (
          <Button
            fullWidth
            variant="text"
            onClick={clearValues}
            sx={{mt: 1.5, color: '#64748b'}}
          >
            <Translate>清空计算结果</Translate>
          </Button>
        )}
      </Paper>

      {/* Edit/Add Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{fontWeight: 700}}>
          {editIndex !== null ? <Translate>编辑分项</Translate> : <Translate>添加分项</Translate>}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{mt: 1}}>
            <TextField
              label={translate({message: '名称'})}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={type === 'cooking' ? translate({message: '例如：白糖'}) : translate({message: '例如：主漆'})}
              fullWidth
              size="small"
            />
            <TextField
              type="number"
              label={translate({message: '基准比例'})}
              value={formRatio}
              onChange={(e) => setFormRatio(e.target.value)}
              placeholder="2"
              fullWidth
              size="small"
              inputProps={{min: 0.01, step: 0.01}}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}><Translate>取消</Translate></Button>
          <Button variant="contained" onClick={handleSave}><Translate>保存</Translate></Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
