"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Loader2, Save, User, MapPin, Lock } from "lucide-react";

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^(\+94|0)?7\d{8}$/, "Enter a valid Sri Lankan mobile number").optional().or(z.literal("")),
    deliveryAddress: z.string().optional(),
    deliveryArea: z.string().optional(),
    deliveryNotes: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match", path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const { register: rp, handleSubmit: hp, formState: { errors: ep } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName ?? "",
            phone: user?.phone ?? "",
            deliveryAddress: user?.deliveryAddress ?? "",
            deliveryArea: user?.deliveryArea ?? "",
        },
    });

    const { register: rw, handleSubmit: hw, formState: { errors: ew }, reset: resetPw } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const onSaveProfile = async (data: ProfileForm) => {
        setSavingProfile(true);
        try {
            const res = await api.patch("/users/me", data);
            setUser((res as any).data);
            toast.success("Profile updated!");
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const onChangePassword = async (data: PasswordForm) => {
        setSavingPassword(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success("Password changed successfully");
            resetPw();
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="page-enter space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
                <p className="text-neutral-500 text-sm mt-1">Manage your profile and account preferences.</p>
            </div>

            {/* Profile Info */}
            <div className="card space-y-5">
                <div className="flex items-center gap-4">
                    <Avatar name={user?.fullName ?? "User"} size="lg" />
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-500" /> Profile Information
                        </h2>
                        <p className="text-xs text-neutral-500">Account: {user?.email}</p>
                    </div>
                </div>

                <form onSubmit={hp(onSaveProfile)} className="space-y-4">
                    <div>
                        <label className="form-label">Full Name</label>
                        <input className={`form-input ${ep.fullName ? "error" : ""}`} {...rp("fullName")} />
                        {ep.fullName && <p className="form-error">{ep.fullName.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Mobile Number</label>
                        <input className={`form-input ${ep.phone ? "error" : ""}`} placeholder="07X XXXXXXX" {...rp("phone")} />
                        {ep.phone && <p className="form-error">{ep.phone.message}</p>}
                    </div>

                    <div className="pt-2 border-t border-border">
                        <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-500" /> Delivery Address
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="form-label">Street Address</label>
                                <textarea className="form-input" rows={2} {...rp("deliveryAddress")} />
                            </div>
                            <div>
                                <label className="form-label">Area / City</label>
                                <input className="form-input" placeholder="e.g. Colombo 07" {...rp("deliveryArea")} />
                            </div>
                            <div>
                                <label className="form-label">Delivery Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
                                <textarea className="form-input" rows={2} placeholder="e.g. Ring bell, leave at gate..." {...rp("deliveryNotes")} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={savingProfile} className="btn-primary btn-md inline-flex">
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="card space-y-4">
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary-500" /> Change Password
                </h2>
                <form onSubmit={hw(onChangePassword)} className="space-y-4">
                    <div>
                        <label className="form-label">Current Password</label>
                        <input type="password" className={`form-input ${ew.currentPassword ? "error" : ""}`} {...rw("currentPassword")} />
                        {ew.currentPassword && <p className="form-error">{ew.currentPassword.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">New Password</label>
                        <input type="password" className={`form-input ${ew.newPassword ? "error" : ""}`} {...rw("newPassword")} />
                        {ew.newPassword && <p className="form-error">{ew.newPassword.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Confirm New Password</label>
                        <input type="password" className={`form-input ${ew.confirmPassword ? "error" : ""}`} {...rw("confirmPassword")} />
                        {ew.confirmPassword && <p className="form-error">{ew.confirmPassword.message}</p>}
                    </div>
                    <button type="submit" disabled={savingPassword} className="btn-secondary btn-md inline-flex">
                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
