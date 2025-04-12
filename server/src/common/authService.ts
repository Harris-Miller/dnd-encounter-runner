import { jwt as jwtConstructor } from '@elysiajs/jwt';
import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';

import { db } from '../db';
import { users } from '../db/schema';

export const ACCESS_TOKEN_EXP = 60 * 24; // 1 day in seconds
export const REFRESH_TOKEN_EXP = 60 * 24 * 7; // 7 days in seconds

const getExpTimestamp = (seconds: number) => {
  const currentTimeMs = Date.now();
  const secondsIntoMs = seconds * 1000;
  const expirationTimeMs = currentTimeMs + secondsIntoMs;

  return Math.floor(expirationTimeMs / 1000);
};

const createIat = () => Math.floor(Date.now() / 1000); // needs to be in seconds, not milliseconds

export const authService = new Elysia({ name: 'auth/service' })
  .use(
    jwtConstructor({
      name: 'jwt',
      secret: 'beyond',
    }),
  )
  .model({
    signIn: t.Object({
      email: t.String({ minLength: 5 }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .derive({ as: 'scoped' }, ({ jwt, cookie: { accessToken, refreshToken } }) => {
    return {
      createAccessToken: async (sub: string) => {
        const accessJWTToken = await jwt.sign({
          exp: getExpTimestamp(ACCESS_TOKEN_EXP),
          iat: createIat(),
          sub,
        });

        // TODO: figure out how how to make this cookie always defined
        accessToken!.set({
          httpOnly: true,
          maxAge: ACCESS_TOKEN_EXP,
          path: '/',
          sameSite: 'lax',
          secure: true,
          value: accessJWTToken,
        });

        return accessJWTToken;
      },
      createRefreshToken: async (sub: string) => {
        const refreshJWTToken = await jwt.sign({
          exp: getExpTimestamp(REFRESH_TOKEN_EXP),
          iat: createIat(),
          sub,
        });

        // TODO: figure out how how to make this cookie always defined
        refreshToken!.set({
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXP,
          path: '/',
          sameSite: 'lax',
          secure: true,
          value: refreshJWTToken,
        });

        // await getRedisClient().hSet(`user:jwt:${sub}`, 'refresh_token', refreshJWTToken);

        return refreshJWTToken;
      },
    };
  })
  .macro({
    isSignIn: (enabled: boolean) => {
      if (!enabled) return undefined;

      return {
        // eslint-disable-next-line complexity
        beforeHandle: async ({ cookie: { accessToken, refreshToken }, error, jwt, createAccessToken }) => {
          if (accessToken?.value == null) {
            if (refreshToken?.value == null) {
              accessToken?.remove();
              refreshToken?.remove();
              return error(401);
            }

            const jwtPayload = await jwt.verify(refreshToken.value);
            if (jwtPayload === false) {
              accessToken?.remove();
              refreshToken.remove();
              return error(401);
            }

            const userId = Number.parseInt(jwtPayload.sub!, 10);
            if (Number.isNaN(userId)) {
              accessToken?.remove();
              refreshToken.remove();
              return error(401);
            }

            // TODO: this should always exist, why is `| undefined`
            await createAccessToken!(jwtPayload.sub!);

            // const storedRefreshToken = await getRedisClient().hGet(`user:jwt:${userId}`, 'refresh_token');
            // if (refreshToken.value !== storedRefreshToken) {
            //   return error(401);
            // }

            accessToken?.remove();
            refreshToken.remove();
            return error(401);
          }

          const jwtPayload = await jwt.verify(accessToken.value);
          if (jwtPayload === false) {
            accessToken.remove();
            refreshToken?.remove();
            return error(401);
          }

          const userId = Number.parseInt(jwtPayload.sub!, 10);
          if (Number.isNaN(userId)) {
            accessToken.remove();
            refreshToken?.remove();
            return error(401);
          }

          return undefined;
        },
      };
    },
  });

export const getUser = new Elysia()
  .use(authService)
  .guard({
    cookie: t.Cookie(
      {
        accessToken: t.String(),
        refreshToken: t.String(),
      },
      {
        secrets: 'beyond',
      },
    ),
    isSignIn: true,
  })
  .resolve(async ({ cookie: { accessToken }, jwt, error }) => {
    const jwtPayload = await jwt.verify(accessToken.value);
    if (jwtPayload === false) {
      return error(401);
    }

    const userId = Number.parseInt(jwtPayload.sub!, 10);
    if (Number.isNaN(userId)) {
      return error(401);
    }

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user == null) {
      return error(403);
    }

    return { user };
  })
  .as('plugin');
