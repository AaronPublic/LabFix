// Small helpers for showing dates nicely.
import { TIME_ZONE } from "./constants";

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PH", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
