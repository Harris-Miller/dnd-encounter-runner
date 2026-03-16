import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { FC } from 'react';

import { Router } from './router';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export const App: FC = () => {
  return (
    <ThemeProvider noSsr theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};
