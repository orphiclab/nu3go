"use client";

import type { Subscription } from "@/types";
import { mealProgressPercent } from "@/lib/utils";

interface MealProgressCardProps {
    subscription: Subscription | null;
    loading?: boolean;
}

export function MealProgressCard({ subscription, loading }: MealProgressCardProps) {
    if (loading) {
        return (
            <div className="card" aria-busy="true">
                <div className="skeleton h-4 w-36 rounded mb-3" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-24 rounded mt-2" />
            </div>
        );
    }

    if (!subscription || subscription.type !== "hybrid") return null;

    const used = subscription.mealsUsed;
    const total = (subscription.mealsRemaining ?? 0) + used;
    const percent = mealProgressPercent(used, total);

    return (
        <div className="card" role="region" aria-label="Meal progress">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-700">Hybrid Meal Usage</h3>
                <span className="text-xs font-medium text-neutral-500">
                    {used} / {total} meals used
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="w-full bg-neutral-200 rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${used} of ${total} meals used`}
            >
                <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                        width: `${percent}%`,
                        background:
                            percent >= 80
                                ? "#ef4444"
                                : percent >= 60
                                    ? "#f59e0b"
                                    : "#22c55e",
                    }}
                />
            </div>

            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-neutral-500">
                    {subscription.mealsRemaining} meals remaining
                </p>
                <p
                    className={`text-xs font-medium ${percent >= 80 ? "text-red-500" : "text-neutral-600"
                        }`}
                >
                    {percent}%
                </p>
            </div>

            {percent >= 80 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                    ⚡ Running low — consider renewing early.
                </p>
            )}
        </div>
    );
}
