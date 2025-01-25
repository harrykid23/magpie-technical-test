import type { FastifyInstance } from "fastify";
import { composeMiddlewareList, type TypeAPIBody } from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";
import generatePermissionMiddleware from "../middlewares/permissionMiddleware.ts";
import { PERMISSION_NAME } from "../../shared/constants.ts";
import type {
  TypeRequestGetMemberList,
  TypeResponseGetMemberList,
} from "../../shared/types.ts";
import type { Prisma } from "@prisma/client";

export default async function (fastify: FastifyInstance) {
  // Search member
  fastify.get(
    "/",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.create_book])
    )(async (request, reply) => {
      const queryRequest = request.query as TypeRequestGetMemberList;

      const whereClause: Prisma.MemberWhereInput = {
        OR: [
          {
            name: {
              contains: queryRequest.search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: queryRequest.search,
              mode: "insensitive",
            },
          },
        ],
      };

      const members: TypeResponseGetMemberList =
        await request.trx.member.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
          where: whereClause,
          take: 15,
          orderBy: { name: "asc" },
        });

      const res: TypeAPIBody<TypeResponseGetMemberList> = {
        statusCode: 200,
        data: members,
      };

      return res;
    })
  );
}
