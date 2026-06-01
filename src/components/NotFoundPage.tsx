import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

import { Button } from './compat/Button';
import { Stack } from './compat/Stack';
import { Typography } from './compat/Typography';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" spacing={2} style={{ padding: 48, textAlign: 'center' }}>
      <Typography variant="h4">Page not found</Typography>
      <Typography className="text-secondary" variant="body1">
        The page you are looking for does not exist.
      </Typography>
      <Button
        onClick={() => {
          navigate({ to: '/home' });
        }}
        variant="contained"
      >
        Go home
      </Button>
    </Stack>
  );
};
