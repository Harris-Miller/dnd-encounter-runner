import { Box, Button, Typography } from '@mui/material';
import type { FC } from 'react';

import { FullScreenCenter } from './FullScreenCenter';
import { RouterLink } from './RouterLink';

export const NotFoundPage: FC = () => (
  <FullScreenCenter>
    <Box sx={{ px: 2, textAlign: 'center' }}>
      <Typography component="h1" sx={{ fontWeight: 700, mb: 1 }} variant="h3">
        404
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
        This page does not exist or the resource could not be found.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go home
      </Button>
    </Box>
  </FullScreenCenter>
);
