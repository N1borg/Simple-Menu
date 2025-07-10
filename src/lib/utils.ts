import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes and formats an email address
 */
export function sanitizeEmail(
  email: string | undefined | null
): string | undefined {
  if (!email || typeof email !== "string") return undefined;

  // Trim whitespace and convert to lowercase
  const cleaned = email.trim().toLowerCase();

  // Return undefined if empty after trimming
  if (!cleaned) return undefined;

  // Limit length to 255 characters
  if (cleaned.length > 255) return undefined;

  return cleaned;
}

/**
 * Sanitizes and formats a phone number
 * Keeps digits, spaces, dots, dashes, parentheses and + at the beginning
 */
export function sanitizePhone(
  phone: string | undefined | null
): string | undefined {
  if (!phone || typeof phone !== "string") return undefined;

  // Trim whitespace
  let cleaned = phone.trim();

  // Return undefined if empty after trimming
  if (!cleaned) return undefined;

  // Keep only digits, spaces, dots, dashes, parentheses and + at the beginning
  cleaned = cleaned.replace(/[^\d\s.\-()+ ]/g, "");

  // Ensure + is only at the beginning if present
  if (cleaned.includes("+")) {
    const firstPlusIndex = cleaned.indexOf("+");
    if (firstPlusIndex === 0) {
      // Keep the first + and remove any others
      cleaned = "+" + cleaned.substring(1).replace(/\+/g, "");
    } else {
      // Remove all + if not at the beginning
      cleaned = cleaned.replace(/\+/g, "");
    }
  }

  // Limit length to 20 characters
  if (cleaned.length > 20) return undefined;

  return cleaned || undefined;
}

/**
 * Sanitizes a general text field with length limit
 */
export function sanitizeText(
  text: string | undefined | null,
  maxLength: number = 500
): string | undefined {
  if (!text || typeof text !== "string") return undefined;

  const cleaned = text.trim();

  // Return undefined if empty after trimming
  if (!cleaned) return undefined;

  // Limit length
  if (cleaned.length > maxLength) return cleaned.substring(0, maxLength);

  return cleaned;
}

/**
 * Sanitizes and formats Facebook URL
 */
export function sanitizeFacebookUrl(
  input: string | undefined | null
): string | undefined {
  if (!input || typeof input !== "string") return undefined;

  const cleaned = input.trim();
  if (!cleaned) return undefined;

  // Remove any protocol or domain if user pasted a full URL
  const pageNameOnly = cleaned
    .replace(/^https?:\/\/(www\.)?facebook\.com\//, "")
    .replace(/^\/+/, "")
    .replace(/\/$/, "");

  if (!pageNameOnly) return undefined;

  // Validate page name format (letters, numbers, dots, underscores)
  if (!/^[a-zA-Z0-9._-]+$/.test(pageNameOnly)) return undefined;

  return `https://www.facebook.com/${pageNameOnly}`;
}

/**
 * Sanitizes and formats Instagram URL
 */
export function sanitizeInstagramUrl(
  input: string | undefined | null
): string | undefined {
  if (!input || typeof input !== "string") return undefined;

  const cleaned = input.trim();
  if (!cleaned) return undefined;

  // Remove any protocol, domain, or @ symbol if user pasted a full URL or used @username
  const usernameOnly = cleaned
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@+/, "")
    .replace(/^\/+/, "")
    .replace(/\/$/, "");

  if (!usernameOnly) return undefined;

  // Validate username format (letters, numbers, dots, underscores)
  if (!/^[a-zA-Z0-9._]+$/.test(usernameOnly)) return undefined;

  return `https://www.instagram.com/${usernameOnly}`;
}
