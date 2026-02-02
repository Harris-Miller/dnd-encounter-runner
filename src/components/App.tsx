import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { FC } from 'react';

import { ActionRecorder } from './ActionRecorder';
import { CharacterList } from './CharacterList';
import { ConditionManager } from './ConditionManager';
import { EncounterSetup } from './EncounterSetup';
import { Header } from './Header';
import { RemindersDisplay } from './RemindersDisplay';

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 4 }}>
          <EncounterSetup />
          <CharacterList />
          <ConditionManager />
          <ActionRecorder />
          <RemindersDisplay />
        </Box>
      </Container>
    </ThemeProvider>
  );
};
