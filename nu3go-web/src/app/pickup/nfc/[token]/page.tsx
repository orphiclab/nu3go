"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Leaf } from "lucide-react";
import api from "@/lib/api";

type ValidationState = "loading" | "success" | "error";

interface ValidationResult {
    userName: string;
    planName: string;
    mealsRemaining?: number;
    location: string;
    message: string;
}

export default function NfcValidationPage() {
    const params = useParams();
    const token = params?.token as string;

    const [state, setState] = useState<ValidationState>("loading");
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setState("error");
            setErrorMsg("Invalid NFC token.");
            return;
        }

        api
            .get(`/pickup/nfc/validate?token=${token}`)
            .then((res) => {
                setResult((res as unknown as { data: ValidationResult }).data);
                setState("success");
            })
            .catch((err) => {
                setErrorMsg(
                    err?.error?.message ?? "Validation failed. Please try again."
                );
                setState("error");
            });
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
                    {/* Logo */}
                    <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>

                    {/* Loading */}
                    {state === "loading" && (
                        <div className="space-y-3">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
                            <p className="text-neutral-500 text-sm">Validating NFC card…</p>
                        </div>
                    )}

                    {/* Success */}
                    {state === "success" && result && (
                        <div className="space-y-4 animate-fade-up">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-9 h-9 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    Meal Confirmed!
                                </h2>
                                <p className="text-neutral-500 text-sm mt-1">
                                    {result.message}
                                </p>
                            </div>
                            <div className="bg-neutral-50 rounded-xl p-4 text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Customer</span>
                                    <span className="font-semibold text-neutral-900">
                                        {result.userName}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Plan</span>
                                    <span className="font-semibold text-neutral-900">
                                        {result.planName}
                                    </span>
                                </div>
                                {result.mealsRemaining != null && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Meals Left</span>
                                        <span className="font-semibold text-neutral-900">
                                            {result.mealsRemaining}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Location</span>
                                    <span className="font-semibold text-neutral-900">
                                        {result.location}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-400">
                                {new Date().toLocaleString("en-LK")}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {state === "error" && (
                        <div className="space-y-4 animate-fade-up">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-9 h-9 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    Validation Failed
                                </h2>
                                <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
                            </div>
                            <p className="text-xs text-neutral-400">
                                Please contact the counter staff.
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-neutral-400 mt-4">
                    nu3go Secure Pickup System
                </p>
            </div>
        </div>
    );
}
