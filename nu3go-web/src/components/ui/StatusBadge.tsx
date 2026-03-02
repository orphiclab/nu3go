import { cn, statusConfig, type SubscriptionStatus } from "@/lib/utils";

interface StatusBadgeProps {
    status: SubscriptionStatus;
    className?: string;
}

const dotColors: Record<SubscriptionStatus, string> = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    expired: "bg-red-500",
    cancelled: "bg-neutral-400",
    pending: "bg-blue-500",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <span className={cn("badge", config.className, className)}>
            <span
                className={cn("w-1.5 h-1.5 rounded-full", dotColors[status])}
                aria-hidden="true"
            />
            {config.label}
        </span>
    );
}
