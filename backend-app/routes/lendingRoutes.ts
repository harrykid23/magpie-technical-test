import {
  APIError,
  composeMiddlewareList,
  getPaginationData,
  type TypeAPIBody,
} from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type {
  TypeRequestCreateLending,
  TypeRequestGetTable,
  TypeResponseCreateLending,
  TypeResponseGetLendingList,
  TypeResponseReturnLending,
} from "../../shared/types.ts";
import type { Prisma } from "@prisma/client";
import authMiddleware from "../middlewares/authMiddleware.ts";
import generatePermissionMiddleware from "../middlewares/permissionMiddleware.ts";
import { PERMISSION_NAME } from "../../shared/constants.ts";

export default async function (fastify: FastifyInstance) {
  // Get all lendings
  fastify.post(
    "/",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.read_lending])
    )(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestGetTable;
      const { currentPage, itemPerPage } = getPaginationData(bodyRequest);

      const whereClause: Prisma.LendingWhereInput = {
        OR: [
          {
            book: {
              title: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
          {
            book: {
              author: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
          {
            book: {
              isbn: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
          {
            member: {
              name: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
          {
            member: {
              email: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
        ],
        deletedAt: {
          equals: null,
        },
      };

      const lendings: TypeResponseGetLendingList =
        await request.trx.lending.findMany({
          select: {
            id: true,
            book: {
              select: {
                id: true,
                title: true,
                isbn: true,
                author: true,
              },
            },
            member: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            dueDate: true,
            returnDate: true,
            createdAt: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          where: whereClause,
          skip: itemPerPage * (currentPage - 1),
          take: itemPerPage,
          orderBy: bodyRequest.option?.orderBy,
        });

      const totalCount = await request.trx.lending.count({
        where: whereClause,
      });

      const res: TypeAPIBody<TypeResponseGetLendingList> = {
        statusCode: 200,
        data: lendings,
        pagination: {
          currentPage,
          itemPerPage,
          maxPage: Math.ceil(totalCount / itemPerPage),
        },
      };

      return res;
    })
  );

  // Create lending
  fastify.post(
    "/create",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.create_lending])
    )(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestCreateLending;

      const lending: TypeResponseCreateLending =
        await request.trx.lending.create({
          select: {
            id: true,
            book: {
              select: {
                id: true,
                title: true,
                isbn: true,
                author: true,
              },
            },
            member: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            dueDate: true,
            returnDate: true,
            createdAt: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          data: {
            bookId: bodyRequest.bookId,
            memberId: bodyRequest.memberId,
            dueDate: bodyRequest.dueDate,
            createdById: request.session.id,
          },
        });

      const res: TypeAPIBody<TypeResponseCreateLending> = {
        statusCode: 200,
        data: lending,
        displayMessage: "Lending created successfully.",
      };

      return res;
    })
  );

  // Return lending
  fastify.post(
    "/:lendingId/return",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.update_lending])
    )(async (request, reply) => {
      const { lendingId } = request.params as { lendingId: string };
      if (!lendingId) {
        throw new APIError({
          statusCode: 400,
          data: null,
          displayMessage: "Lending ID cannot be empty!",
        });
      }

      const lending: TypeResponseReturnLending[] =
        await request.trx.lending.updateManyAndReturn({
          where: {
            id: lendingId,
            deletedAt: {
              equals: null,
            },
            returnDate: {
              equals: null,
            },
          },
          select: {
            id: true,
            book: {
              select: {
                id: true,
                title: true,
                isbn: true,
                author: true,
              },
            },
            member: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            dueDate: true,
            returnDate: true,
            createdAt: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          data: {
            returnDate: new Date().toISOString(),
          },
        });

      if (!lending.length) {
        throw new APIError({
          statusCode: 404,
          data: null,
          displayMessage: "Lending ID not found or already returned!",
        });
      }

      const res: TypeAPIBody<TypeResponseReturnLending> = {
        statusCode: 200,
        data: lending[0],
        displayMessage: "Lending returned successfully.",
      };

      return res;
    })
  );

  // Delete book
  fastify.delete(
    "/:lendingId",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.delete_lending])
    )(async (request, reply) => {
      const { lendingId } = request.params as { lendingId: string };
      if (!lendingId) {
        throw new APIError({
          statusCode: 400,
          data: null,
          displayMessage: "Lending ID cannot be empty!",
        });
      }

      const lending = await request.trx.lending.updateManyAndReturn({
        where: {
          id: lendingId,
          deletedAt: {
            equals: null,
          },
        },
        select: {
          id: true,
        },
        data: {
          deletedAt: new Date().toISOString(),
          deletedById: request.session.id,
        },
      });

      if (!lending.length) {
        throw new APIError({
          statusCode: 404,
          data: null,
          displayMessage: "Lending ID not found!",
        });
      }

      const res: TypeAPIBody<null> = {
        statusCode: 200,
        data: null,
        message: "Lending data deleted successfully",
      };

      return res;
    })
  );
}
