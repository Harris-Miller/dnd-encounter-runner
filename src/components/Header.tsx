import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
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

  return (
    <>
      <header className="app-header">
        <div className="app-header-toolbar">
          <RouterLink style={{ color: 'inherit', marginRight: '1.5rem', textDecoration: 'none' }} to="/home">
            <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>D&D Encounter Runner</h1>
          </RouterLink>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <RouterLink
              activeOptions={{ includeSearch: false }}
              activeProps={{ style: { fontWeight: 700, textDecoration: 'underline' } }}
              style={{ color: 'inherit', textDecoration: 'none' }}
              to="/campaigns"
            >
              Campaigns
            </RouterLink>
            <RouterLink
              activeOptions={{ includeSearch: false }}
              activeProps={{ style: { fontWeight: 700, textDecoration: 'underline' } }}
              style={{ color: 'inherit', textDecoration: 'none' }}
              to="/characters"
            >
              Characters
            </RouterLink>
          </nav>
          <span style={{ flexGrow: 1 }} />
          <div style={{ alignItems: 'center', display: 'flex', gap: '0.25rem' }}>
            <Popover.Root onOpenChange={setThemeOpen} open={themeOpen}>
              <Popover.Trigger asChild>
                <button aria-label="Theme" type="button">
                  {match(mode)
                    .with('light', () => <Sun size={20} />)
                    .with('system', () => <Monitor size={20} />)
                    .with('dark', () => <Moon size={20} />)
                    .exhaustive()}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="radix-popover-content" sideOffset={4}>
                  <ToggleGroup.Root
                    aria-label="Color scheme"
                    className="radix-toggle-group"
                    onValueChange={value => {
                      if (value === 'light' || value === 'dark' || value === 'system') {
                        setMode(value);
                      }
                    }}
                    type="single"
                    value={mode}
                  >
                    <ToggleGroup.Item aria-label="Light mode" className="radix-toggle-item" value="light">
                      <Sun size={20} />
                    </ToggleGroup.Item>
                    <ToggleGroup.Item aria-label="System mode" className="radix-toggle-item" value="system">
                      <Monitor size={20} />
                    </ToggleGroup.Item>
                    <ToggleGroup.Item aria-label="Dark mode" className="radix-toggle-item" value="dark">
                      <Moon size={20} />
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <DropdownMenu.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <DropdownMenu.Trigger asChild>
                    <button
                      aria-label="Account menu"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      type="button"
                    >
                      <Avatar.Root className="radix-avatar-root">
                        <Avatar.Image alt={avatarAlt} className="radix-avatar-image" src={avatarUrl} />
                        <Avatar.Fallback className="radix-avatar-fallback" delayMs={300}>
                          {avatarInitial}
                        </Avatar.Fallback>
                      </Avatar.Root>
                    </button>
                  </DropdownMenu.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                    Account
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="radix-dropdown-content" sideOffset={4}>
                  <DropdownMenu.Item className="radix-dropdown-item" onSelect={handleProfileOpen}>
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="radix-dropdown-item" onSelect={handleLogout}>
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>
      <ProfileEditDialog onClose={handleProfileDialogClose} open={profileDialogOpen} />
    </>
  );
};
