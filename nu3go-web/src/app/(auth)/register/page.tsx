"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const schema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^(\+94|0)?7\d{8}$/, "Enter a valid Sri Lankan mobile number").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords do not match", path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await api.post("/auth/register", {
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                phone: data.phone || undefined,
            });
            toast.success("Account created! Please verify your email.");
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Create account</h2>
                <p className="text-neutral-500 text-sm mt-1">Start your healthy breakfast journey</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input id="fullName" className={`form-input ${errors.fullName ? "error" : ""}`} placeholder="Your full name" {...register("fullName")} />
                    {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input id="email" type="email" autoComplete="email" className={`form-input ${errors.email ? "error" : ""}`} placeholder="you@example.com" {...register("email")} />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="form-label">Mobile <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <input id="phone" type="tel" className="form-input" placeholder="07X XXXXXXX" {...register("phone")} />
                </div>

                <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                        <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password" className={`form-input pr-10 ${errors.password ? "error" : ""}`} placeholder="At least 8 characters" {...register("password")} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input id="confirmPassword" type="password" autoComplete="new-password" className={`form-input ${errors.confirmPassword ? "error" : ""}`} placeholder="Re-enter password" {...register("confirmPassword")} />
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary btn-md w-full justify-center mt-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>

                <p className="text-center text-xs text-neutral-400">
                    By registering, you agree to our{" "}
                    <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                </p>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
            </p>
        </div>
    );
}
