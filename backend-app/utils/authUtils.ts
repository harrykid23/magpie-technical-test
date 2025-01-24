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
  id: string;
  username: string;
  name: string;
  office: {
    id: string;
    name: string;
    shortName: string;
    createdAt: Date;
    modifiedAt: Date;
  };
  role: {
    id: string;
    name: string;
    MapRolePermission: {
      permission: {
        id: string;
        shortName: string;
        moduleName: string;
      };
    }[];
  };
  password: string;
};

export const getSessionData = async (trx: TypeTransaction, userId: string) => {
  const session = await trx.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          mapRolePermissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new Error("invalid refresh token");
  }

  return session;
};
