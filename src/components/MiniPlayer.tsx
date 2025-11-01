import { Paper, Typography, LinearProgress, IconButton, Box, Stack, Chip } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { pause, resume, stop } from '@/store/sessionSlice';

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.session.activeSession);
  const status = useAppSelector((s) => s.session.status);
  const recipe = useAppSelector((s) => s.recipes.items.find((r) => r.id === s.session.activeSession?.recipeId));

  if (!session || !recipe) return null;
  const totalRecipeMs = recipe.steps.reduce((sum, s) => sum + s.durationSeconds * 1000, 0);
  const totalProgress = Math.min(100, (session.totalElapsedMs / totalRecipeMs) * 100);
  const currentStep = recipe.steps[session.stepIndex];
  const currentRemaining = currentStep.durationSeconds * 1000 - session.elapsedMsInStep;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        left: '50%', 
        transform: 'translateX(-50%)',
        maxWidth: 900,
        width: 'calc(100% - 48px)',
        zIndex: 1200, 
        cursor: 'pointer',
        borderRadius: 3,
        backgroundColor: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px 0px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateX(-50%) translateY(-2px)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 12px 40px 0px',
        }
      }} 
      onClick={() => navigate(`/cook/${recipe.id}`)}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <RestaurantIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {recipe.title}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Chip 
                size="small" 
                label={`Step ${session.stepIndex + 1}/${recipe.steps.length}`}
                sx={{ 
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: 'primary.main'
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0
                }}
              >
                {currentStep.description}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            {status === 'running' ? (
              <IconButton 
                aria-label="pause" 
                onClick={() => dispatch(pause())}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.16)',
                  }
                }}
              >
                <PauseIcon />
              </IconButton>
            ) : (
              <IconButton 
                aria-label="resume" 
                onClick={() => dispatch(resume())}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.16)',
                  }
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            )}
            <IconButton 
              aria-label="stop" 
              onClick={() => dispatch(stop({ recipe }))}
              sx={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.16)',
                }
              }}
            >
              <StopIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Box sx={{ mt: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Time left this step: {formatMs(currentRemaining)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {Math.round(totalProgress)}% complete
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={totalProgress} 
            aria-label="overall progress"
            sx={{
              height: 8,
              borderRadius: '50px',
              backgroundColor: 'rgb(246, 250, 251)',
              '& .MuiLinearProgress-bar': {
                borderRadius: '50px',
              }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}


