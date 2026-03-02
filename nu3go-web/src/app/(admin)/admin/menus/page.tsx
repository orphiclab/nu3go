"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    calories?: number;
    tags?: string[];
    isActive: boolean;
    validFrom?: string;
    validTo?: string;
}

function MenuModal({ item, onClose, onSave }: { item: MenuItem | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState<Partial<MenuItem>>(item ?? { name: "", isActive: true });
    const [saving, setSaving] = useState(false);

    const s = (k: keyof MenuItem, v: any) => setForm(f => ({ ...f, [k]: v }));

    async function save() {
        setSaving(true);
        try {
            if (item?.id) {
                await api.patch(`/menus/${item.id}`, form);
            } else {
                await api.post("/menus", form);
            }
            onSave();
            onClose();
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-base font-semibold text-neutral-900">{item?.id ? "Edit" : "New"} Menu Item</h3>
                <div>
                    <label className="form-label">Item Name *</label>
                    <input className="form-input" value={form.name ?? ""} onChange={e => s("name", e.target.value)} />
                </div>
                <div>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={2} value={form.description ?? ""} onChange={e => s("description", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">Calories</label>
                        <input type="number" className="form-input" value={form.calories ?? ""} onChange={e => s("calories", parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="form-label">Tags (comma separated)</label>
                        <input className="form-input" placeholder="vegan, gluten-free" value={(form.tags ?? []).join(", ")} onChange={e => s("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">Valid From</label>
                        <input type="date" className="form-input" value={form.validFrom?.slice(0, 10) ?? ""} onChange={e => s("validFrom", e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Valid To</label>
                        <input type="date" className="form-input" value={form.validTo?.slice(0, 10) ?? ""} onChange={e => s("validTo", e.target.value)} />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!form.isActive} onChange={e => s("isActive", e.target.checked)} className="w-4 h-4 accent-primary-500" />
                    Active
                </label>
                <div className="flex gap-3 pt-2">
                    <button onClick={save} disabled={saving} className="btn-primary btn-md flex-1 justify-center">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </button>
                    <button onClick={onClose} className="btn-ghost btn-md flex-1 justify-center">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminMenusPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<MenuItem | null | false>(false);

    async function load() {
        setLoading(true);
        api.get("/menus?limit=50").then((res: any) => setItems(res.data?.items ?? [])).finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function deleteItem(id: string) {
        if (!confirm("Delete this menu item?")) return;
        try {
            await api.delete(`/menus/${id}`);
            setItems(m => m.filter(x => x.id !== id));
            toast.success("Deleted");
        } catch { toast.error("Failed to delete"); }
    }

    return (
        <div className="page-enter space-y-5">
            {editing !== false && <MenuModal item={editing} onClose={() => setEditing(false)} onSave={load} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Menu CMS</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage breakfast menu items</p>
                </div>
                <button onClick={() => setEditing(null)} className="btn-primary btn-md inline-flex">
                    <Plus className="w-4 h-4" /> New Item
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="card"><div className="skeleton h-5 w-32 rounded mb-2" /><div className="skeleton h-4 w-48 rounded" /></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className={`card ${!item.isActive ? "opacity-50" : ""}`}>
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-semibold text-neutral-900">{item.name}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditing(item)} className="text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteItem(item.id)} className="text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {item.description && <p className="text-xs text-neutral-500 mb-2">{item.description}</p>}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {item.calories && <span className="badge badge-pending text-xs">{item.calories} kcal</span>}
                                {item.tags?.map(t => <span key={t} className="badge badge-active text-xs">{t}</span>)}
                                {!item.isActive && <span className="badge badge-expired text-xs">Inactive</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
