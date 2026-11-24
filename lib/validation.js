// =============================================================
// lib/validation.js: check ALL user input on the server.
// Never trust the browser: someone can skip the form and send
// any data they want straight to the API.
// Each function returns { ok, errors, data }.
//   errors = { fieldName: "message" }
//   data   = the cleaned-up values (only use these after ok is true)
// =============================================================
import {
  ALLOWED_PHOTO_TYPES,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  ISSUE_TYPES,
  MAX_PHOTO_BYTES,
  PC_NUMBER_PATTERN,
  REMARKS_MAX,
  STATUS_LIST,
} from "./constants";
import { getLabById } from "./data";

// Turn any value into a trimmed string ("" if it is not a string).
function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function result(errors, data) {
  return { ok: Object.keys(errors).length === 0, errors, data };
}

export function validateLogin(input) {
  const email = text(input?.email).toLowerCase();
  const password = typeof input?.password === "string" ? input.password : "";
  const errors = {};

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password || password.length > 200) {
    errors.password = "Enter your password.";
  }
  return result(errors, { email, password });
}

export async function validateReport(input) {
  const labId = text(input.labId);
  const pcNumber = text(input.pcNumber).toUpperCase();
  const issueType = text(input.issueType);
  const description = text(input.description);
  const errors = {};

  if (!labId || !(await getLabById(labId))) {
    errors.labId = "Please choose a lab.";
  }
  if (!PC_NUMBER_PATTERN.test(pcNumber)) {
    errors.pcNumber = "Use letters, numbers, and dashes only (max 10), e.g. PC-12.";
  }
  if (!ISSUE_TYPES.includes(issueType)) {
    errors.issueType = "Please choose an issue type.";
  }
  if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} characters.`;
  }
  return result(errors, { labId, pcNumber, issueType, description });
}

// Check the first bytes of the file ("magic bytes") to find its REAL type.
// The file name and the browser's content type can both be faked.
function detectImageType(bytes) {
  const startsWith = (sig, offset = 0) => sig.every((b, i) => bytes[offset + i] === b);

  if (startsWith([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  // WEBP = "RIFF" + 4 size bytes + "WEBP"
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

// file = a File from request.formData()
export async function validatePhoto(file) {
  const fail = (message) => result({ photo: message }, null);

  if (!file || typeof file === "string" || file.size === 0) {
    return fail("Please attach a photo of the problem.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return fail("Photo is too large. The maximum size is 5 MB.");
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return fail("Only JPEG, PNG, or WEBP photos are allowed.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) {
    return fail("This file is not a real JPEG, PNG, or WEBP image.");
  }
  return result({}, { buffer, contentType: detected.mime, ext: detected.ext });
}

export function validateStatusUpdate(input) {
  const status = text(input?.status);
  const remarks = text(input?.remarks);
  const errors = {};

  if (!STATUS_LIST.includes(status)) {
    errors.status = "Please choose a valid status.";
  }
  if (remarks.length > REMARKS_MAX) {
    errors.remarks = `Remarks must be ${REMARKS_MAX} characters or less.`;
  }
  return result(errors, { status, remarks });
}
