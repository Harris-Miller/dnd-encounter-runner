import * as Avatar from '@radix-ui/react-avatar';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import { uploadAvatar } from '../api/avatar';
import {
  mutateUpdateProfile,
  mutateUpdateProfileAfterUpload,
  mutateUpdateProfileAvatarSource,
  queryProfile,
} from '../api/profile';
import type { Profile, ProfileAvatarSource } from '../api/profile';
import { queryUser } from '../api/user';
import { resolveProfileAvatarUrl } from '../api/utils/resolveProfileAvatarUrl';

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
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<null | string>(null);
  const [draftAvatarSource, setDraftAvatarSource] = useState<ProfileAvatarSource>(profileData.avatar_source);
  const [formError, setFormError] = useState<null | string>(null);

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
  const avatarInitial = trimmedName.trim().charAt(0).toUpperCase() || '?';

  const previewAvatarUrl = (() => {
    if (pendingAvatarPreviewUrl != null && draftAvatarSource === 'uploaded') {
      return pendingAvatarPreviewUrl;
    }

    if (user.data == null) {
      return undefined;
    }

    return resolveProfileAvatarUrl({ ...profileData, avatar_source: draftAvatarSource }, user.data);
  })();

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
      {mutationError != null ? <p style={{ color: 'var(--color-error)', marginBottom: 16 }}>{mutationError}</p> : null}
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 16 }}>
        <Avatar.Root className="radix-avatar-root">
          <Avatar.Image alt={trimmedName} className="radix-avatar-image" src={previewAvatarUrl} />
          <Avatar.Fallback className="radix-avatar-fallback" delayMs={300}>
            {avatarInitial}
          </Avatar.Fallback>
        </Avatar.Root>
        <input accept="image/*" hidden onChange={handleFileChange} ref={fileInputRef} type="file" />
        <button
          onClick={handlePhotoButtonClick}
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
          type="button"
        >
          <Camera size={18} />
          Change photo
        </button>
        <ToggleGroup.Root
          aria-label="Avatar source"
          className="radix-toggle-group"
          disabled={!hasUploadedAvatar && draftAvatarSource === 'uploaded'}
          onValueChange={value => {
            if (value === 'oauth' || value === 'uploaded') {
              setDraftAvatarSource(value);
            }
          }}
          type="single"
          value={draftAvatarSource}
        >
          <ToggleGroup.Item className="radix-toggle-item" value="oauth">
            OAuth
          </ToggleGroup.Item>
          <ToggleGroup.Item className="radix-toggle-item" disabled={!hasUploadedAvatar} value="uploaded">
            Uploaded
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
      <div className="field">
        <Label.Root className="field-label" htmlFor="profile-name">
          Name
        </Label.Root>
        <input
          className="field-input"
          id="profile-name"
          onChange={event => {
            setDraftName(event.target.value);
          }}
          value={draftName}
        />
      </div>
      <div className="dialog-actions">
        <button disabled={isPending} onClick={handleCancel} type="button">
          Cancel
        </button>
        <button disabled={!isNameValid || isPending || user.isPending} onClick={handleUpdate} type="button">
          Update
        </button>
      </div>
    </>
  );
};

export const ProfileEditDialog: FC<ProfileEditDialogProps> = ({ onClose, open }) => {
  const profile = useQuery({ ...queryProfile, enabled: open });

  const profileData = open ? profile.data : null;

  return (
    <Dialog.Root
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="radix-overlay" />
        <Dialog.Content className="radix-dialog-content">
          <Dialog.Title>Edit Profile</Dialog.Title>
          {profile.isError ? <p style={{ color: 'var(--color-error)' }}>{profile.error.message}</p> : null}
          {profileData != null ? <ProfileEditForm onClose={onClose} profileData={profileData} /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
