import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the establishment color or returns default blue if null/undefined
 */
export function getEstablishmentColor(color: string | null | undefined): string {
  return color || '#3b82f6'; // Default to blue-600
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

  // Validate page name format (letters, numbers, dots, underscores, slash for p/ pages)
  if (!/^[a-zA-Z0-9._\/-]+$/.test(pageNameOnly)) return undefined;

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

// Opening hours utilities
export interface TimeSlot {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
}

export interface DaySchedule {
  day: string;
  isClosed: boolean;
  hasSecondPeriod: boolean;
  firstPeriod: TimeSlot;
  secondPeriod: TimeSlot;
}

export const defaultTimeSlot: TimeSlot = {
  startHour: "",
  startMinute: "",
  endHour: "",
  endMinute: "",
};

export const defaultDaySchedule = (day: string): DaySchedule => ({
  day,
  isClosed: true,
  hasSecondPeriod: false,
  firstPeriod: { ...defaultTimeSlot },
  secondPeriod: { ...defaultTimeSlot },
});

export const defaultWeekSchedule: DaySchedule[] = [
  "Lun.",
  "Mar.",
  "Mer.",
  "Jeu.",
  "Ven.",
  "Sam.",
  "Dim.",
].map((day) => defaultDaySchedule(day));

// Parse legacy hours string format to structured format
export const parseHoursString = (
  hoursString: string
): {
  firstPeriod: TimeSlot;
  secondPeriod: TimeSlot;
  hasSecondPeriod: boolean;
} => {
  if (!hoursString || hoursString.toLowerCase().includes("fermé")) {
    return {
      firstPeriod: { ...defaultTimeSlot },
      secondPeriod: { ...defaultTimeSlot },
      hasSecondPeriod: false,
    };
  }

  // Validate that we have valid hour/minute values (not just numbers without colons)
  const validateTimeSlot = (hour: string, minute: string): boolean => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  // Check for two periods (e.g., "09:00 - 12:00 14:00 - 18:00")
  const doublePeriodMatch = hoursString.match(
    /(\d{1,2}):(\d{1,2})\s*-\s*(\d{1,2}):(\d{1,2})\s+(\d{1,2}):(\d{1,2})\s*-\s*(\d{1,2}):(\d{1,2})/
  );
  if (doublePeriodMatch) {
    const [, startHour1, startMin1, endHour1, endMin1, startHour2, startMin2, endHour2, endMin2] = doublePeriodMatch;
    
    // Validate all time components
    if (validateTimeSlot(startHour1, startMin1) && validateTimeSlot(endHour1, endMin1) &&
        validateTimeSlot(startHour2, startMin2) && validateTimeSlot(endHour2, endMin2)) {
      return {
        firstPeriod: {
          startHour: startHour1.padStart(2, "0"),
          startMinute: startMin1.padStart(2, "0"),
          endHour: endHour1.padStart(2, "0"),
          endMinute: endMin1.padStart(2, "0"),
        },
        secondPeriod: {
          startHour: startHour2.padStart(2, "0"),
          startMinute: startMin2.padStart(2, "0"),
          endHour: endHour2.padStart(2, "0"),
          endMinute: endMin2.padStart(2, "0"),
        },
        hasSecondPeriod: true,
      };
    }
  }

  // Check for single period (e.g., "09:00 - 18:00")
  const singlePeriodMatch = hoursString.match(
    /(\d{1,2}):(\d{1,2})\s*-\s*(\d{1,2}):(\d{1,2})/
  );
  if (singlePeriodMatch) {
    const [, startHour, startMin, endHour, endMin] = singlePeriodMatch;
    
    // Validate time components
    if (validateTimeSlot(startHour, startMin) && validateTimeSlot(endHour, endMin)) {
      return {
        firstPeriod: {
          startHour: startHour.padStart(2, "0"),
          startMinute: startMin.padStart(2, "0"),
          endHour: endHour.padStart(2, "0"),
          endMinute: endMin.padStart(2, "0"),
        },
        secondPeriod: { ...defaultTimeSlot },
        hasSecondPeriod: false,
      };
    }
  }

  // If we reach here, the format is invalid or unrecognized
  return {
    firstPeriod: { ...defaultTimeSlot },
    secondPeriod: { ...defaultTimeSlot },
    hasSecondPeriod: false,
  };
};

// Convert structured format to legacy hours string format
export const formatToHoursString = (schedule: DaySchedule): string => {
  if (schedule.isClosed) {
    return "Fermé";
  }

  const formatTime = (slot: TimeSlot) => {
    if (!slot.startHour || !slot.startMinute || !slot.endHour || !slot.endMinute) {
      return '';
    }
    return `${slot.startHour}:${slot.startMinute} - ${slot.endHour}:${slot.endMinute}`;
  };

  const firstPeriodStr = formatTime(schedule.firstPeriod);

  if (!schedule.hasSecondPeriod || !firstPeriodStr) {
    return firstPeriodStr || "Fermé";
  }

  const secondPeriodStr = formatTime(schedule.secondPeriod);

  if (!secondPeriodStr) {
    return firstPeriodStr;
  }

  return `${firstPeriodStr} ${secondPeriodStr}`;
};

// Convert legacy opening hours array to structured format
export const convertLegacyHours = (
  legacyHours: Array<{ day: string; hours: string }>
): DaySchedule[] => {
  // Create a deep copy of the default schedule to avoid mutation
  const schedule = defaultWeekSchedule.map(daySchedule => ({
    ...daySchedule,
    firstPeriod: { ...daySchedule.firstPeriod },
    secondPeriod: { ...daySchedule.secondPeriod }
  }));

  legacyHours.forEach(({ day, hours }) => {
    const scheduleIndex = schedule.findIndex((s) => s.day === day);
    if (scheduleIndex !== -1) {
      const parsed = parseHoursString(hours);
      schedule[scheduleIndex] = {
        day,
        isClosed: !hours || hours.toLowerCase().includes("fermé"),
        hasSecondPeriod: parsed.hasSecondPeriod,
        firstPeriod: parsed.firstPeriod,
        secondPeriod: parsed.secondPeriod,
      };
    }
  });

  return schedule;
};

// Convert structured format to legacy opening hours array
export const convertToLegacyHours = (
  schedule: DaySchedule[]
): Array<{ day: string; hours: string }> => {
  return schedule
    .map((daySchedule) => ({
      day: daySchedule.day,
      hours: formatToHoursString(daySchedule),
    }))
    .filter((item) => item.hours && item.hours !== "Fermé");
};

// Validate time input
export const sanitizeTimeInput = (value: string): string => {
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Limit to 2 digits
  return numbers.slice(0, 2);
};

// Validate hour (0-23)
export const validateHour = (hour: string): boolean => {
  const num = parseInt(hour, 10);
  return !isNaN(num) && num >= 0 && num <= 23;
};

// Validate minute (0-59)
export const validateMinute = (minute: string): boolean => {
  const num = parseInt(minute, 10);
  return !isNaN(num) && num >= 0 && num <= 59;
};
