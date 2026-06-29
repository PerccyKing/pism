import React, {useEffect, useState, useCallback} from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Translate, {translate} from '@docusaurus/Translate';

interface MaterialNode {
  id: string;
  name: string;
  ratio: number;
  children: MaterialNode[];
}

interface Recipe {
  id: string;
  name: string;
  root: MaterialNode;
  updatedAt: number;
}

const STORAGE_KEY = 'pism_recipe_proportion_recipes';

export default function RecipeProportion() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [managingNodeId, setManagingNodeId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRatio, setFormRatio] = useState('');
  const [batchChildren, setBatchChildren] = useState<{name: string; ratio: string}[]>([{name: '', ratio: ''}]);
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean; id: string; type: 'recipe' | 'node'}>({
    open: false, id: '', type: 'node',
  });

  // Load recipes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecipes(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecipes = useCallback((newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    if (newRecipes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecipes));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeRecipe = recipes.find(r => r.id === activeRecipeId) || null;

  // --- Tree helpers ---
  const findNode = (node: MaterialNode, id: string): MaterialNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  const findParent = (node: MaterialNode, targetId: string): MaterialNode | null => {
    for (const child of node.children) {
      if (child.id === targetId) return node;
      const found = findParent(child, targetId);
      if (found) return found;
    }
    return null;
  };

  const getMultiplier = (nodeId: string, current: MaterialNode, currentMult: number): number => {
    if (current.id === nodeId) return currentMult;
    const sumRatios = current.children.reduce((acc, c) => acc + c.ratio, 0);
    if (sumRatios === 0) return 0;
    for (const child of current.children) {
      const m = getMultiplier(nodeId, child, currentMult * (child.ratio / sumRatios));
      if (m !== 0) return m;
    }
    return 0;
  };

  const calculateAllWeights = (originId: string, valueStr: string) => {
    if (!activeRecipe) return;
    const val = parseFloat(valueStr);
    if (isNaN(val) || valueStr === '') {
      setWeights({});
      return;
    }

    const mult = getMultiplier(originId, activeRecipe.root, 1);
    if (mult === 0) return;

    const rootWeight = val / mult;
    const newWeights: Record<string, string> = {};

    const traverse = (node: MaterialNode, currentWeight: number) => {
      const format = (n: number) => Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(3)).toString();
      newWeights[node.id] = node.id === originId ? valueStr : format(currentWeight);
      const sumRatios = node.children.reduce((acc, c) => acc + c.ratio, 0);
      if (sumRatios > 0) {
        node.children.forEach(child => {
          traverse(child, (currentWeight * child.ratio) / sumRatios);
        });
      }
    };

    traverse(activeRecipe.root, rootWeight);
    setWeights(newWeights);
  };

  // --- Actions ---
  const createRecipe = () => {
    if (!newRecipeName.trim()) return;
    const newRecipe: Recipe = {
      id: `r_${Date.now()}`,
      name: newRecipeName.trim(),
      root: {id: 'root', name: translate({message: '最终成品'}), ratio: 1, children: []},
      updatedAt: Date.now(),
    };
    const newRecipes = [...recipes, newRecipe];
    saveRecipes(newRecipes);
    setActiveRecipeId(newRecipe.id);
    setShowCreateDialog(false);
    setNewRecipeName('');
  };

  const deleteRecipe = (id: string) => {
    saveRecipes(recipes.filter(r => r.id !== id));
    if (activeRecipeId === id) setActiveRecipeId(null);
    setDeleteConfirm({open: false, id: '', type: 'recipe'});
  };

  const openNodeDialog = (nodeId: string) => {
    if (!activeRecipe) return;
    const node = findNode(activeRecipe.root, nodeId);
    if (!node) return;
    setManagingNodeId(nodeId);
    setFormName(node.name);
    setFormRatio(nodeId === 'root' ? '1' : node.ratio.toString());
    setBatchChildren([{name: '', ratio: ''}]);
    setShowNodeDialog(true);
  };

  const saveNode = () => {
    if (!formName.trim() || !activeRecipe || !managingNodeId) return;
    const newRoot = JSON.parse(JSON.stringify(activeRecipe.root));
    const node = findNode(newRoot, managingNodeId);
    if (node) {
      node.name = formName;
      if (managingNodeId !== 'root') node.ratio = parseFloat(formRatio) || 1;
      batchChildren
        .filter(c => c.name.trim() !== '')
        .forEach(c => {
          node.children.push({
            id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: c.name.trim(),
            ratio: parseFloat(c.ratio) || 1,
            children: [],
          });
        });
    }
    const newRecipes = recipes.map(r =>
      r.id === activeRecipeId ? {...r, root: newRoot, updatedAt: Date.now()} : r
    );
    saveRecipes(newRecipes);
    setShowNodeDialog(false);
    setWeights({});
  };

  const deleteNode = (id: string) => {
    if (id === 'root' || !activeRecipe) return;
    const newRoot = JSON.parse(JSON.stringify(activeRecipe.root));
    const parent = findParent(newRoot, id);
    if (parent) {
      parent.children = parent.children.filter(c => c.id !== id);
      const newRecipes = recipes.map(r =>
        r.id === activeRecipeId ? {...r, root: newRoot, updatedAt: Date.now()} : r
      );
      saveRecipes(newRecipes);
      setWeights({});
    }
    setDeleteConfirm({open: false, id: '', type: 'node'});
  };

  // --- Render tree node ---
  const renderNode = (node: MaterialNode, depth: number = 0) => {
    const isCompound = node.children.length > 0;
    return (
      <Box key={node.id} sx={{ml: depth > 0 ? 3 : 0, mb: 1}}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: isCompound ? '#fffbeb' : '#fff',
            borderColor: isCompound ? '#fde68a' : '#e0e0e0',
            cursor: 'pointer',
            '&:hover': {borderColor: '#bdbdbd'},
          }}
          onClick={() => openNodeDialog(node.id)}
        >
          <Box sx={{flex: 1, minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Typography variant="body2" sx={{fontWeight: 700}}>{node.name}</Typography>
              {isCompound && <Chip label={translate({message: '复合'})} size="small" color="warning" variant="outlined"/>}
            </Box>
            {node.id !== 'root' && (
              <Typography variant="caption" color="text.secondary">
                <Translate>基准比例</Translate>: {node.ratio}
              </Typography>
            )}
          </Box>
          <TextField
            type="number"
            value={weights[node.id] || ''}
            onChange={(e) => {
              e.stopPropagation();
              calculateAllWeights(node.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="0.00"
            size="small"
            sx={{width: 100}}
            inputProps={{style: {textAlign: 'right', fontWeight: 700}}}
          />
          {node.id !== 'root' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm({open: true, id: node.id, type: 'node'});
              }}
            >
              <DeleteOutlineIcon fontSize="small"/>
            </IconButton>
          )}
        </Paper>
        {isCompound && (
          <Box sx={{borderLeft: '2px dashed #e0e0e0', pl: 1, mt: 0.5}}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  // --- List View ---
  if (!activeRecipe) {
    return (
      <Container maxWidth="sm" sx={{py: 3}}>
        <Paper variant="outlined" sx={{p: 3, mb: 3}}>
          <Typography variant="h6" sx={{fontWeight: 700, mb: 0.5}}>
            <Translate>配方列表</Translate>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
            <Translate>创建并管理您的配方比例</Translate>
          </Typography>

          {recipes.length === 0 ? (
            <Box sx={{textAlign: 'center', py: 4, color: '#9e9e9e'}}>
              <Translate>暂无配方，请先创建</Translate>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {recipes.map(recipe => (
                <Paper
                  key={recipe.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {borderColor: '#bdbdbd'},
                  }}
                  onClick={() => setActiveRecipeId(recipe.id)}
                >
                  <Box sx={{flex: 1}}>
                    <Typography variant="body1" sx={{fontWeight: 700}}>{recipe.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(recipe.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({open: true, id: recipe.id, type: 'recipe'});
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small"/>
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon/>}
          onClick={() => setShowCreateDialog(true)}
        >
          <Translate>创建新配方</Translate>
        </Button>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{fontWeight: 700}}><Translate>创建配方</Translate></DialogTitle>
          <DialogContent>
            <TextField
              label={translate({message: '配方名称'})}
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
              placeholder={translate({message: '请输入配方名称'})}
              fullWidth
              size="small"
              sx={{mt: 1}}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}><Translate>取消</Translate></Button>
            <Button variant="contained" onClick={createRecipe}><Translate>创建</Translate></Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({open: false, id: '', type: 'node'})}>
          <DialogTitle><Translate>确认删除</Translate></DialogTitle>
          <DialogContent>
            <Typography>
              {deleteConfirm.type === 'recipe'
                ? <Translate>确定要删除这个配方吗？</Translate>
                : <Translate>确定要删除此子项及其所有内容吗？</Translate>}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm({open: false, id: '', type: 'node'})}>
              <Translate>取消</Translate>
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => deleteConfirm.type === 'recipe' ? deleteRecipe(deleteConfirm.id) : deleteNode(deleteConfirm.id)}
            >
              <Translate>删除</Translate>
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // --- Detail View ---
  return (
    <Container maxWidth="sm" sx={{py: 3}}>
      <Box sx={{mb: 2}}>
        <Button
          startIcon={<ArrowBackIcon/>}
          onClick={() => {setActiveRecipeId(null); setWeights({});}}
          sx={{mb: 1}}
        >
          <Translate>返回配方列表</Translate>
        </Button>
        <Typography variant="h6" sx={{fontWeight: 700}}>
          {activeRecipe.name}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{p: 2.5, mb: 2}}>
        {renderNode(activeRecipe.root)}
      </Paper>

      {Object.keys(weights).length > 0 && (
        <Button fullWidth variant="outlined" onClick={() => setWeights({})} sx={{mb: 2}}>
          <Translate>清空计算结果</Translate>
        </Button>
      )}

      {/* Node management dialog */}
      <Dialog open={showNodeDialog} onClose={() => setShowNodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{fontWeight: 700}}><Translate>节点管理</Translate></DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{mt: 1}}>
            <TextField
              label={translate({message: '名称'})}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={translate({message: '请输入名称'})}
              fullWidth
              size="small"
            />
            {managingNodeId !== 'root' && (
              <TextField
                type="number"
                label={translate({message: '基准比例'})}
                value={formRatio}
                onChange={(e) => setFormRatio(e.target.value)}
                placeholder={translate({message: '请输入比例'})}
                fullWidth
                size="small"
              />
            )}

            <Divider/>

            <Typography variant="subtitle2" sx={{fontWeight: 700}}>
              <Translate>批量添加子项</Translate>
            </Typography>

            {batchChildren.map((child, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField
                  value={child.name}
                  onChange={(e) => {
                    const newBatch = [...batchChildren];
                    newBatch[idx].name = e.target.value;
                    setBatchChildren(newBatch);
                  }}
                  placeholder={translate({message: '子项名称'})}
                  size="small"
                  sx={{flex: 2}}
                />
                <TextField
                  type="number"
                  value={child.ratio}
                  onChange={(e) => {
                    const newBatch = [...batchChildren];
                    newBatch[idx].ratio = e.target.value;
                    setBatchChildren(newBatch);
                  }}
                  placeholder={translate({message: '比例'})}
                  size="small"
                  sx={{flex: 1}}
                />
                <IconButton size="small" onClick={() => setBatchChildren(batchChildren.filter((_, i) => i !== idx))}>
                  <DeleteOutlineIcon fontSize="small"/>
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon/>}
              onClick={() => setBatchChildren([...batchChildren, {name: '', ratio: ''}])}
              sx={{borderStyle: 'dashed'}}
            >
              <Translate>再加一项</Translate>
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNodeDialog(false)}><Translate>取消</Translate></Button>
          <Button variant="contained" onClick={saveNode}><Translate>保存</Translate></Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({open: false, id: '', type: 'node'})}>
        <DialogTitle><Translate>确认删除</Translate></DialogTitle>
        <DialogContent>
          <Typography><Translate>确定要删除此子项及其所有内容吗？</Translate></Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({open: false, id: '', type: 'node'})}><Translate>取消</Translate></Button>
          <Button color="error" variant="contained" onClick={() => deleteNode(deleteConfirm.id)}><Translate>删除</Translate></Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
