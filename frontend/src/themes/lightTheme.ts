import { createTheme } from '@mui/material/styles';
import paletteComponents from './paletteComponents';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: paletteComponents.primary[600] },
    secondary: { main: paletteComponents.secondary[600] },
    tertiary: { main: paletteComponents.tertiary[600] },
    searchbox: {
      main: paletteComponents.tertiary[700],
      light: paletteComponents.tertiary[300],
      dark: paletteComponents.tertiary[900],
      contrastText: paletteComponents.neutral[300],
    },
    highlight: {
      main: paletteComponents.neutral[300],
      light: paletteComponents.neutral[200],
      dark: paletteComponents.neutral[400],
      contrastText: paletteComponents.neutral[800],
    },
    background: {
      default: paletteComponents.neutral[400],
      paper: paletteComponents.neutral[500],
    },
    text: {
      primary: paletteComponents.neutral[800],
      secondary: paletteComponents.neutral[700],
      branda: paletteComponents.primary[500],
      brandb: paletteComponents.secondary[700],
      brandc: paletteComponents.tertiary[700],
      searchbox: paletteComponents.tertiary[700],
    },
    error: { main: paletteComponents.red[500] },
    warning: { main: paletteComponents.orange[500] },
    info: { main: paletteComponents.blue[500] },
    success: { main: paletteComponents.green[500] },
    divider: paletteComponents.neutral[600],
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Poppins", serif' },
    h2: { fontFamily: '"Poppins", serif' },
    h3: { fontFamily: '"Poppins", serif' },
    h4: { fontFamily: '"Poppins", serif' },
    h5: { fontFamily: '"Poppins", serif' },
    h6: { fontFamily: '"Poppins", serif' },

    subtitle1: { fontFamily: '"Poppins", serif' },
    subtitle2: { fontFamily: '"Poppins", serif' },

    body1: { fontFamily: '"Inter", sans-serif' },
    body2: { fontFamily: '"Inter", sans-serif' },

    button: { fontFamily: '"Inter", sans-serif' },
    caption: { fontFamily: '"Inter", sans-serif' },
    overline: { fontFamily: '"Inter", sans-serif' },
  },
});

export default lightTheme;