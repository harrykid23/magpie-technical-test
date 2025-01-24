import { FastifyRequest } from "fastify";
import type { TypeTransaction } from "./apiUtils.ts";

// Extend the FastifyRequest type
declare module "fastify" {
  interface FastifyRequest {
    // Add custom fields to the request
    session?: string;
    trx: TypeTransaction;
  }
}
