import { Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';

import { queryUserProfile } from '../api/userProfile';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';

import { ProfileEditDialog } from './ProfileEditDialog';

export const UserAvatar: FC = () => {
  const navigate = useNavigate();

  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const userProfile = useQuery(queryUserProfile);

  const avatarUrl = userProfile.data != null ? resolveProfileAvatarUrl(userProfile.data, userProfile.data) : undefined;
  const avatarAlt = userProfile.data?.name ?? '';

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
      <ProfileEditDialog onClose={handleProfileDialogClose} open={profileDialogOpen} />
    </>
  );
};
