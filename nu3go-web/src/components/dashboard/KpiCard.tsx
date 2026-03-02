"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
    label: string;
    value: string | number;
    delta?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    iconColor?: "primary" | "blue" | "amber" | "red" | "purple";
    loading?: boolean;
}

const iconBg: Record<NonNullable<KpiCardProps["iconColor"]>, string> = {
    primary: "bg-primary-50 text-primary-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
};

const trendColors = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-neutral-500",
};

const TrendIcon = ({ trend }: { trend: KpiCardProps["trend"] }) => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
};

export function KpiCard({
    label,
    value,
    delta,
    trend = "neutral",
    icon: Icon,
    iconColor = "primary",
    loading = false,
}: KpiCardProps) {
    if (loading) {
        return (
            <div className="kpi-card" aria-busy="true">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-8 w-32 rounded mt-1" />
                <div className="skeleton h-3 w-16 rounded mt-1" />
            </div>
        );
    }

    return (
        <div className="kpi-card" role="region" aria-label={label}>
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-neutral-500">{label}</p>
                <div
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        iconBg[iconColor]
                    )}
                    aria-hidden="true"
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <p className="text-3xl font-bold text-neutral-900 mt-1">
                {value}
            </p>

            {delta && (
                <div
                    className={cn(
                        "flex items-center gap-1 text-xs font-medium mt-1",
                        trendColors[trend]
                    )}
                    aria-label={`${delta} change`}
                >
                    <TrendIcon trend={trend} />
                    <span>{delta} vs last month</span>
                </div>
            )}
        </div>
    );
}
