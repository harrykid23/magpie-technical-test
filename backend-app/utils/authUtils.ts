import bcrypt from "bcryptjs";
import type { TypeTransaction } from "./apiUtils.ts";

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

export type TypeSession = {
  role: {
    id: string;
    name: string;
    mapRolePermissions: {
      permission: {
        id: string;
        name: string;
      };
    }[];
  };
  id: string;
  name: string;
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
