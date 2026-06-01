import { Card, Flex, Heading } from '@radix-ui/themes';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryUser } from '../api/user';
import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

const IndexComponent: FC = () => {
  return (
    <FullScreenCenter>
      <Card size="4" style={{ maxWidth: '28rem', width: '100%' }}>
        <Flex align="center" direction="column" gap="4" p="5">
          <Heading align="center" size="7">
            <Flex align="center" gap="3" justify="center">
              <img
                alt="D&D Logo"
                src={dndLogo}
                style={{
                  display: 'block',
                  flexShrink: 0,
                  height: '1.75em',
                  width: 'auto',
                }}
              />
              Encounter Runner
            </Flex>
          </Heading>
          <RouterLink to="/sign-in">Login</RouterLink>
        </Flex>
      </Card>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session == null) {
      return;
    }

    try {
      await queryClient.prefetchQuery(queryUser);
    } catch {
      // TODO: this should _never_ happen. need to display an error page
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({
      to: '/home',
    });
  },
  component: IndexComponent,
});
