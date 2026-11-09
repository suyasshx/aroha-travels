import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken, SessionUser } from "../src/lib/auth";
import { UserRole } from "@prisma/client";

describe("1 & 2. Authentication & Unauthorized Access Tests", () => {
  it("should securely hash and verify passwords using bcrypt", async () => {
    const rawPassword = "ArohaAdmin2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should generate a valid JWT session token and verify claims", () => {
    const user: SessionUser = {
      id: "user-uuid-123",
      name: "Aroha Admin",
      email: "admin@aroha.com",
      role: UserRole.STAFF_ADMIN,
    };

    const token = signToken(user);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe(user.email);
    expect(decoded?.role).toBe(UserRole.STAFF_ADMIN);
  });

  it("should reject tampered or invalid JWT tokens", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature";
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it("should differentiate between STAFF_ADMIN and TRAVELLER roles", () => {
    const traveller: SessionUser = {
      id: "traveller-123",
      name: "Siddharth",
      email: "siddharth@example.com",
      role: UserRole.TRAVELLER,
    };

    const token = signToken(traveller);
    const decoded = verifyToken(token);
    expect(decoded?.role).toBe(UserRole.TRAVELLER);
    expect(decoded?.role === UserRole.STAFF_ADMIN).toBe(false);
  });
});

