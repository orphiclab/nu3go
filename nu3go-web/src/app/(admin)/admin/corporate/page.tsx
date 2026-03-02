"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Plus, Users, Edit } from "lucide-react";

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

export default function AdminCorporatePage() {
    const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/corporate/accounts?limit=50").then((res: any) => {
            setAccounts(res.data?.items ?? []);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Corporate Accounts</h1>
                    <p className="text-neutral-500 text-sm mt-1">{accounts.length} companies</p>
                </div>
                <button className="btn-primary btn-md inline-flex"><Plus className="w-4 h-4" /> Add Company</button>
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
                                <button className="text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
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
