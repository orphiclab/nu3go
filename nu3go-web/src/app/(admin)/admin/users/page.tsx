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
    const [showAddModal, setShowAddModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const limit = 20;

    async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsAdding(true);
        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd.entries());
        try {
            const res = await api.post('/admin/users', data);
            toast.success("User created successfully");
            if ((res as any).tempPassword) {
                toast.info(`Temporary Password: ${(res as any).tempPassword}`, { duration: 10000 });
            }
            setShowAddModal(false);
            setPage(1);
            fetchUsers("", 1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create user");
        } finally {
            setIsAdding(false);
        }
    }

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
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary btn-md inline-flex"
                >
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

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <h2 className="text-lg font-bold text-neutral-900">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700">×</button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                                    <input required name="fullName" className="form-input w-full" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                                    <input required type="email" name="email" className="form-input w-full" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                                    <select name="role" className="form-input w-full bg-white">
                                        <option value="customer">Customer</option>
                                        <option value="corporate_admin">Corporate Admin</option>
                                        <option value="kitchen_staff">Kitchen Staff</option>
                                        <option value="delivery_manager">Delivery Manager</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost flex-1">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isAdding} className="btn-primary flex-1">
                                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
