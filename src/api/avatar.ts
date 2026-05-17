import { ALLOWED_AVATAR_MIME_TYPES, AVATAR_BUCKET, MAX_AVATAR_BYTES } from '../constants/avatars';
import type { AllowedAvatarMimeType } from '../constants/avatars';
import { buildAvatarObjectPath } from '../lib/avatarObjectPath';
import { supabase } from '../services/supabase';

import { getCachedUser } from './user';

const isAllowedAvatarMimeType = (mimeType: string): mimeType is AllowedAvatarMimeType =>
  (ALLOWED_AVATAR_MIME_TYPES as readonly string[]).includes(mimeType);

export const uploadAvatar = async (file: File): Promise<string> => {
  if (!isAllowedAvatarMimeType(file.type)) {
    throw new Error(`Avatar must be one of: ${ALLOWED_AVATAR_MIME_TYPES.join(', ')}`);
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error(`Avatar must be at most ${MAX_AVATAR_BYTES} bytes`);
  }

  const user = getCachedUser();

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const objectPath = buildAvatarObjectPath(user.id);

  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).upload(objectPath, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error != null) {
    throw error;
  }

  if (data.id === '') {
    throw new Error('Avatar upload succeeded but storage object id is missing');
  }

  return data.id;
};
