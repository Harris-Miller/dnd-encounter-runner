import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RouterProvider } from '@tanstack/react-router';
import type { FC } from 'react';

import { router } from '../router';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
