import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography component="h1" gutterBottom variant="h4">
            D&D Encounter Runner
          </Typography>
          <Typography variant="body1">Welcome to your new project!</Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
