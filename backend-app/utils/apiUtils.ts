import type { RouteHandlerMethod } from "fastify";
import type {
  TypePagination,
  TypeRequestGetTable,
} from "../../shared/types.ts";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { PAGINATION_MAX_ITEM_PER_PAGE } from "../../shared/constants.ts";

type TypeAPIBody<T = any> = {
  statusCode: number;
  data: T;
  message?: string;
  displayMessage?: string;
  pagination?: TypePagination;
};

class APIError extends Error {
  bodyResponse: TypeAPIBody<null>;

  constructor(bodyResponse: TypeAPIBody<null>) {
    super(bodyResponse.message);
    this.bodyResponse = bodyResponse;
  }
}

type TypeMiddleware = (next: RouteHandlerMethod) => RouteHandlerMethod;
type TypeMiddlewareGenerator<TArgs> = (args: TArgs) => TypeMiddleware;

type TypeMiddlewareComposer = (
  ...middlewareList: TypeMiddleware[]
) => (mainFunction: RouteHandlerMethod) => RouteHandlerMethod;

const composeMiddlewareList: TypeMiddlewareComposer = function (
  ...middlewares: TypeMiddleware[]
) {
  return (mainFunction) => {
    return [...middlewares].reduceRight(
      (next, middleware) => middleware(next),
      mainFunction
    );
  };
};

type TypeTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const getPaginationData = (data: TypeRequestGetTable) => {
  const currentPage = Math.max(data.currentPage, 1);
  const itemPerPage = Math.min(data.itemPerPage, PAGINATION_MAX_ITEM_PER_PAGE);

  return {
    currentPage,
    itemPerPage,
  };
};

export default null;
export { APIError, composeMiddlewareList, getPaginationData };
export type {
  TypeAPIBody,
  TypeMiddleware,
  TypeTransaction,
  TypeMiddlewareGenerator,
};
