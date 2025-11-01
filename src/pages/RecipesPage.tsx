import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index';
import { toggleFavorite } from '@/store/recipesSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Chip, IconButton, Stack, Button, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { startSession } from '@/store/sessionSlice';
import type { Difficulty } from '@/types/recipe';

interface Props {
  setSnackbar: (v: any) => void;
}

const getDifficultyColor = (diff: Difficulty) => {
  switch (diff) {
    case 'Easy': return '#4caf50';
    case 'Medium': return '#ff9800';
    case 'Hard': return '#f44336';
    default: return '#757575';
  }
};

export default function RecipesPage({ setSnackbar }: Props) {
  const recipes = useAppSelector((s) => s.recipes.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredSorted = useMemo(() => {
    let items = [...recipes];
    if (selectedDifficulties.length > 0) {
      items = items.filter((r) => selectedDifficulties.includes(r.difficulty));
    }
    return items.sort((a, b) => sortOrder === 'asc' ? a.totalTimeMinutes - b.totalTimeMinutes : b.totalTimeMinutes - a.totalTimeMinutes);
  }, [recipes, selectedDifficulties, sortOrder]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
      <Box sx={{ maxWidth: 1200, width: '100%' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontSize: "28px" }}>Recipes</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <ToggleButtonGroup 
              value={selectedDifficulties} 
              onChange={(e, newSelection) => {
                if (newSelection !== null && Array.isArray(newSelection)) {
                  setSelectedDifficulties(newSelection as Difficulty[]);
                } else if (newSelection !== null) {
                  // Handle case where it's not an array (shouldn't happen in non-exclusive mode, but just in case)
                  setSelectedDifficulties([newSelection] as Difficulty[]);
                } else {
                  setSelectedDifficulties([]);
                }
              }}
              exclusive={false}
              aria-label="filter by difficulty" 
              size="small"
              sx={{ 
                backgroundColor: 'white',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }
              }}
            >
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <ToggleButton 
                  key={d} 
                  value={d} 
                  aria-label={d}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 89, 0, 0.08)',
                      color: 'primary.main',
                      
                    }
                  }}
                >
                  {d}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <FormControl size="small" sx={{ minWidth: 160, backgroundColor: 'white', borderRadius: '8px' }}>
              <InputLabel id="sort-time">Sort by time</InputLabel>
              <Select 
                labelId="sort-time" 
                label="Sort by time" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as any)}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="asc">Shortest first</MenuItem>
                <MenuItem value="desc">Longest first</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {filteredSorted.map((r) => (
            <Grid item key={r.id} xs={12} sm={6} lg={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 8px 30px 0px',
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, fontSize: '20px' }}>{r.title}</Typography>
                    {r.cuisine && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <RestaurantIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{r.cuisine}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        size="small" 
                        label={r.difficulty} 
                        sx={{ 
                          backgroundColor: getDifficultyColor(r.difficulty),
                          color: 'white',
                          fontWeight: 600,
                        }} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{r.totalTimeMinutes} min</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RestaurantIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{r.totalIngredients} ingredients</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton 
                    aria-label="favorite" 
                    onClick={() => dispatch(toggleFavorite(r.id))}
                    sx={{ 
                      color: r.favorite ? 'error.main' : 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
                    }}
                  >
                    {r.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => { dispatch(startSession({ recipeId: r.id })); navigate(`/cook/${r.id}`); }} 
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      flex: 1,
                      borderRadius: '50px',
                      textTransform: 'capitalize',
                      fontWeight: 600,
                    }}
                  >
                    Cook
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/cook/${r.id}`)}
                    sx={{
                      borderRadius: '50px',
                      textTransform: 'capitalize',
                    }}
                  >
                    View
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
           
        </Grid>
        {filteredSorted.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, backgroundColor: 'white' }}>
            <Typography color="text.secondary">No recipes yet. Click "Create Recipe" to add one.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}


