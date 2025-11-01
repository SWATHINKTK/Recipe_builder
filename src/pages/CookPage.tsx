import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { startSession, pause, resume, stop, resetSession } from '@/store/sessionSlice';
import { Box, Typography, Stack, Button, LinearProgress, CircularProgress, Paper, Divider, Chip } from '@mui/material';

function formatMs(ms: number): string {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CookPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const recipe = useAppSelector((s) => s.recipes.items.find((r) => r.id === id));
    const session = useAppSelector((s) => s.session);
    const active = session.activeSession;

    const ensureStarted = () => {
        if (recipe && (!active || active.recipeId !== recipe.id)) {
            dispatch(startSession({ recipeId: recipe.id }));
        }
    };

    const totalMs = useMemo(() => recipe?.steps.reduce((sum, s) => sum + s.durationSeconds * 1000, 0) ?? 0, [recipe?.id]);
    const totalProgress = active ? Math.min(100, (active.totalElapsedMs / totalMs) * 100) : 0;
    const currentStep = recipe && active ? recipe.steps[active.stepIndex] : null;
    const stepProgress = currentStep && active ? Math.min(100, (active.elapsedMsInStep / (currentStep.durationSeconds * 1000)) * 100) : 0;
    const stepRemaining = currentStep && active ? currentStep.durationSeconds * 1000 - active.elapsedMsInStep : 0;

    if (!recipe) {
        return <Typography>Recipe not found.</Typography>;
    }

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return '#4caf50';
            case 'Medium': return '#ff9800';
            case 'Hard': return '#f44336';
            default: return '#757575';
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
            <Box sx={{ maxWidth: 900, width: '100%' }}>
                {/* Header Card */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, fontSize: "28px" }}>{recipe.title}</Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                {recipe.cuisine && (
                                    <Chip
                                        size="small"
                                        label={recipe.cuisine}
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                                <Chip
                                    size="small"
                                    label={recipe.difficulty}
                                    sx={{
                                        backgroundColor: getDifficultyColor(recipe.difficulty),
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">{recipe.totalTimeMinutes} min</Typography>
                                <Typography variant="body2" color="text.secondary">•</Typography>
                                <Typography variant="body2" color="text.secondary">{recipe.totalIngredients} ingredients</Typography>
                            </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            {session.status === 'running' ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => dispatch(pause())}
                                    sx={{ borderRadius: '50px', textTransform: 'capitalize', fontWeight: 600 }}
                                >
                                    Pause
                                </Button>
                            ) : session.status === 'paused' ? (
                                <Button
                                    variant="contained"
                                    onClick={() => dispatch(resume())}
                                    sx={{ borderRadius: '50px', textTransform: 'capitalize', fontWeight: 600 }}
                                >
                                    Resume
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={ensureStarted}
                                    sx={{ borderRadius: '50px', textTransform: 'capitalize', fontWeight: 600 }}
                                >
                                    Start
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => dispatch(stop({ recipe }))}
                                sx={{ borderRadius: '50px', textTransform: 'capitalize', fontWeight: 600 }}
                            >
                                Stop
                            </Button>
                            <Button
                                variant="text"
                                onClick={() => { dispatch(resetSession()); navigate('/'); }}
                                sx={{ borderRadius: '50px', textTransform: 'capitalize' }}
                            >
                                Exit
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Progress Section */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>Overall Progress</Typography>
                    <LinearProgress
                        variant="determinate"
                        value={totalProgress}
                        sx={{
                            height: 8,
                            borderRadius: '50px',
                            backgroundColor: 'rgb(246, 250, 251)',
                        }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {Math.round(totalProgress)}% complete
                    </Typography>
                </Paper>

                {/* Current Step */}
                {active && currentStep && (
                    <Paper sx={{ p: 4, mb: 3, borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px', textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>Step {active.stepIndex + 1} / {recipe.steps.length}</Typography>
                        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 400 }}>{currentStep.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box position="relative" display="inline-flex">
                                <CircularProgress
                                    variant="determinate"
                                    value={stepProgress}
                                    size={120}
                                    thickness={4}
                                    sx={{ color: 'primary.main' }}
                                />
                                <Box
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    position="absolute"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{formatMs(stepRemaining)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Stack spacing={1} alignItems="center">
                            <Chip size="small" label={currentStep.type} variant="outlined" />
                            {currentStep.type === 'cooking' && currentStep.cookingSettings && (
                                <Typography variant="body2" color="text.secondary">
                                    {currentStep.cookingSettings.temperatureC}°C • Speed {currentStep.cookingSettings.speed}/5
                                </Typography>
                            )}
                        </Stack>
                        {session.status === 'completed' && (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: '#4caf50' }}>🎉 Session Completed!</Typography>
                                <Typography variant="body2" color="text.secondary">Great job! Your recipe is ready.</Typography>
                            </Paper>
                        )}
                    </Paper>
                )}

                {/* Recipe Details */}
                <Paper sx={{ p: 4, mb: 3, borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}>Recipe Details</Typography>

                    {/* Ingredients Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>Ingredients</Typography>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 1.5
                        }}>
                            {recipe.ingredients.map((ing) => (
                                <Box
                                    key={ing.id}
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: 'rgb(246, 250, 251)',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{ing.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ing.quantity} {ing.unit}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Steps Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>Steps</Typography>
                        <Stack spacing={2}>
                            {recipe.steps.map((step, idx) => (
                                <Paper
                                    key={step.id}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: active && active.stepIndex === idx ? 'primary.main' : 'divider',
                                        backgroundColor: active && active.stepIndex === idx ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <Chip size="small" label={`#${idx + 1}`} sx={{ fontWeight: 600 }} />
                                        <Chip size="small" label={step.type} variant="outlined" />
                                        <Typography variant="body2" color="text.secondary">{step.durationSeconds} sec</Typography>
                                        {active && active.stepIndex === idx && (
                                            <Chip size="small" label="Current" color="primary" />
                                        )}
                                    </Stack>
                                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>{step.description}</Typography>
                                    {step.type === 'instruction' && step.ingredientIds && step.ingredientIds.length > 0 && (
                                        <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: 'rgb(246, 250, 251)', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                                                Ingredients:
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                                {step.ingredientIds.map(id => {
                                                    const ing = recipe.ingredients.find(i => i.id === id);
                                                    return ing ? `${ing.name} (${ing.quantity} ${ing.unit})` : id;
                                                }).filter(Boolean).join(', ')}
                                            </Typography>
                                        </Box>
                                    )}
                                    {step.type === 'cooking' && step.cookingSettings && (
                                        <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: 'rgb(246, 250, 251)', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                                <strong>Temperature:</strong> {step.cookingSettings.temperatureC}°C • <strong>Speed:</strong> {step.cookingSettings.speed}/5
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            ))}

                        </Stack>
                    </Box>
                </Paper>

                {session.status === 'completed' && (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: '#4caf50' }}>🎉 Session Completed!</Typography>
                        <Typography variant="body2" color="text.secondary">Great job! Your recipe is ready.</Typography>
                    </Paper>
                )}

                {!active && (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 25px 0px' }}>
                        <Typography color="text.secondary">Press "Start" to begin the cooking session.</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}


