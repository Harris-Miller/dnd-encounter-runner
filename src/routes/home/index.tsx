import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryProfile } from '../../api/profile';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const HomePage: FC = () => {
  const { data: profile } = useQuery(queryProfile);
  const displayName = profile?.name ?? 'there';

  return (
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ mb: 1 }} variant="h4">
          Welcome, {displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }} variant="body1">
          Run combat encounters and manage your party from here.
        </Typography>
      </Box>

      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
        <Card sx={{ flex: 1 }} variant="outlined">
          <RouterLink sx={{ color: 'inherit', textDecoration: 'none' }} to="/encounter">
            <CardActionArea>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <ShieldIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h6">Encounters</Typography>
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
                      Create and run combat encounters
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </RouterLink>
        </Card>

        <Card sx={{ flex: 1 }} variant="outlined">
          <RouterLink sx={{ color: 'inherit', textDecoration: 'none' }} to="/characters">
            <CardActionArea>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <GroupsIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h6">Characters</Typography>
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
                      Manage player characters and stats
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </RouterLink>
        </Card>
      </Stack>
    </Stack>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomePage,
  loader: async () => {
    await queryClient.ensureQueryData(queryProfile);
  },
});
