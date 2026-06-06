import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import type { FC } from 'react';

import { RouterLink } from './RouterLink';
import { ThemeModeMenu } from './ThemeModeMenu';
import { UserAvatar } from './UserAvatar';

export const PrivateHeader: FC = () => (
  <>
    <AppBar position="fixed">
      <Toolbar>
        <RouterLink
          activeOptions={{ exact: true, includeSearch: false }}
          color="inherit"
          sx={{ mr: 3, textDecoration: 'none' }}
          to="/dashboard"
          underline="none"
        >
          <Typography component="h1" variant="h6">
            D&D Encounter Runner
          </Typography>
        </RouterLink>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <RouterLink
            activeOptions={{ includeSearch: false }}
            activeProps={{ sx: { fontWeight: 700, textDecoration: 'underline' } }}
            color="inherit"
            to="/dashboard/campaigns"
            underline="hover"
          >
            Campaigns
          </RouterLink>
          <RouterLink
            activeOptions={{ includeSearch: false }}
            activeProps={{ sx: { fontWeight: 700, textDecoration: 'underline' } }}
            color="inherit"
            to="/dashboard/characters"
            underline="hover"
          >
            Characters
          </RouterLink>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <ThemeModeMenu />
          <UserAvatar />
        </Box>
      </Toolbar>
    </AppBar>
    <Toolbar />
  </>
);
