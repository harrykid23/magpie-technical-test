import { composeMiddlewareList, type TypeAPIBody } from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type { TypeResponseGetUserList } from "../../shared/types.ts";

export default async function (fastify: FastifyInstance) {
  // Get all users
  fastify.get(
    "/",
    composeMiddlewareList(dbMiddleware)(async (request, reply) => {
      const users: TypeResponseGetUserList = await request.trx.book.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          quantity: true,
          category: true,
          createdBy: true,
        },
      });
      const res: TypeAPIBody<TypeResponseGetUserList> = {
        statusCode: 200,
        data: users,
      };

      reply.send(res);
    })
  );
}
