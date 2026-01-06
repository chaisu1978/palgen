import { createTheme } from '@mui/material/styles';
import paletteComponents from './paletteComponents';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: paletteComponents.primary[800], },
    secondary: { main: paletteComponents.secondary[800] },
    tertiary: { main: paletteComponents.tertiary[800] },
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
      default: paletteComponents.neutral[700],
      paper: paletteComponents.neutral[800],
    },
    text: {
      primary: paletteComponents.neutral[300],
      secondary: paletteComponents.neutral[400],
      branda: paletteComponents.primary[100],
      brandb: paletteComponents.secondary[100],
      brandc: paletteComponents.tertiary[100],
      searchbox: paletteComponents.tertiary[100],
    },
    error: { main: paletteComponents.red[600] },
    warning: { main: paletteComponents.orange[600] },
    info: { main: paletteComponents.blue[600] },
    success: { main: paletteComponents.green[600] },
    divider: paletteComponents.neutral[700],
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
    overline: { fontFamily: '"Inter", sans-serif'},
  },
});

export default darkTheme;