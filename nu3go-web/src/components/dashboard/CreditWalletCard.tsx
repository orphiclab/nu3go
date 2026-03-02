"use client";

import { formatCurrency, formatRelative } from "@/lib/utils";
import type { CreditWallet } from "@/types";
import { Wallet, Plus } from "lucide-react";

interface CreditWalletCardProps {
    wallet: CreditWallet | null;
    loading?: boolean;
}

export function CreditWalletCard({ wallet, loading }: CreditWalletCardProps) {
    if (loading) {
        return (
            <div className="card space-y-3" aria-busy="true">
                <div className="skeleton h-5 w-32 rounded" />
                <div className="skeleton h-10 w-40 rounded" />
                <div className="skeleton h-4 w-28 rounded" />
            </div>
        );
    }

    return (
        <div className="card h-full" role="region" aria-label="Credit wallet">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-700">Credit Wallet</h3>
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary-600" aria-hidden="true" />
                </div>
            </div>

            <div className="py-2">
                <p className="text-4xl font-bold text-neutral-900">
                    {formatCurrency(wallet?.balanceLkr ?? 0)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                    {wallet?.updatedAt
                        ? `Updated ${formatRelative(wallet.updatedAt)}`
                        : "No credits yet"}
                </p>
            </div>

            <div className="mt-4 space-y-2">
                <button className="btn-primary btn-sm w-full justify-center">
                    <Plus className="w-4 h-4" />
                    Top Up Credits
                </button>
                <a
                    href="/dashboard/credits"
                    className="btn-ghost btn-sm w-full justify-center text-neutral-600"
                >
                    View History
                </a>
            </div>

            {wallet && wallet.balanceLkr > 0 && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mt-3">
                    ✓ Credits apply automatically on next renewal.
                </p>
            )}
        </div>
    );
}
