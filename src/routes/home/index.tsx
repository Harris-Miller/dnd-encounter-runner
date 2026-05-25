import { Box, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

const HomePage: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography variant="h5">Encounters</Typography>
    <Typography sx={{ color: 'text.secondary' }} variant="body2">
      Encounter list coming online soon.
    </Typography>
  </Box>
);

export const Route = createFileRoute('/home/')({
  component: HomePage,
});
