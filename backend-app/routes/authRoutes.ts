import {
  APIError,
  composeMiddlewareList,
  getPaginationData,
  type TypeAPIBody,
} from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import type {
  TypeRequestLogin,
  TypeResponseLogin,
} from "../../shared/types.ts";
import {
  checkPassword,
  getSessionData,
  type TypeSession,
} from "../utils/authUtils.ts";
import { COOKIE_NAME_ACCESS_TOKEN } from "../../shared/constants.ts";
import { generateJWT } from "../utils/jwtUtils.ts";

export default async function (fastify: FastifyInstance) {
  // Login
  fastify.post(
    "/login",
    composeMiddlewareList(dbMiddleware)(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestLogin;

      const user = await request.trx.user.findFirst({
        where: {
          email: bodyRequest.email,
        },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        throw new APIError({
          statusCode: 404,
          displayMessage:
            "User with this email & password combination does not exist.",
          data: null,
        });
      }

      const isPasswordValid = await checkPassword(
        bodyRequest.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new APIError({
          statusCode: 404,
          displayMessage:
            "User with this email & password combination does not exist.",
          data: null,
        });
      }

      // set access token
      const sessionData: TypeSession = await getSessionData(
        request.trx,
        user.id
      );
      const accessTokenLifetime = 30 * 24 * 3600; // 30 days
      const accessToken = generateJWT(sessionData, accessTokenLifetime);

      reply.setCookie(COOKIE_NAME_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        path: "/",
        maxAge: accessTokenLifetime,
      });

      const res: TypeAPIBody<TypeResponseLogin> = {
        statusCode: 200,
        data: sessionData,
      };

      return res;
    })
  );
}
