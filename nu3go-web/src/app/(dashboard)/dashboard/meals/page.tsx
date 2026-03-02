"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatDate } from "@/lib/utils";
import type { MealLog } from "@/types";
import { Utensils, RefreshCcw, Calendar, Loader2, QrCode } from "lucide-react";

export default function MealsPage() {
    const [qrData, setQrData] = useState<{ token: string; expiresAt: string } | null>(null);
    const [logs, setLogs] = useState<MealLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrLoading, setQrLoading] = useState(false);
    const [mealsUsed, setMealsUsed] = useState<number>(0);
    const [mealsRemaining, setMealsRemaining] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [qrRes, logsRes, remainRes] = await Promise.allSettled([
                api.get("/pickup/qr/my-code"),
                api.get("/meals/my/history?limit=10"),
                api.get("/meals/my/remaining"),
            ]);
            if (qrRes.status === "fulfilled") setQrData((qrRes.value as any).data);
            if (logsRes.status === "fulfilled") setLogs((logsRes.value as any).data?.items ?? []);
            if (remainRes.status === "fulfilled") {
                const d = (remainRes.value as any).data;
                setMealsUsed(d?.mealsUsed ?? 0);
                setMealsRemaining(d?.mealsRemaining ?? null);
            }
        } finally {
            setLoading(false);
        }
    }

    async function refreshQr() {
        setQrLoading(true);
        try {
            const res = await api.post("/pickup/qr/refresh");
            setQrData((res as any).data);
        } finally {
            setQrLoading(false);
        }
    }

    const methodLabel: Record<string, string> = {
        nfc: "NFC Tap",
        qr: "QR Scan",
        manual: "Manual",
        delivery: "Delivery",
    };

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">My Meals</h1>
                <p className="text-neutral-500 text-sm mt-1">Pickup QR code and meal history.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KpiCard
                    label="Meals Used This Cycle"
                    value={mealsUsed}
                    icon={Utensils}
                    iconColor="primary"
                    loading={loading}
                />
                <KpiCard
                    label="Meals Remaining"
                    value={mealsRemaining != null ? mealsRemaining : "Unlimited"}
                    icon={Calendar}
                    iconColor="blue"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* QR Code Card */}
                <div className="card flex flex-col items-center gap-4 py-8">
                    <div className="flex items-center gap-2 mb-2 self-start w-full justify-between">
                        <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-primary-500" />
                            Your Pickup QR Code
                        </h2>
                        <button
                            onClick={refreshQr}
                            disabled={qrLoading}
                            className="btn-ghost btn-sm text-primary-600"
                        >
                            {qrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                        </button>
                    </div>

                    {loading ? (
                        <div className="skeleton w-48 h-48 rounded-xl" />
                    ) : qrData ? (
                        <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                            <QRCodeSVG
                                value={qrData.token}
                                size={180}
                                bgColor="#ffffff"
                                fgColor="#15803d"
                                level="M"
                                includeMargin
                            />
                        </div>
                    ) : (
                        <div className="text-center text-neutral-400 py-10">
                            <QrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No active subscription</p>
                        </div>
                    )}

                    {qrData && (
                        <p className="text-xs text-neutral-400 text-center">
                            Valid until: {new Date(qrData.expiresAt).toLocaleTimeString("en-LK")}
                            <br />Show this to counter staff
                        </p>
                    )}
                </div>

                {/* Meal History Table */}
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-base font-semibold text-neutral-800">Recent Meal History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-6 space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="skeleton h-4 w-24 rounded" />
                                        <div className="skeleton h-4 w-16 rounded" />
                                        <div className="skeleton h-4 w-20 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400">
                                <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No meals recorded yet</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Method</th>
                                        <th>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="font-medium">{formatDate(log.mealDate)}</td>
                                            <td className="capitalize">{log.type}</td>
                                            <td>
                                                <span className="badge badge-active text-xs">
                                                    {methodLabel[log.method] ?? log.method}
                                                </span>
                                            </td>
                                            <td className="text-neutral-500 text-xs">{log.locationId ?? "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
