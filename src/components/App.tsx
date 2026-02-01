import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

import { Header } from './Header';

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
        <Box sx={{ my: 4 }}>
          <Typography variant="body1">Welcome to your new project!</Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
