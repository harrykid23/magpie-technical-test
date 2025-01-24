import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { FastifyRequest } from "fastify";

// Extend the FastifyRequest type
declare module "fastify" {
  interface FastifyRequest {
    // Add custom fields to the request
    session?: string;
    trx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >;
  }
}
