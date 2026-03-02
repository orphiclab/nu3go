"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { MapPin, Plus, Edit, Loader2, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
    area: string;
    isActive: boolean;
    openTime: string;
    closeTime: string;
    lat?: number;
    lng?: number;
}

function LocationModal({ loc, onClose, onSave }: { loc: Location | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState<Partial<Location>>(
        loc ?? { isActive: true, city: "Colombo", openTime: "07:30", closeTime: "09:30" }
    );
    const [saving, setSaving] = useState(false);
    const s = (k: keyof Location, v: any) => setForm(f => ({ ...f, [k]: v }));

    async function save() {
        setSaving(true);
        try {
            if (loc?.id) {
                await api.patch(`/locations/${loc.id}`, form);
            } else {
                await api.post("/locations", form);
            }
            toast.success("Location saved");
            onSave();
            onClose();
        } catch { toast.error("Failed to save location"); }
        finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-neutral-900">{loc?.id ? "Edit" : "New"} Location</h3>
                    <button onClick={onClose}><X className="w-4 h-4 text-neutral-400" /></button>
                </div>

                <div>
                    <label className="form-label">Location Name *</label>
                    <input className="form-input" value={form.name ?? ""} onChange={e => s("name", e.target.value)} placeholder="e.g. Colombo 07" />
                </div>
                <div>
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address ?? ""} onChange={e => s("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">City</label>
                        <input className="form-input" value={form.city ?? ""} onChange={e => s("city", e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Area</label>
                        <input className="form-input" value={form.area ?? ""} onChange={e => s("area", e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Opens At</label>
                        <input type="time" className="form-input" value={form.openTime ?? "07:30"} onChange={e => s("openTime", e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Closes At</label>
                        <input type="time" className="form-input" value={form.closeTime ?? "09:30"} onChange={e => s("closeTime", e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Latitude</label>
                        <input type="number" step="0.000001" className="form-input" value={form.lat ?? ""} onChange={e => s("lat", parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <label className="form-label">Longitude</label>
                        <input type="number" step="0.000001" className="form-input" value={form.lng ?? ""} onChange={e => s("lng", parseFloat(e.target.value))} />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!form.isActive} onChange={e => s("isActive", e.target.checked)} className="accent-primary-500 w-4 h-4" />
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

export default function AdminLocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Location | null | false>(false);

    async function load() {
        setLoading(true);
        api.get("/locations").then((res: any) => setLocations(res.data ?? res ?? [])).finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    return (
        <div className="page-enter space-y-5">
            {editing !== false && <LocationModal loc={editing} onClose={() => setEditing(false)} onSave={load} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Pickup Locations</h1>
                    <p className="text-neutral-500 text-sm mt-1">{locations.length} locations configured</p>
                </div>
                <button onClick={() => setEditing(null)} className="btn-primary btn-md inline-flex">
                    <Plus className="w-4 h-4" /> Add Location
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => <div key={i} className="card"><div className="skeleton h-5 w-48 rounded mb-2" /><div className="skeleton h-4 w-64 rounded" /></div>)}
                </div>
            ) : locations.length === 0 ? (
                <div className="card text-center py-12">
                    <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm">No pickup locations yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {locations.map(loc => (
                        <div key={loc.id} className={`card ${!loc.isActive ? "opacity-50" : ""}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-500" />
                                    <h3 className="font-bold text-neutral-900">{loc.name}</h3>
                                    {!loc.isActive && <span className="badge badge-expired text-xs">Inactive</span>}
                                </div>
                                <button onClick={() => setEditing(loc)} className="text-neutral-400 hover:text-primary-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-neutral-500 mb-1">{loc.address}</p>
                            <p className="text-xs text-neutral-400">{loc.area}, {loc.city}</p>
                            {(loc.openTime || loc.closeTime) && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500">
                                    <Clock className="w-3 h-3" />
                                    {loc.openTime} – {loc.closeTime}
                                </div>
                            )}
                            {loc.lat && loc.lng && (
                                <a
                                    href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-600 mt-1 inline-flex items-center gap-1"
                                >
                                    <MapPin className="w-3 h-3" /> View on Maps
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
