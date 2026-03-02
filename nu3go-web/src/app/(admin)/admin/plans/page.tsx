"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Plan {
    id: string;
    name: string;
    slug: string;
    type: "pickup" | "delivery" | "hybrid";
    priceLkr: number;
    mealCount?: number;
    billingDays: number;
    description?: string;
    features: string[];
    isActive: boolean;
    isCorporate: boolean;
}

function PlanModal({ plan, onClose, onSave }: { plan: Plan | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState<Partial<Plan>>(
        plan ?? { type: "pickup", priceLkr: 0, billingDays: 30, features: [], isActive: true, isCorporate: false }
    );
    const [featuresText, setFeaturesText] = useState((plan?.features ?? []).join("\n"));
    const [saving, setSaving] = useState(false);

    const s = (k: keyof Plan, v: any) => setForm(f => ({ ...f, [k]: v }));

    async function save() {
        setSaving(true);
        const payload = {
            ...form,
            features: featuresText.split("\n").map(f => f.trim()).filter(Boolean),
            slug: form.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "",
        };
        try {
            if (plan?.id) {
                await api.patch(`/plans/${plan.id}`, payload);
            } else {
                await api.post("/plans", payload);
            }
            toast.success("Plan saved");
            onSave();
            onClose();
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to save plan");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-neutral-900">{plan?.id ? "Edit" : "New"} Plan</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="form-label">Plan Name *</label>
                        <input className="form-input" value={form.name ?? ""} onChange={e => s("name", e.target.value)} placeholder="e.g. Daily Pickup" />
                    </div>
                    <div>
                        <label className="form-label">Type</label>
                        <select className="form-input" value={form.type} onChange={e => s("type", e.target.value)}>
                            <option value="pickup">Pickup</option>
                            <option value="delivery">Delivery</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Price (LKR)</label>
                        <input type="number" className="form-input" value={form.priceLkr ?? ""} onChange={e => s("priceLkr", parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <label className="form-label">Meal Count (leave blank = unlimited)</label>
                        <input type="number" className="form-input" value={form.mealCount ?? ""} onChange={e => s("mealCount", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Unlimited" />
                    </div>
                    <div>
                        <label className="form-label">Billing Days</label>
                        <input type="number" className="form-input" value={form.billingDays ?? 30} onChange={e => s("billingDays", parseInt(e.target.value))} />
                    </div>
                    <div className="col-span-2">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={2} value={form.description ?? ""} onChange={e => s("description", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <label className="form-label">Features (one per line)</label>
                        <textarea className="form-input" rows={4} value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder={"QR + NFC access\nUnlimited pickups\nCredits for unused meals"} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!form.isActive} onChange={e => s("isActive", e.target.checked)} className="accent-primary-500 w-4 h-4" />
                        Active
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!form.isCorporate} onChange={e => s("isCorporate", e.target.checked)} className="accent-primary-500 w-4 h-4" />
                        Corporate Plan
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={save} disabled={saving} className="btn-primary btn-md flex-1 justify-center">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Plan"}
                    </button>
                    <button onClick={onClose} className="btn-ghost btn-md flex-1 justify-center">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Plan | null | false>(false);

    async function load() {
        setLoading(true);
        api.get("/plans?corporate=false").then((res: any) => setPlans(res.data ?? res ?? [])).finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function deletePlan(id: string) {
        if (!confirm("Deactivate this plan?")) return;
        try {
            await api.delete(`/plans/${id}`);
            toast.success("Plan deactivated");
            load();
        } catch { toast.error("Failed"); }
    }

    const typeColors: Record<string, string> = {
        pickup: "badge-active",
        delivery: "badge-pending",
        hybrid: "badge-paused",
    };

    return (
        <div className="page-enter space-y-5">
            {editing !== false && <PlanModal plan={editing} onClose={() => setEditing(false)} onSave={load} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Subscription Plans</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage and configure subscription plans</p>
                </div>
                <button onClick={() => setEditing(null)} className="btn-primary btn-md inline-flex">
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="card"><div className="skeleton h-6 w-32 rounded mb-3" /><div className="skeleton h-10 w-20 rounded mb-2" /><div className="skeleton h-4 w-48 rounded" /></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {plans.map(plan => (
                        <div key={plan.id} className={`card ${!plan.isActive ? "opacity-50" : ""}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-neutral-900">{plan.name}</h3>
                                    <div className="flex gap-1 mt-1">
                                        <span className={`badge text-xs ${typeColors[plan.type]}`}>{plan.type}</span>
                                        {plan.isCorporate && <span className="badge badge-pending text-xs">Corporate</span>}
                                        {!plan.isActive && <span className="badge badge-expired text-xs">Inactive</span>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditing(plan)} className="text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deletePlan(plan.id)} className="text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <p className="text-3xl font-extrabold text-primary-600 mb-1">{formatCurrency(plan.priceLkr)}</p>
                            <p className="text-xs text-neutral-400 mb-3">per {plan.billingDays} days · {plan.mealCount ? `${plan.mealCount} meals` : "Unlimited meals"}</p>

                            {plan.description && <p className="text-xs text-neutral-500 mb-3">{plan.description}</p>}

                            <ul className="space-y-1.5">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
