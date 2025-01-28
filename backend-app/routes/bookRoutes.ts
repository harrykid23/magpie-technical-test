import {
  APIError,
  composeMiddlewareList,
  getPaginationData,
  type TypeAPIBody,
} from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type {
  TypeRequestCreateBook,
  TypeRequestSearchCategoryList,
  TypeRequestGetTable,
  TypeRequestUpdateBook,
  TypeResponseCreateBook,
  TypeResponseGetBookList,
  TypeResponseSearchCategoryList,
  TypeResponseUpdateBook,
} from "../../shared/types.ts";
import type { Prisma } from "@prisma/client";
import authMiddleware from "../middlewares/authMiddleware.ts";
import generatePermissionMiddleware from "../middlewares/permissionMiddleware.ts";
import { PERMISSION_NAME } from "../../shared/constants.ts";

export default async function (fastify: FastifyInstance) {
  // Get all books
  fastify.post(
    "/",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.read_book])
    )(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestGetTable;
      const { currentPage, itemPerPage } = getPaginationData(bodyRequest);

      const whereClause: Prisma.BookWhereInput = {
        deletedAt: {
          equals: null,
        },
        OR: [
          {
            title: {
              contains: bodyRequest.option?.search,
              mode: "insensitive",
            },
          },
          {
            author: {
              contains: bodyRequest.option?.search,
              mode: "insensitive",
            },
          },
          {
            isbn: {
              contains: bodyRequest.option?.search,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: bodyRequest.option?.search,
                mode: "insensitive",
              },
            },
          },
        ],
      };

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
              name: true,
            },
          },
        },
        where: whereClause,
        skip: itemPerPage * (currentPage - 1),
        take: itemPerPage,
        orderBy: bodyRequest.option?.orderBy,
      });

      const totalCount = await request.trx.book.count({
        where: whereClause,
      });

      const res: TypeAPIBody<TypeResponseGetBookList> = {
        statusCode: 200,
        data: books,
        pagination: {
          currentPage,
          itemPerPage,
          maxPage: Math.ceil(totalCount / itemPerPage),
        },
      };

      return res;
    })
  );

  // Create book
  fastify.post(
    "/create",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.create_book])
    )(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestCreateBook;

      const book: TypeResponseCreateBook = await request.trx.book.create({
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          quantity: true,
          category: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        data: {
          title: bodyRequest.title,
          author: bodyRequest.author,
          isbn: bodyRequest.isbn,
          quantity: bodyRequest.quantity,
          categoryId: bodyRequest.categoryId,
          createdById: request.session.id,
        },
      });

      const res: TypeAPIBody<TypeResponseCreateBook> = {
        statusCode: 200,
        data: book,
        displayMessage: "Book created successfully.",
      };

      return res;
    })
  );

  // Update book
  fastify.put(
    "/:bookId",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.update_book])
    )(async (request, reply) => {
      const { bookId } = request.params as { bookId: string };
      if (!bookId) {
        throw new APIError({
          statusCode: 400,
          data: null,
          displayMessage: "Book ID cannot be empty!",
        });
      }
      const bodyRequest = request.body as TypeRequestUpdateBook;

      const book: TypeResponseUpdateBook[] =
        await request.trx.book.updateManyAndReturn({
          where: {
            id: bookId,
            deletedAt: {
              equals: null,
            },
          },
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            quantity: true,
            category: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          data: {
            title: bodyRequest.title,
            author: bodyRequest.author,
            isbn: bodyRequest.isbn,
            quantity: bodyRequest.quantity,
            categoryId: bodyRequest.categoryId,
          },
        });

      if (!book.length) {
        throw new APIError({
          statusCode: 404,
          data: null,
          displayMessage: "Book ID not found!",
        });
      }

      const res: TypeAPIBody<TypeResponseUpdateBook> = {
        statusCode: 200,
        data: book[0],
        displayMessage: "Book updated successfully.",
      };

      return res;
    })
  );

  // Delete book
  fastify.delete(
    "/:bookId",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.delete_book])
    )(async (request, reply) => {
      const { bookId } = request.params as { bookId: string };
      if (!bookId) {
        throw new APIError({
          statusCode: 400,
          data: null,
          displayMessage: "Book ID cannot be empty!",
        });
      }

      const book = await request.trx.book.updateManyAndReturn({
        where: {
          id: bookId,
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

      if (!book.length) {
        throw new APIError({
          statusCode: 404,
          data: null,
          displayMessage: "Book ID not found!",
        });
      }

      const res: TypeAPIBody<null> = {
        statusCode: 200,
        data: null,
        message: "Book deleted successfully",
      };

      return res;
    })
  );

  // Search categories
  fastify.get(
    "/category",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware,
      generatePermissionMiddleware([PERMISSION_NAME.create_book])
    )(async (request, reply) => {
      const queryRequest = request.query as TypeRequestSearchCategoryList;

      const whereClause: Prisma.CategoryWhereInput = {
        name: {
          contains: queryRequest.search,
          mode: "insensitive",
        },
      };

      const categories: TypeResponseSearchCategoryList =
        await request.trx.category.findMany({
          select: {
            id: true,
            name: true,
          },
          where: whereClause,
          take: 15,
          orderBy: { name: "asc" },
        });

      const res: TypeAPIBody<TypeResponseSearchCategoryList> = {
        statusCode: 200,
        data: categories,
      };

      return res;
    })
  );
}
