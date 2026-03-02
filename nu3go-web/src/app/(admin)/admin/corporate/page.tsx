"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Plus, Users, Edit, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CorporateAccount {
    id: string;
    companyName: string;
    contactEmail: string;
    contactPerson: string;
    city?: string;
    memberCount?: number;
    totalPaidLkr?: number;
    isActive: boolean;
}

function CorporateModal({ account, onClose, onSave }: { account: CorporateAccount | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState<Partial<CorporateAccount>>(
        account ?? { isActive: true, city: "Colombo" }
    );
    const [saving, setSaving] = useState(false);
    const s = (k: keyof CorporateAccount, v: any) => setForm(f => ({ ...f, [k]: v }));

    async function save() {
        if (!form.companyName || !form.contactEmail || !form.contactPerson) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSaving(true);
        try {
            if (account?.id) {
                await api.patch(`/corporate/accounts/${account.id}`, form);
            } else {
                await api.post("/corporate/accounts", form);
            }
            toast.success("Corporate account saved");
            onSave();
            onClose();
        } catch { toast.error("Failed to save account"); }
        finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-neutral-900">{account?.id ? "Edit" : "New"} Corporate Account</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="form-label">Company Name *</label>
                        <input className="form-input" value={form.companyName ?? ""} onChange={e => s("companyName", e.target.value)} placeholder="Acme Corp" />
                    </div>
                    <div>
                        <label className="form-label">Contact Person *</label>
                        <input className="form-input" value={form.contactPerson ?? ""} onChange={e => s("contactPerson", e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label className="form-label">Contact Email *</label>
                        <input type="email" className="form-input" value={form.contactEmail ?? ""} onChange={e => s("contactEmail", e.target.value)} placeholder="jane@acme.com" />
                    </div>
                    <div>
                        <label className="form-label">City</label>
                        <input className="form-input" value={form.city ?? ""} onChange={e => s("city", e.target.value)} placeholder="Colombo" />
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
                    <input type="checkbox" checked={!!form.isActive} onChange={e => s("isActive", e.target.checked)} className="accent-primary-500 w-4 h-4" />
                    Active Account
                </label>

                <div className="flex gap-3 pt-4 border-t border-border">
                    <button onClick={save} disabled={saving} className="btn-primary btn-md flex-1 justify-center">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </button>
                    <button onClick={onClose} className="btn-ghost btn-md flex-1 justify-center">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminCorporatePage() {
    const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<CorporateAccount | null | false>(false);

    async function load() {
        setLoading(true);
        api.get("/corporate/accounts?limit=50").then((res: any) => {
            setAccounts(res.data?.items ?? []);
        }).finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    return (
        <div className="page-enter space-y-5">
            {editing !== false && <CorporateModal account={editing} onClose={() => setEditing(false)} onSave={load} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Corporate Accounts</h1>
                    <p className="text-neutral-500 text-sm mt-1">{accounts.length} companies</p>
                </div>
                <button onClick={() => setEditing(null)} className="btn-primary btn-md inline-flex"><Plus className="w-4 h-4" /> Add Company</button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton h-5 w-48 rounded mb-2" /><div className="skeleton h-4 w-32 rounded" /></div>)}
                </div>
            ) : accounts.length === 0 ? (
                <div className="card text-center py-12">
                    <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm">No corporate accounts yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {accounts.map(acc => (
                        <div key={acc.id} className={`card ${!acc.isActive ? "opacity-50" : ""}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="w-4 h-4 text-primary-500" />
                                        <h3 className="text-sm font-bold text-neutral-900">{acc.companyName}</h3>
                                        {!acc.isActive && <span className="badge badge-expired text-xs">Inactive</span>}
                                    </div>
                                    <p className="text-xs text-neutral-500">{acc.contactPerson} · {acc.contactEmail}</p>
                                    {acc.city && <p className="text-xs text-neutral-400 mt-0.5">{acc.city}</p>}
                                </div>
                                <button onClick={() => setEditing(acc)} className="text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-neutral-400" />
                                    <span className="text-neutral-600">{acc.memberCount ?? 0} members</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="text-neutral-500 text-xs">Total paid</span>
                                    <p className="font-semibold text-neutral-900">LKR {((acc.totalPaidLkr ?? 0) / 1000).toFixed(0)}k</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
