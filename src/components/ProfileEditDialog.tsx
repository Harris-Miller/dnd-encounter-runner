import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { ChangeEvent, FC, MouseEvent } from 'react';

import { uploadAvatar } from '../api/avatar';
import {
  mutateUpdateProfile,
  mutateUpdateProfileAfterUpload,
  mutateUpdateProfileAvatarSource,
  queryProfile,
} from '../api/profile';
import type { Profile, ProfileAvatarSource } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../lib/resolveProfileAvatarUrl';

type ProfileEditDialogProps = {
  onClose: () => void;
  open: boolean;
};

type ProfileEditFormProps = {
  onClose: () => void;
  profileData: Profile;
};

const ProfileEditForm: FC<ProfileEditFormProps> = ({ onClose, profileData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useQuery(queryUser);

  const [draftName, setDraftName] = useState(profileData.name ?? '');
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);
  const [draftAvatarSource, setDraftAvatarSource] = useState<ProfileAvatarSource>(profileData.avatar_source);
  const [formError, setFormError] = useState<string | null>(null);

  const updateNameMutation = useMutation(mutateUpdateProfile);
  const updateAvatarSourceMutation = useMutation(mutateUpdateProfileAvatarSource);
  const updateAfterUploadMutation = useMutation(mutateUpdateProfileAfterUpload);

  const isPending =
    updateNameMutation.isPending || updateAvatarSourceMutation.isPending || updateAfterUploadMutation.isPending;

  const mutationError =
    formError ??
    updateNameMutation.error?.message ??
    updateAvatarSourceMutation.error?.message ??
    updateAfterUploadMutation.error?.message ??
    null;

  const handleCancel = () => {
    if (pendingAvatarPreviewUrl != null) {
      URL.revokeObjectURL(pendingAvatarPreviewUrl);
    }

    onClose();
  };

  const trimmedName = draftName.trim();
  const isNameValid = trimmedName !== '';
  const hasUploadedAvatar = profileData.uploaded_avatar_id != null || pendingAvatarFile != null;

  const previewAvatarUrl = (() => {
    if (pendingAvatarPreviewUrl != null && draftAvatarSource === 'uploaded') {
      return pendingAvatarPreviewUrl;
    }

    if (user.data == null) {
      return undefined;
    }

    return resolveProfileAvatarUrl({ ...profileData, avatar_source: draftAvatarSource }, user.data);
  })();

  const handleAvatarSourceChange = (_event: MouseEvent<HTMLElement>, nextAvatarSource: ProfileAvatarSource | null) => {
    if (nextAvatarSource == null) {
      return;
    }

    setDraftAvatarSource(nextAvatarSource);
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile == null) {
      return;
    }

    if (pendingAvatarPreviewUrl != null) {
      URL.revokeObjectURL(pendingAvatarPreviewUrl);
    }

    setPendingAvatarFile(selectedFile);
    setPendingAvatarPreviewUrl(URL.createObjectURL(selectedFile));
    setDraftAvatarSource('uploaded');
    event.target.value = '';
  };

  const handleUpdate = async () => {
    if (!isNameValid || user.data == null) {
      return;
    }

    setFormError(null);

    const nameChanged = trimmedName !== (profileData.name ?? '');
    const avatarSourceChanged = draftAvatarSource !== profileData.avatar_source;

    try {
      if (pendingAvatarFile != null) {
        const uploadedAvatarId = await uploadAvatar(pendingAvatarFile);
        await updateAfterUploadMutation.mutateAsync({
          avatarSource: 'uploaded',
          uploadedAvatarId,
        });
      } else if (avatarSourceChanged) {
        await updateAvatarSourceMutation.mutateAsync({ avatarSource: draftAvatarSource });
      }

      if (nameChanged) {
        await updateNameMutation.mutateAsync({ name: trimmedName });
      }

      if (pendingAvatarPreviewUrl != null) {
        URL.revokeObjectURL(pendingAvatarPreviewUrl);
      }

      onClose();
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Profile update failed');
    }
  };

  return (
    <>
      <DialogContent>
        {mutationError != null ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {mutationError}
          </Typography>
        ) : null}
        <Stack spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
          <Avatar alt={trimmedName} src={previewAvatarUrl} sx={{ height: 96, width: 96 }} />
          <input accept="image/*" hidden onChange={handleFileChange} ref={fileInputRef} type="file" />
          <Button onClick={handlePhotoButtonClick} startIcon={<PhotoCameraIcon />} variant="outlined">
            Change photo
          </Button>
          <ToggleButtonGroup
            color="primary"
            exclusive
            onChange={handleAvatarSourceChange}
            size="small"
            value={draftAvatarSource}
          >
            <ToggleButton value="oauth">OAuth</ToggleButton>
            <ToggleButton disabled={!hasUploadedAvatar} value="uploaded">
              Uploaded
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
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
      </DialogContent>
      <DialogActions>
        <Button disabled={isPending} onClick={handleCancel}>
          Cancel
        </Button>
        <Button disabled={!isNameValid || isPending || user.isPending} onClick={handleUpdate} variant="contained">
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
