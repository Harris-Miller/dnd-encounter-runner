import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import {
  AppBar,
  Avatar,
  Box,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { match } from 'ts-pattern';

import { queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';

import { ProfileEditDialog } from './ProfileEditDialog';
import { RouterLink } from './RouterLink';

export const Header: FC = () => {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();

  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const user = useQuery(queryUser);
  const profile = useQuery(queryProfile);

  const avatarUrl =
    profile.data != null && user.data != null ? resolveProfileAvatarUrl(profile.data, user.data) : undefined;
  const avatarAlt = profile.data?.name ?? '';

  const handleThemeOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleThemeClose = () => {
    setThemeAnchorEl(null);
  };

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

  const themeOpen = Boolean(themeAnchorEl);
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
              to="/campaigns"
              underline="hover"
            >
              Campaigns
            </RouterLink>
            <RouterLink
              activeOptions={{ includeSearch: false }}
              activeProps={{ sx: { fontWeight: 700, textDecoration: 'underline' } }}
              color="inherit"
              to="/characters"
              underline="hover"
            >
              Characters
            </RouterLink>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <IconButton color="inherit" onClick={handleThemeOpen}>
              {match(mode!)
                .with('light', () => <LightModeIcon />)
                .with('system', () => <SettingsBrightnessIcon />)
                .with('dark', () => <DarkModeIcon />)
                .exhaustive()}
            </IconButton>
            <Popover
              anchorEl={themeAnchorEl}
              anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom',
              }}
              onClose={handleThemeClose}
              open={themeOpen}
              transformOrigin={{
                horizontal: 'center',
                vertical: 'top',
              }}
            >
              <ButtonGroup aria-label="Basic button group" variant="contained">
                <IconButton
                  onClick={() => {
                    setMode('light');
                  }}
                >
                  <LightModeIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setMode('system');
                  }}
                >
                  <SettingsBrightnessIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setMode('dark');
                  }}
                >
                  <DarkModeIcon />
                </IconButton>
              </ButtonGroup>
            </Popover>
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
