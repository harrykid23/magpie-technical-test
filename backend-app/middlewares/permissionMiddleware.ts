import { APIError, type TypeMiddlewareGenerator } from "../utils/apiUtils.ts";
import type { FastifyInstance } from "fastify";

const generatePermissionMiddleware: TypeMiddlewareGenerator<string[]> = (
  permissionNeededList
) =>
  function (next) {
    return async function (this: FastifyInstance, request, reply) {
      const permissionHasSet = new Set(
        request.session.role.mapRolePermissions.map(
          (mapRolePermission) => mapRolePermission.permission.name
        )
      );
      const isPermitted = permissionNeededList.every((permissionNeeded) =>
        permissionHasSet.has(permissionNeeded)
      );
      if (!isPermitted) {
        throw new APIError({
          statusCode: 401,
          data: null,
          displayMessage: "You don't have permission to perform this action",
        });
      }

      return await next.call(this, request, reply);
    };
  };

export default generatePermissionMiddleware;
