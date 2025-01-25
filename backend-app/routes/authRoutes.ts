import {
  APIError,
  composeMiddlewareList,
  type TypeAPIBody,
} from "../utils/apiUtils.ts";
import dbMiddleware from "../middlewares/dbMiddleware.ts";
import type { FastifyInstance } from "fastify";
import type {
  TypeRequestLogin,
  TypeResponseLogin,
  TypeSession,
} from "../../shared/types.ts";
import {
  checkPassword,
  generateAccessTokenFromSessionData,
  getSessionData,
} from "../utils/authUtils.ts";
import { COOKIE_NAME_ACCESS_TOKEN } from "../../shared/constants.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";

export default async function (fastify: FastifyInstance) {
  // Login
  fastify.post(
    "/login",
    composeMiddlewareList(dbMiddleware)(async (request, reply) => {
      const bodyRequest = request.body as TypeRequestLogin;

      const user = await request.trx.user.findFirst({
        where: {
          email: {
            equals: bodyRequest.email,
            mode: "insensitive",
          },
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
      const { accessTokenLifetime, accessToken } =
        generateAccessTokenFromSessionData(sessionData);

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

  fastify.get(
    "/getSessionData",
    composeMiddlewareList(
      dbMiddleware,
      authMiddleware
    )(async (request, reply) => {
      // update token
      const sessionData: TypeSession = request.session;
      const { accessTokenLifetime, accessToken } =
        generateAccessTokenFromSessionData(sessionData);

      reply.setCookie(COOKIE_NAME_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        path: "/",
        maxAge: accessTokenLifetime,
      });

      const res: TypeAPIBody<TypeSession> = {
        statusCode: 200,
        data: sessionData,
      };

      return res;
    })
  );
}
