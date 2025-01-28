// server.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fastify from "./index.ts";

describe("Server Integration Tests", () => {
  let server: any;

  // Start the server before all tests
  beforeAll(async () => {
    server = fastify;
    await server.ready();
  });

  // Close the server after all tests
  afterAll(async () => {
    await server.close();
  });

  describe("POST /auth/login", () => {
    it("should return id of logged in user", async () => {
      // Login with registered user
      const response = await request(server.server)
        .post("/auth/login")
        .send({ username: "andy@gmail.com", password: "superadmin" });

      expect(response.status).toBe(200);
      expect(typeof response.body.data.id).toBe("string");
    });

    it("should return 404 if user not found", async () => {
      // Login with unregistered user
      const response = await request(server.server)
        .post("/auth/login")
        .send({ username: "andy@gmail.com", password: "superadmin123" });

      expect(response.status).toBe(404);
    });
  });
});
