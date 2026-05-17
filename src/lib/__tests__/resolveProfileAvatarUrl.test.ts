/* eslint-disable @typescript-eslint/unbound-method -- vi.mocked(supabase.storage.from) triggers false positives */
import type { User } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Profile } from '../../api/profile';
import { AVATAR_BUCKET } from '../../constants/avatars';
import { supabase } from '../../services/supabase';
import { buildAvatarObjectPath } from '../avatarObjectPath';
import { resolveProfileAvatarUrl } from '../resolveProfileAvatarUrl';

vi.mock('../../services/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

const baseProfile: Profile = {
  avatar_source: 'oauth',
  id: 'profile-id',
  name: 'Gandalf',
  uploaded_avatar_id: null,
  user_id: 'user-123',
};

const baseUser = {
  id: 'user-123',
  user_metadata: {
    avatar_url: 'https://oauth.example/avatar.png',
  },
} as unknown as User;

describe('resolveProfileAvatarUrl', () => {
  it('returns oauth metadata avatar when avatar_source is oauth', () => {
    expect(resolveProfileAvatarUrl(baseProfile, baseUser)).toBe('https://oauth.example/avatar.png');
  });

  it('returns undefined when oauth metadata has no avatar url', () => {
    const userWithoutAvatar = {
      ...baseUser,
      user_metadata: {},
    } as unknown as User;

    expect(resolveProfileAvatarUrl(baseProfile, userWithoutAvatar)).toBeUndefined();
  });

  it('returns the public storage url when avatar_source is uploaded', () => {
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://storage.example/public/avatar' },
    });

    const storageFrom = vi.fn().mockReturnValue({ getPublicUrl });
    vi.mocked(supabase.storage.from).mockImplementation(storageFrom);

    const uploadedProfile: Profile = {
      ...baseProfile,
      avatar_source: 'uploaded',
      uploaded_avatar_id: 'object-uuid',
    };

    expect(resolveProfileAvatarUrl(uploadedProfile, baseUser)).toBe('https://storage.example/public/avatar');
    expect(storageFrom).toHaveBeenCalledWith(AVATAR_BUCKET);
    expect(getPublicUrl).toHaveBeenCalledWith(buildAvatarObjectPath(baseUser.id));
  });

  it('throws when avatar_source is uploaded without uploaded_avatar_id', () => {
    const invalidProfile: Profile = {
      ...baseProfile,
      avatar_source: 'uploaded',
      uploaded_avatar_id: null,
    };

    expect(() => resolveProfileAvatarUrl(invalidProfile, baseUser)).toThrow('uploaded_avatar_id is missing');
  });
});
