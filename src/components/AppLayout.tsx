import { Box, Container } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface AppLayoutProps {
  header: ReactNode;
}

export const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, header }) => {
  const content = children ?? <Outlet />;

  return (
    <>
      {header}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ marginTop: 9 }}>
          {content}
        </Container>
      </Box>
    </>
  );
};
