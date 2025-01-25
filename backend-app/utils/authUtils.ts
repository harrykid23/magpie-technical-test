import bcrypt from "bcryptjs";
import { APIError, type TypeTransaction } from "./apiUtils.ts";
import type { FastifyReply } from "fastify";
import { COOKIE_NAME_ACCESS_TOKEN } from "../../shared/constants.ts";
import type { TypeSession } from "../../shared/types.ts";
import { generateJWT } from "./jwtUtils.ts";

// Encrypts a plain password using bcrypt.
export async function encryptPassword(plainPassword: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  return hashedPassword;
}

// Verifies if the plain password matches the hashed password.
export async function checkPassword(
  plainPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export const generateAccessTokenFromSessionData = (
  sessionData: TypeSession
) => {
  const accessTokenLifetime = 1 * 24 * 3600; // 1 day
  const accessToken = generateJWT(sessionData, accessTokenLifetime);

  return { accessTokenLifetime, accessToken };
};

export const getSessionData = async (trx: TypeTransaction, userId: string) => {
  const session = (await trx.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          mapRolePermissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })) as TypeSession;

  if (!session) {
    throw new Error("invalid access token");
  }

  return session;
};

export function forceLogout(reply: FastifyReply) {
  reply.clearCookie(COOKIE_NAME_ACCESS_TOKEN);
  return new APIError({
    statusCode: 401,
    data: null,
    displayMessage: "Session expired, please re-login.",
  });
}
