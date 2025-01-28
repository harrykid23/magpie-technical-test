import type { FastifyInstance } from "fastify";
import { composeMiddlewareList, type TypeAPIBody } from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";
import type {
  TypeRequestDashboardLendingPerMonth,
  TypeRequestDashboardMostPopularBook,
  TypeRequestDashboardMostPopularCategory,
  TypeResponseDashboardLendingPerMonth,
  TypeResponseDashboardMostPopularBook,
  TypeResponseDashboardMostPopularCategory,
} from "../../shared/types.ts";

export default async function (fastify: FastifyInstance) {
  // Total lendings per month
  fastify.get(
    "/totalLendingsPerMonth",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware
    )(async (request, reply) => {
      const queryRequest = request.query as TypeRequestDashboardLendingPerMonth;
      const nextYear = parseInt(queryRequest.year) + 1;

      const result: TypeResponseDashboardLendingPerMonth = await request.trx
        .$queryRaw`
          SELECT
            to_char("l"."createdAt", 'YYYY-MM') AS "yearMonth",
            COUNT("l"."id")::INT AS count
          FROM
            "Lending" AS "l"
          WHERE
            "l"."deletedAt" IS NULL AND
            "l"."createdAt" >= ${`${queryRequest.year}-01-01T00:00:00.000Z`}::timestamp AND
            "l"."createdAt" < ${`${nextYear}-01-01T00:00:00.000Z`}::timestamp
          GROUP BY
            "yearMonth"
          ORDER BY
            "yearMonth" ASC;
        `;

      const completeResult: TypeResponseDashboardLendingPerMonth = Array(12)
        .fill(null)
        .map((_, index) => {
          const month = (index + 1).toString().padStart(2, "0");
          const yearMonth = `${queryRequest.year}-${month}`;
          const data = result.find((item) => {
            return item.yearMonth === yearMonth;
          });
          if (data) {
            return data;
          } else {
            return {
              yearMonth: yearMonth,
              count: 0,
            };
          }
        });

      const res: TypeAPIBody<TypeResponseDashboardLendingPerMonth> = {
        statusCode: 200,
        data: completeResult,
      };

      return res;
    })
  );

  // Top book lending
  fastify.get(
    "/topBookLending",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware
    )(async (request, reply) => {
      const queryRequest = request.query as TypeRequestDashboardMostPopularBook;
      const nextYear = parseInt(queryRequest.year) + 1;

      const result: TypeResponseDashboardMostPopularBook = await request.trx
        .$queryRaw`
          SELECT
            "b"."title",
            COUNT("l"."id")::INT AS count
          FROM
            "Lending" AS "l"
          LEFT JOIN
            "Book" AS "b" ON "b"."id" = "l"."bookId"
          WHERE
            "l"."deletedAt" IS NULL AND
            "l"."createdAt" >= ${`${queryRequest.year}-01-01T00:00:00.000Z`}::timestamp AND
            "l"."createdAt" < ${`${nextYear}-01-01T00:00:00.000Z`}::timestamp
          GROUP BY
            "b"."id",
            "b"."title"
          ORDER BY
            count desc
          LIMIT 10;
        `;

      const res: TypeAPIBody<TypeResponseDashboardMostPopularBook> = {
        statusCode: 200,
        data: result,
      };

      return res;
    })
  );

  // Top category lending
  fastify.get(
    "/topCategoryLending",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware
    )(async (request, reply) => {
      const queryRequest =
        request.query as TypeRequestDashboardMostPopularCategory;
      const nextYear = parseInt(queryRequest.year) + 1;

      const result: TypeResponseDashboardMostPopularCategory = await request.trx
        .$queryRaw`
          SELECT
            "c"."name",
            COUNT("l"."id")::INT AS count
          FROM
            "Lending" AS "l"
          LEFT JOIN
            "Book" AS "b" ON "b"."id" = "l"."bookId"
          LEFT JOIN
            "Category" AS "c" ON "c"."id" = "b"."categoryId"
          WHERE
            "l"."deletedAt" IS NULL AND
            "l"."createdAt" >= ${`${queryRequest.year}-01-01T00:00:00.000Z`}::timestamp AND
            "l"."createdAt" < ${`${nextYear}-01-01T00:00:00.000Z`}::timestamp
          GROUP BY
            "c"."id",
            "c"."name"
          ORDER BY
            count desc
          LIMIT 10;
        `;

      const res: TypeAPIBody<TypeResponseDashboardMostPopularCategory> = {
        statusCode: 200,
        data: result,
      };

      return res;
    })
  );
}
