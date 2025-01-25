import type { TypeMiddleware } from "../utils/apiUtils.ts";
import type { FastifyInstance } from "fastify";
import { COOKIE_NAME_ACCESS_TOKEN } from "../../shared/constants.ts";
import { verifyJWT } from "../utils/jwtUtils.ts";
import { forceLogout, getSessionData } from "../utils/authUtils.ts";
import type { TypeSession } from "../../shared/types.ts";

const authMiddleware: TypeMiddleware = function (next) {
  return async function (this: FastifyInstance, request, reply) {
    const accessToken = request.cookies[COOKIE_NAME_ACCESS_TOKEN];
    if (!accessToken) {
      throw forceLogout(reply);
    }

    let newSession;
    try {
      const session = verifyJWT(accessToken) as TypeSession;
      newSession = await getSessionData(request.trx, session.id);
    } catch (error) {
      throw forceLogout(reply);
    }

    const newRequest = {
      ...request,
      session: newSession,
    };

    return await next.call(this, newRequest, reply);
  };
};

export default authMiddleware;
