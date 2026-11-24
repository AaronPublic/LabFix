// One place for the color of each status, so badges, timeline dots,
// cards, and progress steps always match. Uses the school colors:
//   Pending     = red    (new, needs attention)
//   In Progress = yellow (being worked on)
//   Resolved    = blue   (done)
import { STATUSES } from "./constants";

export const STATUS_STYLES = {
  [STATUSES.PENDING]: {
    badge: "bg-crimson-50 text-crimson-800 ring-crimson-200",
    dot: "bg-crimson-600",
    border: "border-l-crimson-600",
  },
  [STATUSES.IN_PROGRESS]: {
    badge: "bg-gold-100 text-gold-900 ring-gold-300",
    dot: "bg-gold-500",
    border: "border-l-gold-500",
  },
  [STATUSES.RESOLVED]: {
    badge: "bg-brand-50 text-brand-800 ring-brand-200",
    dot: "bg-brand-700",
    border: "border-l-brand-700",
  },
};

export const FALLBACK_STYLE = {
  badge: "bg-slate-100 text-slate-700 ring-slate-200",
  dot: "bg-slate-400",
  border: "border-l-slate-300",
};

export function statusStyle(status) {
  return STATUS_STYLES[status] || FALLBACK_STYLE;
}
