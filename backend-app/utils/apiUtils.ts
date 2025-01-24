import type { RouteHandlerMethod } from "fastify";
import type { TypePagination } from "../../shared/types.ts";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

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

export default null;
export { APIError, composeMiddlewareList };
export type { TypeAPIBody, TypeMiddleware, TypeTransaction };
