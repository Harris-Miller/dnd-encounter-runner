import { Box, Container } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface AppLayoutProps {
  contained?: boolean;
  footer?: ReactNode;
  header: ReactNode;
}

export const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, contained = false, footer, header }) => {
  const content = children ?? <Outlet />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {header}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {contained ? (
          <Container maxWidth="xl" sx={{ marginTop: 9 }}>
            {content}
          </Container>
        ) : (
          content
        )}
      </Box>
      {footer}
    </Box>
  );
};
