import Fastify from "fastify";
import bookRoutes from "./routes/bookRoutes.ts";
import { APIError, type TypeAPIBody } from "./utils/apiUtils.ts";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import authRoutes from "./routes/authRoutes.ts";
import lendingRoutes from "./routes/lendingRoutes.ts";
import memberRoutes from "./routes/memberRoutes.ts";

// init fastify
dotenv.config();
const fastify = Fastify();
fastify.register(fastifyCors, {
  origin: true,
});
fastify.register(fastifyCookie);

// set global error handler
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof APIError) {
    // for handled error, show the error message
    reply.code(error.bodyResponse.statusCode).send(error.bodyResponse);
  } else {
    // for unhandled error, log the error message
    console.error(error.message);
    const bodyResponse: TypeAPIBody<null> = {
      statusCode: 500,
      displayMessage: "Unknown error occurred. Please try again later",
      data: null,
    };
    reply.code(bodyResponse.statusCode).send(bodyResponse);
  }
});

// Register routes
fastify.register(authRoutes, { prefix: "/auth" });
fastify.register(bookRoutes, { prefix: "/book" });
fastify.register(lendingRoutes, { prefix: "/lending" });
fastify.register(memberRoutes, { prefix: "/member" });

// start the server
const start = async () => {
  const PORT = parseInt(process.env.PORT as string) || 3000;
  try {
    await fastify.listen({
      port: PORT,
    });
    console.log(`Server running at http://localhost:${PORT}/`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
