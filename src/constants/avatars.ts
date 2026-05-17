export const AVATAR_BUCKET = 'avatars';

export const AVATAR_OBJECT_PATH_SUFFIX = 'avatar';

export const MAX_AVATAR_BYTES = 1_048_576;

export const ALLOWED_AVATAR_MIME_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];
