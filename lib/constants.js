// Shared values used by both the pages and the API routes.

export const ROLES = {
  REPORTER: "reporter",
  IT_SUPPORT: "it_support",
};

// Friendly names for each role (shown in the navbar).
export const ROLE_LABELS = {
  [ROLES.REPORTER]: "Reporter",
  [ROLES.IT_SUPPORT]: "IT Support",
};

// Where each role goes after logging in.
export const ROLE_HOME = {
  [ROLES.REPORTER]: "/my-reports",
  [ROLES.IT_SUPPORT]: "/dashboard",
};

export const STATUSES = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

// Status order: Pending -> In Progress -> Resolved
export const STATUS_LIST = [STATUSES.PENDING, STATUSES.IN_PROGRESS, STATUSES.RESOLVED];

export const ISSUE_TYPES = [
  "No display",
  "Won't turn on / won't boot",
  "No internet connection",
  "Keyboard or mouse problem",
  "Slow or freezing",
  "Software problem",
  "Other",
];

// Report form limits
export const PC_NUMBER_PATTERN = /^[A-Za-z0-9-]{1,10}$/;
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 500;
export const REMARKS_MAX = 300;

// Photo upload limits
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Session settings
export const SESSION_COOKIE = "labfix_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours, in seconds

// Login rate limit: 5 attempts per 15 minutes
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Dates are shown in the university's local time zone.
export const TIME_ZONE = "Asia/Manila";
