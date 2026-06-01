import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Flex align="center" direction="column" gap="4" p="9" style={{ textAlign: 'center' }}>
      <Heading size="8">Page not found</Heading>
      <Text color="gray" size="3">
        The page you are looking for does not exist.
      </Text>
      <Button
        onClick={() => {
          navigate({ to: '/home' });
        }}
        type="button"
      >
        Go home
      </Button>
    </Flex>
  );
};
