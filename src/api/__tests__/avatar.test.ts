/* eslint-disable @typescript-eslint/unbound-method -- vi.mocked(supabase.storage.from) triggers false positives */
import type { User } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { supabase } from '../../services/supabase';
import { AVATAR_BUCKET, uploadAvatar } from '../avatar';
import { getCachedUser } from '../user';
import { buildAvatarObjectPath } from '../utils/resolveProfileAvatarUrl';

vi.mock('../../services/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

vi.mock('../user', () => ({
  getCachedUser: vi.fn(),
}));

const createPngFile = (sizeBytes: number): File =>
  new File([new Uint8Array(sizeBytes)], 'avatar.png', { type: 'image/png' });

const mockUser = (userId: string): User => ({ id: userId }) as unknown as User;

describe('uploadAvatar', () => {
  it('rejects disallowed mime types', async () => {
    const file = new File(['data'], 'avatar.pdf', { type: 'application/pdf' });

    await expect(uploadAvatar(file)).rejects.toThrow('Avatar must be one of:');
  });

  it('rejects files larger than the limit', async () => {
    const file = createPngFile(1_048_577);

    await expect(uploadAvatar(file)).rejects.toThrow('Avatar must be at most');
  });

  it('throws when no cached user is available', async () => {
    vi.mocked(getCachedUser).mockReturnValue(null);

    const file = createPngFile(100);

    await expect(uploadAvatar(file)).rejects.toThrow('Not authenticated');
  });

  it('uploads to the user avatar path with upsert and returns the storage object id', async () => {
    const userId = 'user-123';
    const file = createPngFile(100);
    const upload = vi.fn().mockResolvedValue({
      data: { id: 'object-uuid', path: `${userId}/avatar` },
      error: null,
    });

    vi.mocked(getCachedUser).mockReturnValue(mockUser(userId));
    const storageFrom = vi.fn().mockReturnValue({ upload });
    vi.mocked(supabase.storage.from).mockImplementation(storageFrom);

    const uploadedAvatarId = await uploadAvatar(file);

    expect(storageFrom).toHaveBeenCalledWith(AVATAR_BUCKET);
    expect(upload).toHaveBeenCalledWith(buildAvatarObjectPath(userId), file, {
      contentType: 'image/png',
      upsert: true,
    });
    expect(uploadedAvatarId).toBe('object-uuid');
  });

  it('throws when upload succeeds without an object id', async () => {
    const file = createPngFile(100);
    const upload = vi.fn().mockResolvedValue({
      data: { id: '', path: 'user-123/avatar' },
      error: null,
    });

    vi.mocked(getCachedUser).mockReturnValue(mockUser('user-123'));
    const storageFrom = vi.fn().mockReturnValue({ upload });
    vi.mocked(supabase.storage.from).mockImplementation(storageFrom);

    await expect(uploadAvatar(file)).rejects.toThrow('storage object id is missing');
  });
});
