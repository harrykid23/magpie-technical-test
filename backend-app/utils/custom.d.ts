import { FastifyRequest } from "fastify";
import type { TypeTransaction } from "./apiUtils.ts";
import type { TypeSession } from "./authUtils.ts";

// Extend the FastifyRequest type
declare module "fastify" {
  interface FastifyRequest {
    // Add custom fields to the request
    session: TypeSession;
    trx: TypeTransaction;
  }
}
