import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { queryUser } from '../../api/user';
import { RouterLink } from '../RouterLink';

export const FinalCtaSection: FC = () => {
  const user = useQuery(queryUser);
  const isSignedIn = user.data != null;

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
          {isSignedIn ? (
            <Button color="primary" component={RouterLink} size="medium" to="/dashboard" variant="contained">
              Go to Dashboard
            </Button>
          ) : (
            <Button color="primary" component={RouterLink} size="medium" to="/sign-up" variant="contained">
              Sign Up Free
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
