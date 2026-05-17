import { AVATAR_OBJECT_PATH_SUFFIX } from '../constants/avatars';

export const buildAvatarObjectPath = (userId: string): string => `${userId}/${AVATAR_OBJECT_PATH_SUFFIX}`;
