import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

import { Button } from './ui/Button';
import { Stack } from './ui/Stack';
import { Typography } from './ui/Typography';

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
