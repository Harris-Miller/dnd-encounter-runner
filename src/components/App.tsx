import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { FC } from 'react';

import { Header } from './Header';
import { LandingPage } from './LandingPage';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg">
        <LandingPage />
      </Container>
    </ThemeProvider>
  );
};
