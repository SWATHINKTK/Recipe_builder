import { createTheme } from '@mui/material/styles';

// Approximate brand-inspired colors; adjust to your preference
const primaryMain = '#ff5900'; // vibrant carrot-orange
const primaryDark = '#CC4700';
const primaryLight = '#FF7A2A';
const secondaryMain = '#4b5563'; // deep slate-blue accent
const secondaryDark = '#4b5563';
const secondaryLight = '#4b5563';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      dark: primaryDark,
      light: primaryLight
    },
    secondary: {
      main: secondaryMain,
      dark: secondaryDark,
      light: secondaryLight
    },
    background: {
      default: '#FFF9F5',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: primaryMain
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg'
      }
    }
  }
});

export default appTheme;


