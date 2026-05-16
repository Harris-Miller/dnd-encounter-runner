import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateUpdateProfile, queryProfile } from '../api/profile';
import type { Profile } from '../api/profile';

type ProfileEditDialogProps = {
  onClose: () => void;
  open: boolean;
};

type ProfileEditFormProps = {
  onClose: () => void;
  profileData: Profile;
};

const ProfileEditForm: FC<ProfileEditFormProps> = ({ onClose, profileData }) => {
  const [draftName, setDraftName] = useState(profileData.name ?? '');
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(profileData.avatar_url ?? '');

  const updateMutation = useMutation({
    ...mutateUpdateProfile,
    onSuccess: () => {
      onClose();
    },
  });

  const handleCancel = () => {
    onClose();
  };

  const trimmedName = draftName.trim();
  const isNameValid = trimmedName !== '';

  const handleUpdate = () => {
    if (!isNameValid) {
      return;
    }

    updateMutation.mutate({ avatarUrl: draftAvatarUrl, name: trimmedName });
  };

  return (
    <>
      <DialogContent>
        {updateMutation.isError ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {updateMutation.error.message}
          </Typography>
        ) : null}
        <TextField
          autoFocus
          fullWidth
          label="Name"
          margin="dense"
          onChange={event => {
            setDraftName(event.target.value);
          }}
          value={draftName}
          variant="standard"
        />
        <TextField
          fullWidth
          label="Avatar URL"
          margin="dense"
          onChange={event => {
            setDraftAvatarUrl(event.target.value);
          }}
          value={draftAvatarUrl}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={updateMutation.isPending} onClick={handleCancel}>
          Cancel
        </Button>
        <Button disabled={!isNameValid || updateMutation.isPending} onClick={handleUpdate} variant="contained">
          Update
        </Button>
      </DialogActions>
    </>
  );
};

export const ProfileEditDialog: FC<ProfileEditDialogProps> = ({ onClose, open }) => {
  const profile = useQuery({ ...queryProfile, enabled: open });

  const handleCancel = () => {
    onClose();
  };

  const profileData = open ? profile.data : null;

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleCancel} open={open}>
      <DialogTitle>Edit Profile</DialogTitle>
      {profile.isError ? (
        <DialogContent>
          <Typography color="error">{profile.error.message}</Typography>
        </DialogContent>
      ) : null}
      {profileData != null ? <ProfileEditForm onClose={onClose} profileData={profileData} /> : null}
    </Dialog>
  );
};
