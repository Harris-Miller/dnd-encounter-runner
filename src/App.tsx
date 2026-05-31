import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { FC } from 'react';

import { Router } from './router';
import { theme } from './theme';

export const App: FC = () => {
  return (
    <ThemeProvider noSsr theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};
