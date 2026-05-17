import type { User } from '@supabase/supabase-js';

import type { Profile } from '../api/profile';
import { AVATAR_BUCKET } from '../constants/avatars';
import { supabase } from '../services/supabase';

import { buildAvatarObjectPath } from './avatarObjectPath';

export const resolveProfileAvatarUrl = (profile: Profile, user: User): string | undefined => {
  if (profile.avatar_source === 'oauth') {
    const rawOauthAvatarUrl: unknown = user.user_metadata.avatar_url;

    if (typeof rawOauthAvatarUrl !== 'string' || rawOauthAvatarUrl === '') {
      return undefined;
    }

    return rawOauthAvatarUrl;
  }

  if (profile.uploaded_avatar_id == null) {
    throw new Error('Profile avatar_source is uploaded but uploaded_avatar_id is missing');
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(buildAvatarObjectPath(user.id));

  return data.publicUrl;
};
