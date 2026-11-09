"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please check credentials.");
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@aroha.com");
    setPassword("ArohaAdmin2026!");
    setError(null);
  };

  return (
    <div className="bg-white border border-[#E9E1D5] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#173D32] text-[#FAF9F6] flex items-center justify-center mx-auto mb-3 shadow">
          <Compass className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#173D32]">
          Staff Operations Portal
        </h1>
        <p className="text-xs text-[#252925]/70">
          Aroha Travels • Content & Reservations Management System
        </p>
      </div>

      {/* Quick Demo Pill */}
      <div className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-3.5 text-xs text-[#252925]/85">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-[#173D32] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
            Demo Staff Account
          </span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-[11px] font-bold text-[#173D32] hover:underline"
          >
            Auto-fill
          </button>
        </div>
        <p className="font-mono text-[11px] text-[#6a7d61]">admin@aroha.com / ArohaAdmin2026!</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#252925] mb-1.5">
            Staff Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6a7d61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="admin@aroha.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30 focus:border-[#173D32]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#252925] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6a7d61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30 focus:border-[#173D32]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating Staff...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Admin Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#E9E1D5]/60 text-center">
        <span className="text-[11px] text-[#6a7d61]">
          Secure session • Role-based access control enabled
        </span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6a7d61] hover:text-[#173D32] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Aroha Travels Public Website</span>
        </Link>

        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-3xl border border-[#E9E1D5] text-center text-xs text-[#6a7d61]">
              Loading login portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
