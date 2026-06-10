import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { queryUserProfile } from '../../api/userProfile';
import { RouterLink } from '../RouterLink';

export const FinalCtaSection: FC = () => {
  const { data: user, isError, isLoading } = useQuery(queryUserProfile);
  const isSignedIn = !isLoading && !isError && user != null;

  const action = isLoading ? null : isSignedIn ? (
    <Button color="primary" component={RouterLink} size="medium" to="/dashboard" variant="contained">
      Go to Dashboard
    </Button>
  ) : (
    <Button color="primary" component={RouterLink} size="medium" to="/sign-up" variant="contained">
      Sign Up Free
    </Button>
  );

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        py: { md: 8, xs: 6 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography component="h3" variant="h4">
            Ready to roll initiative?
          </Typography>
          <Typography color="text.secondary" variant="body1">
            Create a free account and start running encounters in minutes. No credit card required.
          </Typography>
          {action}
        </Stack>
      </Container>
    </Box>
  );
};
