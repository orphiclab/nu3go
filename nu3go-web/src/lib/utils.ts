import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// ─── Class Name Utility ─────────────────────────────────
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Currency Formatting ────────────────────────────────
export function formatCurrency(amount: number, currency = "LKR"): string {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// ─── Date Formatting ────────────────────────────────────
export function formatDate(
    date: string | Date,
    formatStr = "d MMM yyyy"
): string {
    return format(new Date(date), formatStr);
}

export function formatRelative(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Subscription Status ────────────────────────────────
export type SubscriptionStatus =
    | "active"
    | "paused"
    | "expired"
    | "cancelled"
    | "pending";

export const statusConfig: Record<
    SubscriptionStatus,
    { label: string; className: string }
> = {
    active: { label: "Active", className: "badge-active" },
    paused: { label: "Paused", className: "badge-paused" },
    expired: { label: "Expired", className: "badge-expired" },
    cancelled: { label: "Cancelled", className: "badge-cancelled" },
    pending: { label: "Pending", className: "badge-pending" },
};

// ─── Plan Type Labels ───────────────────────────────────
export const planTypeLabels: Record<string, string> = {
    pickup: "Pickup",
    delivery: "Delivery",
    hybrid: "Hybrid",
};

// ─── Meal Progress ──────────────────────────────────────
export function mealProgressPercent(used: number, total: number): number {
    if (!total) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
}

// ─── Truncate ───────────────────────────────────────────
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return `${str.slice(0, length)}…`;
}

// ─── Build Google Maps Link ─────────────────────────────
export function buildMapsLink(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// ─── Initials from name ─────────────────────────────────
export function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}
