import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Users } from 'lucide-react';
import type { FC } from 'react';

import { queryProfile } from '../../api/profile';
import { Box } from '../../components/compat/Box';
import { Card, CardActionArea, CardContent } from '../../components/compat/Card';
import { Stack } from '../../components/compat/Stack';
import { Typography } from '../../components/compat/Typography';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const HomePage: FC = () => {
  const { data: profile } = useQuery(queryProfile);
  const displayName = profile?.name ?? 'there';

  return (
    <Stack spacing={4}>
      <Box>
        <Typography style={{ marginBottom: 8 }} variant="h4">
          Welcome, {displayName}
        </Typography>
        <Typography className="text-secondary" variant="body1">
          Organize campaigns and manage your party from here.
        </Typography>
      </Box>

      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
        <Card className="flex-1" variant="outlined">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/campaigns">
            <CardActionArea>
              <CardContent>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <BookOpen color="var(--color-primary)" size={32} />
                  <Box>
                    <Typography variant="h6">Campaigns</Typography>
                    <Typography className="text-secondary" variant="body2">
                      Organize characters and encounters by campaign
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </RouterLink>
        </Card>

        <Card className="flex-1" variant="outlined">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/characters">
            <CardActionArea>
              <CardContent>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <Users color="var(--color-primary)" size={32} />
                  <Box>
                    <Typography variant="h6">Characters</Typography>
                    <Typography className="text-secondary" variant="body2">
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
