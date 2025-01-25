import { PrismaClient } from "@prisma/client";
import type { TypeAPIBody, TypeMiddleware } from "../utils/apiUtils.ts";
import type { FastifyInstance } from "fastify";

let prisma: PrismaClient;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

const dbMiddleware: TypeMiddleware = function (next) {
  return async function (this: FastifyInstance, request, reply) {
    const db = getPrismaClient();

    const res = (await db.$transaction(async (trx) => {
      const newRequest = {
        ...request,
        trx,
      };
      return await next.call(this, newRequest, reply);
    })) as TypeAPIBody;

    reply.send(res);

    return res;
  };
};

export default dbMiddleware;
