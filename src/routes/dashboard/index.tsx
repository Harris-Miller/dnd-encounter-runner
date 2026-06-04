import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GroupsIcon from '@mui/icons-material/Groups';
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryProfile } from '../../api/profile';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const DashboardPage: FC = () => {
  const { data: profile } = useQuery(queryProfile);
  const displayName = profile?.name ?? 'there';

  return (
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ mb: 1 }} variant="h4">
          Welcome, {displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }} variant="body1">
          Organize campaigns and manage your party from here.
        </Typography>
      </Box>

      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
        <Card sx={{ flex: 1 }} variant="outlined">
          <RouterLink sx={{ color: 'inherit', textDecoration: 'none' }} to="/dashboard/campaigns">
            <CardActionArea>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <AutoStoriesIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h6">Campaigns</Typography>
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
                      Organize characters and encounters by campaign
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </RouterLink>
        </Card>

        <Card sx={{ flex: 1 }} variant="outlined">
          <RouterLink sx={{ color: 'inherit', textDecoration: 'none' }} to="/dashboard/characters">
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

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryProfile);
  },
});
