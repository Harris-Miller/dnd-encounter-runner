import { AppBar, Box, Button, Container, styled, Toolbar, Typography } from '@mui/material';
import type { FC } from 'react';

import dndLogo from '../../assets/dnd-logo.svg';
import { useOptionalUser } from '../../hooks/useOptionalUser';
import { RouterLink } from '../RouterLink';
import { ThemeModeMenu } from '../ThemeModeMenu';

const Img = styled('img')();

const PUBLIC_NAV_LINKS: readonly { label: string; to: string }[] = [];

export const PublicHeader: FC = () => {
  const user = useOptionalUser();
  const isSignedIn = user != null;

  return (
    <AppBar color="default" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <RouterLink
            activeOptions={{ exact: true, includeSearch: false }}
            color="inherit"
            sx={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 1.5, mr: 2, textDecoration: 'none' }}
            to="/"
            underline="none"
          >
            <Img
              alt="D&D Logo"
              src={dndLogo}
              sx={{
                display: 'block',
                flexShrink: 0,
                height: '1.75em',
                width: 'auto',
              }}
            />
            <Typography component="h1" sx={{ display: { sm: 'block', xs: 'none' } }} variant="h6">
              D&D Encounter Runner
            </Typography>
          </RouterLink>

          <Box sx={{ display: { md: 'flex', xs: 'none' }, gap: 2 }}>
            {PUBLIC_NAV_LINKS.map(link => (
              <RouterLink
                activeOptions={{ includeSearch: false }}
                activeProps={{ sx: { fontWeight: 700, textDecoration: 'underline' } }}
                color="inherit"
                key={link.to}
                to={link.to}
                underline="hover"
              >
                {link.label}
              </RouterLink>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
            <ThemeModeMenu />
            {isSignedIn ? (
              <Button color="primary" component={RouterLink} to="/dashboard" variant="contained">
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  sx={{ display: { sm: 'inline-flex', xs: 'none' } }}
                  to="/sign-in"
                >
                  Sign In
                </Button>
                <Button color="primary" component={RouterLink} to="/sign-up" variant="contained">
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
