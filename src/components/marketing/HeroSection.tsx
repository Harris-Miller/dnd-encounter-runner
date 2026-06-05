import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { queryUser } from '../../api/user';
import { RouterLink } from '../RouterLink';

export const HeroSection: FC = () => {
  const { data: user, isError, isLoading } = useQuery(queryUser);
  const isSignedIn = !isLoading && !isError && user != null;

  const stackOptions = isLoading ? null : isSignedIn ? (
    <Button color="primary" component={RouterLink} size="medium" to="/dashboard" variant="contained">
      Go to Dashboard
    </Button>
  ) : (
    <Button color="primary" component={RouterLink} size="medium" to="/sign-in" variant="contained">
      Get Started
    </Button>
  );

  return (
    <Box
      sx={{
        pb: { md: 10, xs: 6 },
        pt: { md: 10, xs: 6 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography component="h2" sx={{ fontSize: { md: '3rem', xs: '2rem' }, fontWeight: 700, maxWidth: 720 }}>
            Run D&D encounters without the spreadsheet chaos
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600 }} variant="h6">
            Organize campaigns, track character stats, and run initiative-driven combat sessions — all in one place
            built for dungeon masters and players.
          </Typography>
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
            {stackOptions}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
