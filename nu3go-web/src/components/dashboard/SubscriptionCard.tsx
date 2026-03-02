"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Subscription } from "@/types";
import {
    MapPin,
    RefreshCcw,
    PauseCircle,
    ArrowUpCircle,
    XCircle,
    Calendar,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionCardProps {
    subscription: Subscription | null;
    loading?: boolean;
}

export function SubscriptionCard({ subscription, loading }: SubscriptionCardProps) {
    if (loading) {
        return (
            <div className="card space-y-4" aria-busy="true">
                <div className="skeleton h-5 w-48 rounded" />
                <div className="skeleton h-4 w-64 rounded" />
                <div className="flex gap-3 mt-2">
                    <div className="skeleton h-9 w-28 rounded-lg" />
                    <div className="skeleton h-9 w-28 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="card text-center py-10">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800">No Active Subscription</h3>
                <p className="text-neutral-500 text-sm mt-1 mb-5">
                    Subscribe to a plan to start enjoying healthy breakfasts.
                </p>
                <Link href="/plans" className="btn-primary btn-md inline-flex">
                    Browse Plans
                </Link>
            </div>
        );
    }

    const planTypeLabel: Record<string, string> = {
        pickup: "Pickup",
        delivery: "Delivery",
        hybrid: "Hybrid (12-Meal)",
    };

    return (
        <div className="card space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            {subscription.plan.name}
                        </h2>
                        <StatusBadge status={subscription.status} />
                    </div>
                    <p className="text-sm text-neutral-500">
                        {planTypeLabel[subscription.type]} •{" "}
                        {formatCurrency(subscription.plan.priceLkr)}/cycle
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Auto-renew</p>
                    <p className={`text-sm font-semibold ${subscription.autoRenew ? "text-green-600" : "text-neutral-500"}`}>
                        {subscription.autoRenew ? "On" : "Off"}
                    </p>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Start Date</p>
                    <p className="text-sm font-medium text-neutral-800">
                        {formatDate(subscription.startDate)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Valid Until</p>
                    <p className="text-sm font-medium text-neutral-800">
                        {formatDate(subscription.endDate)}
                    </p>
                </div>
                {subscription.nextBillingDate && (
                    <div>
                        <p className="text-xs text-neutral-500 mb-0.5">Next Billing</p>
                        <p className="text-sm font-medium text-neutral-800">
                            {formatDate(subscription.nextBillingDate)}
                        </p>
                    </div>
                )}
            </div>

            {/* Location */}
            {subscription.locationId && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span>Pickup location assigned</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Link
                    href="/dashboard/subscription"
                    className="btn-outline btn-sm inline-flex"
                >
                    <ArrowUpCircle className="w-4 h-4" />
                    Upgrade / Change
                </Link>

                {subscription.status === "active" && (
                    <button className="btn-secondary btn-sm inline-flex">
                        <PauseCircle className="w-4 h-4" />
                        Pause
                    </button>
                )}

                {subscription.status === "paused" && (
                    <button className="btn-primary btn-sm inline-flex">
                        <RefreshCcw className="w-4 h-4" />
                        Resume
                    </button>
                )}

                <button className="btn-ghost btn-sm inline-flex text-red-500 hover:bg-red-50 hover:text-red-600">
                    <XCircle className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </div>
    );
}
