import { describe, it, expect } from "vitest";
import { checkPassword, encryptPassword } from "./authUtils.ts";

describe("Password Utilities", () => {
  const plainPassword = "mySuperSecretPassword123";

  describe("encryptPassword", () => {
    it("should encrypt a password", async () => {
      const hashedPassword = await encryptPassword(plainPassword);
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(plainPassword);
    });
  });

  describe("checkPassword", () => {
    it("should return true for matching passwords", async () => {
      const hashedPassword = await encryptPassword(plainPassword);
      const isMatch = await checkPassword(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const hashedPassword = await encryptPassword(plainPassword);
      const isMatch = await checkPassword("wrongPassword", hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
