import { composeMiddlewareList, type TypeAPIBody } from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type { TypeResponseGetBookList } from "../../shared/types.ts";

export default async function (fastify: FastifyInstance) {
  // Get all users
  fastify.get(
    "/",
    composeMiddlewareList(dbMiddleware)(async (request, reply) => {
      const books: TypeResponseGetBookList = await request.trx.book.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          quantity: true,
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 5,
      });
      const res: TypeAPIBody<TypeResponseGetBookList> = {
        statusCode: 200,
        data: books,
      };

      reply.send(res);
    })
  );
}
