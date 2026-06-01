import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Users } from 'lucide-react';
import type { FC } from 'react';

import { queryProfile } from '../../api/profile';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const HomePage: FC = () => {
  const { data: profile } = useQuery(queryProfile);
  const displayName = profile?.name ?? 'there';

  return (
    <Flex direction="column" gap="6">
      <Box>
        <Heading mb="2" size="6">
          Welcome, {displayName}
        </Heading>
        <Text color="gray" size="3">
          Organize campaigns and manage your party from here.
        </Text>
      </Box>

      <Flex gap="4" wrap="wrap">
        <Card asChild size="3" style={{ flex: '1 1 16rem', maxWidth: '100%' }} variant="surface">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/campaigns">
            <Flex align="center" gap="4" p="4">
              <BookOpen color="var(--red-9)" size={32} />
              <Box>
                <Heading mb="1" size="4">
                  Campaigns
                </Heading>
                <Text color="gray" size="2">
                  Organize characters and encounters by campaign
                </Text>
              </Box>
            </Flex>
          </RouterLink>
        </Card>

        <Card asChild size="3" style={{ flex: '1 1 16rem', maxWidth: '100%' }} variant="surface">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/characters">
            <Flex align="center" gap="4" p="4">
              <Users color="var(--red-9)" size={32} />
              <Box>
                <Heading mb="1" size="4">
                  Characters
                </Heading>
                <Text color="gray" size="2">
                  Manage player characters and stats
                </Text>
              </Box>
            </Flex>
          </RouterLink>
        </Card>
      </Flex>
    </Flex>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomePage,
  loader: async () => {
    await queryClient.ensureQueryData(queryProfile);
  },
});
