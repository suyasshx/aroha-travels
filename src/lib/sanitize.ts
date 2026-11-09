/**
 * Input Sanitization & XSS Protection Utilities
 * Protects forms and API payloads against Cross-Site Scripting (XSS),
 * HTML tag injection, and malicious script payload vectors.
 */

// Strip HTML tags and dangerous patterns
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    return String(input);
  }

  return input
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove script tags and content within
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe, embed, object, frame tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Remove dangerous protocol prefixes
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "")
    // Strip on* event handlers like onload=, onerror=, onclick=
    .replace(/\bon\w+\s*=/gi, "")
    // Strip raw HTML tags while preserving text content
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

/**
 * Escapes characters for safe HTML output rendering
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Recursively sanitizes all string properties in an object or array.
 */
export function sanitizeObject<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeText(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }
  return data;
}

