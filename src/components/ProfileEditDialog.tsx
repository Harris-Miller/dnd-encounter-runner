import { Avatar, Button, Callout, Dialog, Flex, SegmentedControl, Text, TextField } from '@radix-ui/themes';
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
      {mutationError != null ? (
        <Callout.Root color="red" mb="4" role="alert">
          <Callout.Text>{mutationError}</Callout.Text>
        </Callout.Root>
      ) : null}
      <Flex align="center" direction="column" gap="4" mb="4">
        <Avatar alt={trimmedName} fallback={avatarInitial} radius="full" size="6" src={previewAvatarUrl} />
        <input accept="image/*" hidden onChange={handleFileChange} ref={fileInputRef} type="file" />
        <Button onClick={handlePhotoButtonClick} type="button" variant="soft">
          <Camera size={18} />
          Change photo
        </Button>
        <SegmentedControl.Root
          disabled={!hasUploadedAvatar && draftAvatarSource === 'uploaded'}
          onValueChange={value => {
            if (value === 'oauth') {
              setDraftAvatarSource('oauth');
              return;
            }
            if (value === 'uploaded' && hasUploadedAvatar) {
              setDraftAvatarSource('uploaded');
            }
          }}
          value={draftAvatarSource}
        >
          <SegmentedControl.Item value="oauth">OAuth</SegmentedControl.Item>
          <SegmentedControl.Item value="uploaded">Uploaded</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>
      <Flex direction="column" gap="1" mb="4">
        <Text as="label" htmlFor="profile-name" size="2" weight="medium">
          Name
        </Text>
        <TextField.Root
          id="profile-name"
          onChange={event => {
            setDraftName(event.target.value);
          }}
          value={draftName}
        />
      </Flex>
      <Flex gap="3" justify="end">
        <Button color="gray" disabled={isPending} onClick={handleCancel} type="button" variant="soft">
          Cancel
        </Button>
        <Button disabled={!isNameValid || isPending || user.isPending} onClick={handleUpdate} type="button">
          Update
        </Button>
      </Flex>
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
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>Edit Profile</Dialog.Title>
        {profile.isError ? (
          <Callout.Root color="red" mt="4" role="alert">
            <Callout.Text>{profile.error.message}</Callout.Text>
          </Callout.Root>
        ) : null}
        {profileData != null ? <ProfileEditForm onClose={onClose} profileData={profileData} /> : null}
      </Dialog.Content>
    </Dialog.Root>
  );
};
