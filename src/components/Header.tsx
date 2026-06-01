import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { match } from 'ts-pattern';

import { queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';

import { ProfileEditDialog } from './ProfileEditDialog';
import { RouterLink } from './RouterLink';
import { AppBar, Toolbar } from './ui/AppBar';
import { Avatar } from './ui/Avatar';
import { Box } from './ui/Box';
import { ButtonGroup } from './ui/ButtonGroup';
import { useColorScheme } from './ui/ColorSchemeProvider';
import { IconButton } from './ui/IconButton';
import { Popover } from './ui/Popover';
import { Tooltip } from './ui/Tooltip';
import { Typography } from './ui/Typography';

export const Header: FC = () => {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();

  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLButtonElement | null>(null);
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

  const handleProfileOpen = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    navigate({ to: '/sign-out' });
  };

  const themeOpen = themeAnchorEl != null;

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <RouterLink className="nav-link" style={{ marginRight: 24, textDecoration: 'none' }} to="/home">
            <Typography component="h1" variant="h6">
              D&D Encounter Runner
            </Typography>
          </RouterLink>
          <Box style={{ display: 'flex', gap: 16 }}>
            <RouterLink
              activeOptions={{ includeSearch: false }}
              activeProps={{ className: 'nav-link nav-link-active' }}
              className="nav-link"
              to="/campaigns"
            >
              Campaigns
            </RouterLink>
            <RouterLink
              activeOptions={{ includeSearch: false }}
              activeProps={{ className: 'nav-link nav-link-active' }}
              className="nav-link"
              to="/characters"
            >
              Characters
            </RouterLink>
          </Box>
          <span className="toolbar-spacer" />
          <Box style={{ alignItems: 'center', display: 'flex' }}>
            <IconButton aria-label="Theme" onClick={handleThemeOpen} type="button">
              {match(mode)
                .with('light', () => <Sun size={20} />)
                .with('system', () => <Monitor size={20} />)
                .with('dark', () => <Moon size={20} />)
                .exhaustive()}
            </IconButton>
            <Popover anchorEl={themeAnchorEl} onClose={handleThemeClose} open={themeOpen}>
              <ButtonGroup aria-label="Color scheme">
                <IconButton
                  aria-label="Light mode"
                  onClick={() => {
                    setMode('light');
                  }}
                  type="button"
                >
                  <Sun size={20} />
                </IconButton>
                <IconButton
                  aria-label="System mode"
                  onClick={() => {
                    setMode('system');
                  }}
                  type="button"
                >
                  <Monitor size={20} />
                </IconButton>
                <IconButton
                  aria-label="Dark mode"
                  onClick={() => {
                    setMode('dark');
                  }}
                  type="button"
                >
                  <Moon size={20} />
                </IconButton>
              </ButtonGroup>
            </Popover>
            <DropdownMenu.Root>
              <Tooltip title="Account">
                <DropdownMenu.Trigger asChild>
                  <IconButton aria-label="Account menu" style={{ padding: 0 }} type="button">
                    <Avatar alt={avatarAlt} src={avatarUrl} />
                  </IconButton>
                </DropdownMenu.Trigger>
              </Tooltip>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="dropdown-content" sideOffset={4}>
                  <DropdownMenu.Item className="dropdown-item" onSelect={handleProfileOpen}>
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="dropdown-item" onSelect={handleLogout}>
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </Box>
        </Toolbar>
      </AppBar>
      <ProfileEditDialog onClose={handleProfileDialogClose} open={profileDialogOpen} />
      <Toolbar />
    </>
  );
};
