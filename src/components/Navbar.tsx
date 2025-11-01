import { Container, Paper, Stack, Typography, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Navbar() {
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/' ;
    return location.pathname.startsWith(path);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ py: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <RestaurantMenuIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                fontSize: '24px',
                background: 'linear-gradient(135deg, #ff5900 0%, #FF7A2A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Upliance.ai
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button 
              component={Link} 
              to="/"
              startIcon={<RestaurantMenuIcon />}
              sx={{
                borderRadius: '50px',
                textTransform: 'capitalize',
                fontWeight: 600,
                px: 3,
                py: 1,
                color: isActiveRoute('/') ? 'primary.main' : 'text.secondary',
                backgroundColor: isActiveRoute('/') ? 'rgba(255, 89, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 89, 0, 0.08)',
                },
              }}
            >
              Recipes
            </Button>
            <Button 
              variant="contained"
              component={Link} 
              to="/create"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                borderRadius: '50px',
                textTransform: 'capitalize',
                fontWeight: 600,
                px: 4,
                py: 1,
                backgroundColor: 'primary.main',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 'none',
                },
              }}
            >
              Create Recipe
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Paper>
  );
}

