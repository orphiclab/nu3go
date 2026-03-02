"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";

function OtpForm() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email") ?? "";
    const { setUser } = useAuthStore();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        refs.current[0]?.focus();
        const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (i: number, val: string) => {
        const v = val.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[i] = v;
        setOtp(next);
        if (v && i < 5) refs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (text.length === 6) {
            setOtp(text.split(""));
            refs.current[5]?.focus();
        }
    };

    const verify = async () => {
        const code = otp.join("");
        if (code.length !== 6) { toast.error("Enter the 6-digit code"); return; }
        setLoading(true);
        try {
            const res = await api.post("/auth/verify-otp", { email, otp: code });
            const { accessToken, refreshToken } = (res as any).data;
            localStorage.setItem("nu3go_access_token", accessToken);
            localStorage.setItem("nu3go_refresh_token", refreshToken);
            const meRes = await api.get("/auth/me");
            setUser((meRes as any).data);
            toast.success("Email verified! Welcome to nu3go 🎉");
            router.push("/dashboard");
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Invalid or expired code");
            setOtp(["", "", "", "", "", ""]);
            refs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        if (countdown > 0) return;
        setResending(true);
        try {
            await api.post("/auth/resend-otp", { email });
            toast.success("New code sent to your email");
            setCountdown(60);
        } catch (e: any) {
            toast.error("Could not resend. Try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-neutral-900">Verify your email</h2>
                <p className="text-neutral-500 text-sm mt-2">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-neutral-700">{email}</span>
                </p>
            </div>

            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={el => { refs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold border-2 border-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                        aria-label={`OTP digit ${i + 1}`}
                    />
                ))}
            </div>

            <button
                onClick={verify}
                disabled={loading || otp.join("").length !== 6}
                className="btn-primary btn-md w-full justify-center"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="text-center mt-4">
                <button
                    onClick={resend}
                    disabled={countdown > 0 || resending}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:text-neutral-400 inline-flex items-center gap-1"
                >
                    {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading...</div>}>
            <OtpForm />
        </Suspense>
    );
}
