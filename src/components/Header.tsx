import {
  Avatar,
  Box,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Popover,
  SegmentedControl,
  Tooltip,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';
import { match } from 'ts-pattern';

import { queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';
import { useColorScheme } from '../providers/ColorSchemeProvider';

import { ProfileEditDialog } from './ProfileEditDialog';
import { RouterLink } from './RouterLink';

export const Header: FC = () => {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();

  const [themeOpen, setThemeOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const user = useQuery(queryUser);
  const profile = useQuery(queryProfile);

  const avatarUrl =
    profile.data != null && user.data != null ? resolveProfileAvatarUrl(profile.data, user.data) : undefined;
  const avatarAlt = profile.data?.name ?? '';
  const avatarInitial = avatarAlt.trim().charAt(0).toUpperCase() || '?';

  const handleProfileOpen = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    navigate({ to: '/sign-out' });
  };

  const themeIcon = match(mode)
    .with('light', () => <Sun size={20} />)
    .with('system', () => <Monitor size={20} />)
    .with('dark', () => <Moon size={20} />)
    .exhaustive();

  return (
    <>
      <Box asChild className="app-header">
        <header>
          <Flex align="center" gap="4" px="4" py="3">
            <RouterLink color="gray" highContrast style={{ marginRight: '0.5rem', textDecoration: 'none' }} to="/home">
              <Heading size="3">D&D Encounter Runner</Heading>
            </RouterLink>
            <Flex gap="4">
              <RouterLink
                activeOptions={{ includeSearch: false }}
                activeProps={{ style: { fontWeight: 700, textDecoration: 'underline' } }}
                color="gray"
                highContrast
                style={{ textDecoration: 'none' }}
                to="/campaigns"
              >
                Campaigns
              </RouterLink>
              <RouterLink
                activeOptions={{ includeSearch: false }}
                activeProps={{ style: { fontWeight: 700, textDecoration: 'underline' } }}
                color="gray"
                highContrast
                style={{ textDecoration: 'none' }}
                to="/characters"
              >
                Characters
              </RouterLink>
            </Flex>
            <Box flexGrow="1" />
            <Flex align="center" gap="1">
              <Popover.Root onOpenChange={setThemeOpen} open={themeOpen}>
                <Popover.Trigger>
                  <IconButton aria-label="Theme" color="gray" highContrast variant="ghost">
                    {themeIcon}
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content>
                  <SegmentedControl.Root
                    onValueChange={value => {
                      if (value === 'light' || value === 'dark' || value === 'system') {
                        setMode(value);
                      }
                    }}
                    value={mode}
                  >
                    <SegmentedControl.Item aria-label="Light mode" value="light">
                      <Sun size={20} />
                    </SegmentedControl.Item>
                    <SegmentedControl.Item aria-label="System mode" value="system">
                      <Monitor size={20} />
                    </SegmentedControl.Item>
                    <SegmentedControl.Item aria-label="Dark mode" value="dark">
                      <Moon size={20} />
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                </Popover.Content>
              </Popover.Root>
              <DropdownMenu.Root>
                <Tooltip content="Account">
                  <DropdownMenu.Trigger>
                    <IconButton aria-label="Account menu" color="gray" highContrast radius="full" variant="ghost">
                      <Avatar alt={avatarAlt} fallback={avatarInitial} radius="full" size="2" src={avatarUrl} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                </Tooltip>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item onSelect={handleProfileOpen}>Profile</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={handleLogout}>Logout</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Flex>
        </header>
      </Box>
      <ProfileEditDialog onClose={handleProfileDialogClose} open={profileDialogOpen} />
    </>
  );
};
