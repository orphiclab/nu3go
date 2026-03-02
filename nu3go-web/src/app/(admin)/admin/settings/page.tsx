"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CreditCard, Search, Plus, Loader2, Link2, Link2Off, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface NfcCard {
    id: string;
    cardUid: string;
    label?: string;
    userId?: string;
    userName?: string;
    isActive: boolean;
    createdAt: string;
}

interface UserMatch {
    id: string;
    fullName: string;
    email: string;
}

export default function AdminSettingsPage() {
    const [cards, setCards] = useState<NfcCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCardUid, setNewCardUid] = useState("");
    const [newCardLabel, setNewCardLabel] = useState("");
    const [adding, setAdding] = useState(false);
    const [assignModal, setAssignModal] = useState<NfcCard | null>(null);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<UserMatch[]>([]);

    async function load() {
        setLoading(true);
        api.get("/nfc/cards").then((res: any) => setCards(res.data ?? res ?? [])).finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function addCard() {
        if (!newCardUid.trim()) return;
        setAdding(true);
        try {
            await api.post("/nfc/cards", { cardUid: newCardUid.trim(), label: newCardLabel.trim() || undefined });
            toast.success("NFC card added");
            setNewCardUid("");
            setNewCardLabel("");
            load();
        } catch (e: any) { toast.error(e?.error?.message ?? "Failed to add card"); }
        finally { setAdding(false); }
    }

    async function searchUsers(q: string) {
        setUserSearch(q);
        if (q.length < 2) { setUserResults([]); return; }
        const res: any = await api.get(`/admin/users?search=${encodeURIComponent(q)}&limit=5`);
        setUserResults(res.data?.items ?? []);
    }

    async function assignCard(cardId: string, userId: string) {
        try {
            await api.post(`/nfc/cards/${cardId}/assign`, { userId });
            toast.success("Card assigned");
            setAssignModal(null);
            setUserSearch("");
            setUserResults([]);
            load();
        } catch (e: any) { toast.error(e?.error?.message ?? "Failed"); }
    }

    async function unassignCard(cardId: string) {
        try {
            await api.post(`/nfc/cards/${cardId}/unassign`);
            toast.success("Card unassigned");
            load();
        } catch { toast.error("Failed"); }
    }

    async function deactivateCard(cardId: string) {
        if (!confirm("Deactivate this NFC card?")) return;
        try {
            await api.delete(`/nfc/cards/${cardId}`);
            toast.success("Card deactivated");
            load();
        } catch { toast.error("Failed"); }
    }

    return (
        <div className="page-enter space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Admin Settings</h1>
                <p className="text-neutral-500 text-sm mt-1">NFC card management and system configuration</p>
            </div>

            {/* NFC Card Assignment Modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="font-semibold text-neutral-900">Assign Card: <span className="font-mono text-xs">{assignModal.cardUid}</span></h3>
                        <div>
                            <label className="form-label">Search user</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input className="form-input pl-9" value={userSearch} onChange={e => searchUsers(e.target.value)} placeholder="Name or email…" />
                            </div>
                        </div>
                        {userResults.length > 0 && (
                            <div className="border border-border rounded-lg overflow-hidden">
                                {userResults.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => assignCard(assignModal.id, u.id)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 border-b border-border last:border-0"
                                    >
                                        <p className="text-sm font-medium text-neutral-800">{u.fullName}</p>
                                        <p className="text-xs text-neutral-500">{u.email}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => { setAssignModal(null); setUserSearch(""); setUserResults([]); }} className="btn-ghost btn-md w-full justify-center">Cancel</button>
                    </div>
                </div>
            )}

            {/* Add New Card */}
            <div className="card">
                <h2 className="text-base font-semibold text-neutral-800 mb-4">Register NFC Card</h2>
                <div className="flex gap-3 flex-wrap">
                    <input className="form-input flex-1 min-w-48" placeholder="Card UID (from NFC reader)" value={newCardUid} onChange={e => setNewCardUid(e.target.value)} />
                    <input className="form-input w-40" placeholder="Label (optional)" value={newCardLabel} onChange={e => setNewCardLabel(e.target.value)} />
                    <button onClick={addCard} disabled={adding || !newCardUid.trim()} className="btn-primary btn-md inline-flex">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Card</>}
                    </button>
                </div>
            </div>

            {/* Cards List */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-neutral-800">NFC Cards ({cards.length})</h2>
                </div>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded" />)}
                    </div>
                ) : cards.length === 0 ? (
                    <div className="text-center py-10">
                        <CreditCard className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-neutral-400 text-sm">No NFC cards registered</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr><th>Card UID</th><th>Label</th><th>Assigned User</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {cards.map(card => (
                                    <tr key={card.id} className={!card.isActive ? "opacity-50" : ""}>
                                        <td className="font-mono text-xs text-neutral-700">{card.cardUid}</td>
                                        <td className="text-sm text-neutral-600">{card.label ?? "—"}</td>
                                        <td className="text-sm">
                                            {card.userId
                                                ? <span className="text-green-600 font-medium">{card.userId.slice(0, 8)}…</span>
                                                : <span className="text-neutral-400">Unassigned</span>}
                                        </td>
                                        <td>
                                            <span className={`badge text-xs ${card.isActive ? "badge-active" : "badge-expired"}`}>
                                                {card.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {card.isActive && (
                                                    <>
                                                        <button onClick={() => setAssignModal(card)} title="Assign to user" className="text-neutral-400 hover:text-primary-600">
                                                            <Link2 className="w-4 h-4" />
                                                        </button>
                                                        {card.userId && (
                                                            <button onClick={() => unassignCard(card.id)} title="Unassign" className="text-neutral-400 hover:text-amber-500">
                                                                <Link2Off className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => deactivateCard(card.id)} title="Deactivate" className="text-neutral-400 hover:text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
