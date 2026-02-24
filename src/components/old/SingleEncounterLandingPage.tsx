import Box from '@mui/material/Box';
import type { FC } from 'react';

import { ActionRecorder } from './ActionRecorder';
import { CharacterList } from './CharacterList';
import { ConditionManager } from './ConditionManager';
import { EncounterSetup } from './EncounterSetup';
import { RemindersDisplay } from './RemindersDisplay';

export const SingleEncounterLandingPage: FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 4 }}>
      <EncounterSetup />
      <CharacterList />
      <ConditionManager />
      <ActionRecorder />
      <RemindersDisplay />
    </Box>
  );
};
