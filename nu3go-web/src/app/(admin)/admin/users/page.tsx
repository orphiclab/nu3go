"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import { Search, Plus, Loader2, Edit, Ban } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchUsers = useCallback(
        debounce(async (q: string, p: number) => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/users?search=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
                setUsers((res as any).data?.items ?? []);
                setTotal((res as any).meta?.total ?? 0);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => { fetchUsers(search, page); }, [search, page]);

    async function toggleActive(id: string, isActive: boolean) {
        try {
            await api.patch(`/admin/users/${id}`, { isActive: !isActive });
            setUsers(u => u.map(usr => usr.id === id ? { ...usr, isActive: !isActive } : usr));
            toast.success(`User ${isActive ? "deactivated" : "activated"}`);
        } catch {
            toast.error("Failed to update user");
        }
    }

    const roleColors: Record<string, string> = {
        super_admin: "badge-expired",
        admin: "badge-active",
        kitchen_staff: "badge-paused",
        delivery_manager: "badge-pending",
        customer: "text-neutral-500 bg-neutral-100",
        corporate_admin: "badge-active",
    };

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
                    <p className="text-neutral-500 text-sm mt-1">{total.toLocaleString()} total users</p>
                </div>
                <button className="btn-primary btn-md inline-flex">
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    className="form-input pl-9"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-8 w-8 rounded-full" /><div className="skeleton h-4 w-48 rounded" /><div className="skeleton h-4 w-32 rounded" /></div>)}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Verified</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.fullName} size="sm" />
                                                <div>
                                                    <p className="font-medium text-neutral-900 text-sm">{u.fullName}</p>
                                                    <p className="text-xs text-neutral-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge text-xs capitalize ${roleColors[u.role] ?? "badge-pending"}`}>
                                                {u.role.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="text-sm text-neutral-600">{formatDate(u.createdAt)}</td>
                                        <td>
                                            {u.isVerified
                                                ? <span className="text-green-600 text-xs font-medium">✓ Yes</span>
                                                : <span className="text-amber-500 text-xs font-medium">Pending</span>}
                                        </td>
                                        <td>
                                            <span className={`badge text-xs ${u.isActive ? "badge-active" : "badge-expired"}`}>
                                                {u.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button className="text-neutral-400 hover:text-primary-600 transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(u.id, u.isActive)}
                                                    className={`transition-colors ${u.isActive ? "text-neutral-400 hover:text-red-500" : "text-neutral-400 hover:text-green-500"}`}
                                                    title={u.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {total > limit && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                        </p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost btn-sm disabled:opacity-40">Previous</button>
                            <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="btn-ghost btn-sm disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
