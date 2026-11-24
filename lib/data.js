// =============================================================
// lib/data.js: ALL data access for LabFix lives in this file.
//
// Right now the data is MOCK data kept in memory. It resets when the
// server restarts. Later, replace the body of each function with a
// real RDS MySQL query. The rest of the app will not need to change,
// as long as each function keeps the same name, inputs, and outputs.
// =============================================================
import { STATUSES } from "./constants";

// ---------- Mock data ----------

const labs = [
  { id: "lab-1", name: "Computer Lab 1", building: "Main Building, 2F" },
  { id: "lab-2", name: "Computer Lab 2", building: "Main Building, 2F" },
  { id: "lab-3", name: "Computer Lab 3", building: "Engineering Building, 3F" },
  { id: "lab-4", name: "Computer Lab 4", building: "Engineering Building, 3F" },
];

// Passwords are stored ONLY as scrypt "salt:hash" values (see lib/password.js).
// Demo passwords: Reporter123! and Support123!
const users = [
  {
    id: "u-1",
    name: "Juan Dela Cruz",
    email: "reporter@labfix.edu",
    role: "reporter",
    passwordHash:
      "c9cc945cb9f167c1c6785dcb69e41027:3483dce9216379fabf16eeef6f458fee36aa520fc47d7ae8c58af2dec5155fa56625aae5d9b18cd2761e622e517675e1487f5aea871da60e2fb916e09c7c82f0",
  },
  {
    id: "u-2",
    name: "Maria Santos",
    email: "itsupport@labfix.edu",
    role: "it_support",
    passwordHash:
      "5ad37bc8596b2eb89a6842bee0072ed8:0ecce96fd845662d42171bc47b13dbc9c66f76d80f8f1b329b36af4c8ac0eb639e3f0baecad08cc4f7d3176fc1d35cf3971e44658663cfa39d4cb97ea52e5874",
  },
];

// Helper to build a sample report with its status history.
function sample(num, labId, pcNumber, issueType, description, status, createdAt, history) {
  return {
    id: formatReportId(num),
    labId,
    pcNumber,
    issueType,
    description,
    photoKey: `reports/sample-${num}.jpg`,
    status,
    reporterId: "u-1",
    reporterName: "Juan Dela Cruz",
    createdAt,
    updatedAt: history.length ? history[history.length - 1].at : createdAt,
    history: [
      { status: STATUSES.PENDING, at: createdAt, by: "Juan Dela Cruz", remarks: "Report submitted" },
      ...history,
    ],
  };
}

const sampleReports = [
  sample(1, "lab-1", "PC-03", "No display", "Monitor stays black even though the CPU is on. Tried another cable.", STATUSES.RESOLVED, "2026-11-17T01:15:00.000Z", [
    { status: STATUSES.IN_PROGRESS, at: "2026-11-17T03:00:00.000Z", by: "Maria Santos", remarks: "Checking the monitor and VGA cable." },
    { status: STATUSES.RESOLVED, at: "2026-11-17T05:30:00.000Z", by: "Maria Santos", remarks: "Replaced the faulty monitor." },
  ]),
  sample(2, "lab-2", "PC-12", "No internet connection", "Cannot open any website. The network icon shows no internet access.", STATUSES.IN_PROGRESS, "2026-11-19T02:40:00.000Z", [
    { status: STATUSES.IN_PROGRESS, at: "2026-11-19T06:10:00.000Z", by: "Maria Santos", remarks: "LAN port on the switch may be faulty." },
  ]),
  sample(3, "lab-3", "PC-07", "Keyboard or mouse problem", "Several keys on the keyboard (E, R, T) are not working.", STATUSES.PENDING, "2026-11-21T00:55:00.000Z", []),
  sample(4, "lab-1", "PC-20", "Won't turn on / won't boot", "PC does not turn on at all. No lights when pressing the power button.", STATUSES.PENDING, "2026-11-23T07:20:00.000Z", []),
  sample(5, "lab-4", "PC-15", "Software problem", "Visual Studio Code crashes every time we open a project folder.", STATUSES.IN_PROGRESS, "2026-11-22T04:05:00.000Z", [
    { status: STATUSES.IN_PROGRESS, at: "2026-11-22T08:45:00.000Z", by: "Maria Santos", remarks: "Reinstalling VS Code." },
  ]),
  sample(6, "lab-2", "PC-01", "Slow or freezing", "Instructor PC freezes for a few minutes when opening the browser.", STATUSES.RESOLVED, "2026-11-14T03:30:00.000Z", [
    { status: STATUSES.IN_PROGRESS, at: "2026-11-14T05:00:00.000Z", by: "Maria Santos", remarks: "Running disk and malware scan." },
    { status: STATUSES.RESOLVED, at: "2026-11-15T02:00:00.000Z", by: "Maria Santos", remarks: "Upgraded RAM to 8 GB. Running smoothly now." },
  ]),
];

// Keep the data on globalThis so every API route and page shares the SAME
// copy (and so it survives hot reloads in development).
if (!globalThis.__labfix) {
  globalThis.__labfix = {
    labs,
    users,
    reports: sampleReports,
    nextReportNumber: sampleReports.length + 1,
  };
}
const db = globalThis.__labfix;

// ---------- Helpers ----------

// 7 -> "LF-0007"
function formatReportId(num) {
  return `LF-${String(num).padStart(4, "0")}`;
}

// Add the lab name to a report so pages can show it easily.
function withLab(report) {
  const lab = db.labs.find((l) => l.id === report.labId);
  return { ...report, labName: lab ? lab.name : "Unknown lab" };
}

// Return a copy so callers cannot change the stored data by accident.
function copy(value) {
  return structuredClone(value);
}

// ---------- Data functions (used by pages and API routes) ----------

export async function getLabs() {
  // TODO: replace with RDS MySQL query
  // SELECT id, name, building FROM labs ORDER BY name
  return copy(db.labs);
}

export async function getLabById(id) {
  // TODO: replace with RDS MySQL query
  // SELECT id, name, building FROM labs WHERE id = ?
  const lab = db.labs.find((l) => l.id === id);
  return lab ? copy(lab) : null;
}

// Filters are optional: { labId, status, reporterId }
export async function getReports(filters = {}) {
  // TODO: replace with RDS MySQL query
  // SELECT r.*, l.name AS labName FROM reports r JOIN labs l ON l.id = r.lab_id
  // WHERE (? IS NULL OR r.lab_id = ?) AND ... ORDER BY r.created_at DESC
  // (Always use ? placeholders, never build SQL with string concatenation.)
  const { labId, status, reporterId } = filters;
  return db.reports
    .filter((r) => !labId || r.labId === labId)
    .filter((r) => !status || r.status === status)
    .filter((r) => !reporterId || r.reporterId === reporterId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => copy(withLab(r)));
}

export async function getReportById(id) {
  // TODO: replace with RDS MySQL query
  // SELECT ... FROM reports WHERE id = ?  (+ SELECT ... FROM report_history WHERE report_id = ?)
  const report = db.reports.find((r) => r.id === id);
  return report ? copy(withLab(report)) : null;
}

// Counts for the dashboard summary cards.
export async function getReportStats() {
  // TODO: replace with RDS MySQL query
  // SELECT status, COUNT(*) AS total FROM reports GROUP BY status
  const count = (status) => db.reports.filter((r) => r.status === status).length;
  return {
    total: db.reports.length,
    pending: count(STATUSES.PENDING),
    inProgress: count(STATUSES.IN_PROGRESS),
    resolved: count(STATUSES.RESOLVED),
  };
}

// data = { labId, pcNumber, issueType, description, photoKey }, user = session user
export async function createReport(data, user) {
  // TODO: replace with RDS MySQL query
  // INSERT INTO reports (lab_id, pc_number, issue_type, description, photo_key, status, reporter_id)
  // VALUES (?, ?, ?, ?, ?, 'Pending', ?)
  const now = new Date().toISOString();
  const report = {
    id: formatReportId(db.nextReportNumber++),
    labId: data.labId,
    pcNumber: data.pcNumber,
    issueType: data.issueType,
    description: data.description,
    photoKey: data.photoKey,
    status: STATUSES.PENDING,
    reporterId: user.id,
    reporterName: user.name,
    createdAt: now,
    updatedAt: now,
    history: [{ status: STATUSES.PENDING, at: now, by: user.name, remarks: "Report submitted" }],
  };
  db.reports.push(report);
  return copy(withLab(report));
}

// Changes a report's status and adds an entry to its history.
// Returns the updated report, or null if the report does not exist.
export async function updateReportStatus(id, status, remarks, user) {
  // TODO: replace with RDS MySQL query
  // UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?
  // INSERT INTO report_history (report_id, status, remarks, changed_by) VALUES (?, ?, ?, ?)
  const report = db.reports.find((r) => r.id === id);
  if (!report) return null;

  const now = new Date().toISOString();
  report.status = status;
  report.updatedAt = now;
  report.history.push({ status, at: now, by: user.name, remarks: remarks || "" });
  return copy(withLab(report));
}

// Used by login. Returns the user INCLUDING the password hash,
// so only call this from server code that checks passwords.
export async function findUserByEmail(email) {
  // TODO: replace with RDS MySQL query
  // SELECT id, name, email, role, password_hash FROM users WHERE email = ?
  const user = db.users.find((u) => u.email === String(email).toLowerCase());
  return user ? copy(user) : null;
}
