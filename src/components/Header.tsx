import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';

import { queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';

import { ProfileEditDialog } from './ProfileEditDialog';
import { RouterLink } from './RouterLink';
import { ThemeModeMenu } from './ThemeModeMenu';

export const Header: FC = () => {
  const navigate = useNavigate();

  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const user = useQuery(queryUser);
  const profile = useQuery(queryProfile);

  const avatarUrl =
    profile.data != null && user.data != null ? resolveProfileAvatarUrl(profile.data, user.data) : undefined;
  const avatarAlt = profile.data?.name ?? '';

  const handleAvatarOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleProfileOpen = () => {
    handleAvatarClose();
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    handleAvatarClose();
    navigate({ to: '/sign-out' });
  };

  const avatarMenuOpen = Boolean(avatarAnchorEl);

  return (
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
            <Tooltip title="Account">
              <IconButton onClick={handleAvatarOpen} sx={{ p: 0 }}>
                <Avatar alt={avatarAlt} src={avatarUrl} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={avatarAnchorEl}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              onClose={handleAvatarClose}
              open={avatarMenuOpen}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
            >
              <MenuItem onClick={handleProfileOpen}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <ProfileEditDialog onClose={handleProfileDialogClose} open={profileDialogOpen} />
      <Toolbar />
    </>
  );
};
