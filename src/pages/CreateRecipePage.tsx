import { useState } from 'react';
import { useAppDispatch } from '../store/index';
import { addRecipe } from '@/store/recipesSlice';
import { Ingredient, Step, Difficulty } from '@/types/recipe';
import { Box, TextField, Stack, Button, MenuItem, Typography, Divider, IconButton, Paper, Chip, Select, FormControl, InputLabel, Checkbox, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { nanoid } from '@reduxjs/toolkit';
import { PiChefHatFill } from "react-icons/pi";
import { validateRecipe } from '@/utils/validation';

interface Props {
    setSnackbar: (v: any) => void;
}

export default function CreateRecipePage({ setSnackbar }: Props) {
    const dispatch = useAppDispatch();

    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [cuisine, setCuisine] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [steps, setSteps] = useState<Step[]>([]);

    const addIngredient = () => setIngredients((prev) => [...prev, { id: nanoid(), name: '', quantity: 0, unit: '' }]);
    const removeIngredient = (id: string) => setIngredients((prev) => prev.filter((i) => i.id !== id));
    const updateIngredient = (id: string, patch: Partial<Ingredient>) => setIngredients((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));

    const addStep = () => setSteps((prev) => [...prev, { id: nanoid(), description: '', type: 'instruction', durationSeconds: 60, ingredientIds: [] }]);
    const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));
    const moveStep = (id: string, dir: -1 | 1) => setSteps((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        const tgt = idx + dir;
        if (idx < 0 || tgt < 0 || tgt >= prev.length) return prev;
        const copy = [...prev];
        const [item] = copy.splice(idx, 1);
        if (!item) return prev;
        copy.splice(tgt, 0, item);
        return copy;
    });
    const updateStep = (id: string, patch: Partial<Step>) => setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));

    const onSave = () => {
        
        const validIngredients = ingredients.filter(ing =>
            ing.name.trim() &&
            ing.quantity > 0 &&
            ing.unit.trim()
        );

        const validIngredientIds = new Set(validIngredients.map(ing => ing.id));
        const cleanedSteps = steps.map(step => ({
            ...step,
            ingredientIds: step.ingredientIds
                ? step.ingredientIds.filter(id => validIngredientIds.has(id))
                : undefined
        }));

        const recipe = {
            title,
            difficulty,
            favorite: false,
            ingredients: validIngredients,
            steps: cleanedSteps,
            cuisine,
            totalTimeMinutes: 0,
            totalIngredients: 0,
            complexityScore: 0
        };

        if (ingredients.length > validIngredients.length) {
            const invalidCount = ingredients.length - validIngredients.length;
            setSnackbar({
                open: true,
                message: `${invalidCount} invalid ingredient(s) were removed. Please fill in name, quantity, and unit for all ingredients.`,
                severity: 'warning'
            });
            return;
        }

        // Validate recipe
        const errors = validateRecipe(recipe);
        if (errors.length) {
            setSnackbar({ open: true, message: errors[0], severity: 'error' });
            return;
        }

        dispatch(addRecipe({ ...recipe }));
        setSnackbar({ open: true, message: 'Recipe saved', severity: 'success' });

        // reset form
        setTitle('');
        setCuisine('');
        setDifficulty('Easy');
        setIngredients([]);
        setSteps([]);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>

            <Stack spacing={2} sx={{
                p: 4,
                borderRadius: 3,
                maxWidth: 800,
                width: '100%',
                backgroundColor: 'white',
                boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px',
                margin:'18px 0 18px 0'
            }}
            >

                <Typography variant="h4" sx={{ fontWeight: 600, fontSize: "28px", textAlign: "center", mb: 4 }}>Create Recipe</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: .5, color: 'text.secondary', fontWeight: 500 }}>Title <span style={{ color: 'red' }}>*</span></Typography>
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            placeholder="Title"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgb(246, 250, 251)',
                                    height: '47px',
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>Cuisine</Typography>
                        <TextField
                            value={cuisine}
                            onChange={(e) => setCuisine(e.target.value)}
                            fullWidth
                            placeholder="Cuisine"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgb(246, 250, 251)',
                                    height: '47px',
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Difficulty</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level, index) => (
                            <Paper
                                key={level}
                                onClick={() => setDifficulty(level)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 2,
                                    minWidth: 94,
                                    width: 94,
                                    height: 94,
                                    cursor: 'pointer',
                                    border: 2,
                                    borderColor: difficulty === level ? getDifficultyColor(level) : 'divider',
                                    backgroundColor: difficulty === level ? '#F2F9FF' : 'background.paper',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: getDifficultyColor(level),
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                                    {Array.from({ length: index + 1 }).map((_, i) => (
                                        <PiChefHatFill
                                            key={i}
                                            size={25}
                                            style={{
                                                color: difficulty === level ? getDifficultyColor(level) : '#757575'
                                            }}
                                        />
                                    ))}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: difficulty === level ? 600 : 400, color: difficulty === level ? getDifficultyColor(level) : '#757575' }}>
                                    {level}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>


                <Divider />
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "18px", }}>Ingredients</Typography>
                </Stack>
                <Box>
                    {/* Table Rows */}
                    {ingredients.length === 0 ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography color="text.secondary">No ingredients yet. Click "Add Row" to add ingredients.</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr 120px 120px 60px', sm: '1fr 160px 160px 80px' },
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                py: 1.5,
                                px: 1.5,
                                gap: 1
                            }}>
                                <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Name</Typography>
                                </Box>
                                <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Quantity</Typography>
                                </Box>
                                <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Unit</Typography>
                                </Box>
                                <Box>
                                    {/* Empty for Action column */}
                                </Box>
                            </Box>
                            {ingredients.map((ing, index) => (
                                <>

                                    <Box
                                        key={ing.id}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr 120px 120px 60px', sm: '1fr 160px 160px 80px' },
                                            borderBottom: index < ingredients.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            py: 1,
                                            px: 1.5,
                                            gap: 1,
                                            alignItems: 'center',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                            <TextField
                                                value={ing.name}
                                                onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                                                placeholder="Name"
                                                variant="standard"
                                                InputProps={{
                                                    disableUnderline: true,
                                                }}
                                                fullWidth
                                                sx={{
                                                    '& .MuiInput-root': {
                                                        padding: '8px 12px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'transparent',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                            <TextField
                                                type="number"
                                                value={ing.quantity || ''}
                                                onChange={(e) => updateIngredient(ing.id, { quantity: Number(e.target.value) || 0 })}
                                                placeholder="Quantity"
                                                variant="standard"
                                                InputProps={{
                                                    disableUnderline: true,
                                                }}
                                                fullWidth
                                                sx={{
                                                    '& .MuiInput-root': {
                                                        padding: '8px 12px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'transparent',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                            <TextField
                                                value={ing.unit}
                                                onChange={(e) => updateIngredient(ing.id, { unit: e.target.value })}
                                                placeholder="Unit"
                                                variant="standard"
                                                InputProps={{
                                                    disableUnderline: true,
                                                }}
                                                fullWidth
                                                sx={{
                                                    '& .MuiInput-root': {
                                                        padding: '8px 12px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'transparent',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <IconButton
                                                size="small"
                                                aria-label="delete"
                                                onClick={() => removeIngredient(ing.id)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </>
                            ))}
                        </>
                    )}
                    <Button startIcon={<AddIcon />} onClick={addIngredient} sx={{ borderRadius: '8px', mt: 2, textTransform: 'capitalize' }} variant="outlined" size="small">Add Row</Button>

                </Box>

                <Divider />
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "18px" }}>Steps</Typography>
                    
                </Stack>
                <Stack spacing={2}>
                    {steps.map((s, idx) => (
                        <Paper key={s.id} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Stack spacing={2.5}>
                                {/* Step Header */}
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Chip label={`#${idx + 1}`} size="small" sx={{ fontWeight: 600 }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Step {idx + 1}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton
                                            size="small"
                                            disabled={idx === 0}
                                            onClick={() => moveStep(s.id, -1)}
                                            sx={{ '&:disabled': { opacity: 0.3 } }}
                                        >
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            disabled={idx === steps.length - 1}
                                            onClick={() => moveStep(s.id, 1)}
                                            sx={{ '&:disabled': { opacity: 0.3 } }}
                                        >
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeStep(s.id)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                {/* Description */}
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>Description</Typography>
                                    <TextField
                                        value={s.description}
                                        onChange={(e) => updateStep(s.id, { description: e.target.value })}
                                        fullWidth
                                        placeholder="Enter step description"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'rgb(246, 250, 251)',
                                                height: '47px',
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Type and Duration */}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>Type</Typography>
                                        <TextField
                                            select
                                            value={s.type}
                                            onChange={(e) => updateStep(s.id, { type: e.target.value as Step['type'], ...(e.target.value === 'instruction' ? { cookingSettings: undefined } : { ingredientIds: undefined }) })}
                                            placeholder="Select type"
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgb(246, 250, 251)',
                                                    height: '47px',
                                                },
                                            }}
                                        >
                                            <MenuItem value="instruction">Instruction</MenuItem>
                                            <MenuItem value="cooking">Cooking</MenuItem>
                                        </TextField>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>Duration (sec)</Typography>
                                        <TextField
                                            type="number"
                                            value={s.durationSeconds}
                                            onChange={(e) => updateStep(s.id, { durationSeconds: Number(e.target.value) })}
                                            placeholder="Duration in seconds"
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgb(246, 250, 251)',
                                                    height: '47px',
                                                },
                                            }}
                                        />
                                    </Box>
                                </Stack>

                                {/* Cooking Settings or Ingredient Selectionimage.png */}
                                {s.type != 'instruction' ? (
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
                                                Temperature (°C)
                                                {s.type !== 'cooking' && <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>(Only for cooking)</span>}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={s.cookingSettings?.temperatureC ?? ''}
                                                onChange={(e) => {
                                                    const temp = Number(e.target.value);
                                                    if (s.type === 'cooking') {
                                                        updateStep(s.id, {
                                                            cookingSettings: {
                                                                temperatureC: temp,
                                                                speed: s.cookingSettings?.speed ?? 1
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={s.type !== 'cooking'}
                                                inputProps={{ min: 40, max: 200 }}
                                                placeholder="40-200°C"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        backgroundColor: s.type === 'cooking' ? 'rgb(246, 250, 251)' : 'rgb(245, 245, 245)',
                                                        height: '47px',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
                                                Speed (1-5)
                                                {s.type !== 'cooking' && <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>(Only for cooking)</span>}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={s.cookingSettings?.speed ?? ''}
                                                onChange={(e) => {
                                                    const speed = Number(e.target.value);
                                                    if (s.type === 'cooking') {
                                                        updateStep(s.id, {
                                                            cookingSettings: {
                                                                temperatureC: s.cookingSettings?.temperatureC ?? 100,
                                                                speed: speed
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={s.type !== 'cooking'}
                                                inputProps={{ min: 1, max: 5 }}
                                                placeholder="1-5"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        backgroundColor: s.type === 'cooking' ? 'rgb(246, 250, 251)' : 'rgb(245, 245, 245)',
                                                        height: '47px',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>Select Ingredients</Typography>
                                        <FormControl fullWidth>
                                            <Select
                                                multiple
                                                value={s.ingredientIds || []}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const selectedIds = typeof value === 'string' ? value.split(',') : value as string[];
                                                    // Filter to only include valid ingredients
                                                    const validIngredientIds = selectedIds.filter(id => {
                                                        const ing = ingredients.find(i => i.id === id);
                                                        return ing && ing.name.trim() && ing.quantity > 0 && ing.unit.trim();
                                                    });
                                                    updateStep(s.id, {
                                                        ingredientIds: validIngredientIds
                                                    });
                                                }}
                                                renderValue={(selected) => {
                                                    const selectedIds = selected as string[];
                                                    if (selectedIds.length === 0) return <span style={{ color: '#999' }}>Select ingredients</span>;
                                                    const validSelectedIds = selectedIds.filter(id => {
                                                        const ing = ingredients.find(i => i.id === id);
                                                        return ing && ing.name.trim() && ing.quantity > 0 && ing.unit.trim();
                                                    });
                                                    if (validSelectedIds.length === 0) return <span style={{ color: '#999' }}>Select ingredients</span>;
                                                    const names = validSelectedIds.map(id => {
                                                        const ing = ingredients.find(i => i.id === id);
                                                        return ing ? `${ing.name} (${ing.quantity} ${ing.unit})` : id;
                                                    }).filter(Boolean);
                                                    return names.join(', ');
                                                }}
                                                disabled={ingredients.filter(ing => ing.name.trim() && ing.quantity > 0 && ing.unit.trim()).length === 0}
                                                displayEmpty
                                                sx={{
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgb(246, 250, 251)',
                                                    height: '47px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiSelect-select': {
                                                        padding: '14px 14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    },
                                                }}
                                            >
                                                {(() => {
                                                    const validIngredients = ingredients.filter(ing =>
                                                        ing.name.trim() &&
                                                        ing.quantity > 0 &&
                                                        ing.unit.trim()
                                                    );

                                                    if (validIngredients.length === 0) {
                                                        return (
                                                            <MenuItem disabled>
                                                                <ListItemText primary="No valid ingredients available. Add ingredients with name, quantity, and unit." />
                                                            </MenuItem>
                                                        );
                                                    }

                                                    return validIngredients.map((ing) => (
                                                        <MenuItem key={ing.id} value={ing.id}>
                                                            <Checkbox checked={(s.ingredientIds || []).includes(ing.id)} />
                                                            <ListItemText primary={`${ing.name} (${ing.quantity} ${ing.unit})`} />
                                                        </MenuItem>
                                                    ));
                                                })()}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    ))}
                    {!steps.length && (
                        <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography color="text.secondary">No steps yet. Click "Add Step" to add steps.</Typography>
                        </Box>
                    )}
                    <Button 
                        startIcon={<AddIcon />} 
                        onClick={addStep} 
                        sx={{ borderRadius: '8px', textTransform: 'capitalize', maxWidth: '100px' }} 
                        variant="outlined" 
                        size="small"
                    >
                        Add Step
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ pt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => { setTitle(''); setDifficulty('Easy'); setCuisine(''); setIngredients([]); setSteps([]); }}
                        sx={{
                            borderRadius: '50px',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            borderColor: '#f44336',
                            color: '#f44336',
                            px: 4,
                            py: 1,
                            '&:hover': {
                                borderColor: '#d32f2f',
                                backgroundColor: 'rgba(244, 67, 54, 0.04)',
                            },
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSave}
                        sx={{
                            borderRadius: '50px',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            backgroundColor: 'primary.main',
                            px: 4,
                            py: 1,
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Save Recipe
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}


const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
        case 'Easy': return '#4caf50'; // Green
        case 'Medium': return '#ff9800'; // Orange
        case 'Hard': return '#f44336'; // Red
        default: return '#757575';
    }
};
const getDifficultyBgColor = (diff: Difficulty) => {
    switch (diff) {
        case 'Easy': return 'rgba(76, 175, 80, 0.1)'; // Light green
        case 'Medium': return 'rgba(255, 152, 0, 0.1)'; // Light orange
        case 'Hard': return 'rgba(244, 67, 54, 0.1)'; // Light red
        default: return 'transparent';
    }
};