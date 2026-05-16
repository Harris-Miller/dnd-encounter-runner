import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { FC } from 'react';

import { queryClient } from './queryClient';
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
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
