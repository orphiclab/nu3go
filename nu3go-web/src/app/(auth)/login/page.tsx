"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, ArrowRight, Loader2, Zap, ShieldCheck } from "lucide-react";
import { demoLogin } from "@/lib/api";
import { mockUser, mockCustomerUser } from "@/lib/mock-data";

const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login, setUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState<"admin" | "customer" | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMsg =
                (err as { error?: { message?: string }; message?: string })?.error?.message ??
                (err as { message?: string })?.message ??
                "Login failed. Please check your credentials.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (role: "admin" | "customer") => {
        setDemoLoading(role);
        try {
            demoLogin(role);
            const user = role === "admin"
                ? { ...mockUser, fullName: "nu3go Admin" }
                : { ...mockCustomerUser, fullName: "Kasun Perera" };
            setUser(user as any);
            toast.success(`Logged in as Demo ${role === "admin" ? "Admin" : "Customer"} 🎉`);
            router.push(role === "admin" ? "/admin" : "/dashboard");
        } catch {
            toast.error("Demo login failed");
        } finally {
            setDemoLoading(null);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Welcome back</h2>
                <p className="text-neutral-500 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Demo access banner */}
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Demo Mode — no backend needed
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleDemoLogin("admin")}
                        disabled={!!demoLoading}
                        className="flex-1 px-3 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                        {demoLoading === "admin"
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <ShieldCheck className="w-3 h-3" />}
                        Admin Demo
                    </button>
                    <button
                        onClick={() => handleDemoLogin("customer")}
                        disabled={!!demoLoading}
                        className="flex-1 px-3 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                        {demoLoading === "customer"
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Zap className="w-3 h-3" />}
                        Customer Demo
                    </button>
                </div>
            </div>

            <div className="relative flex items-center my-4">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-neutral-400">or sign in with email</span>
                <div className="flex-1 border-t border-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="you@example.com"
                        {...register("email")}
                    />
                    {errors.email && <p className="form-error" role="alert">{errors.email.message}</p>}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="form-label mb-0">Password</label>
                        <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className={`form-input pr-10 ${errors.password ? "error" : ""}`}
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error" role="alert">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary btn-md w-full justify-center mt-2"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create account
                </Link>
            </p>
        </div>
    );
}
