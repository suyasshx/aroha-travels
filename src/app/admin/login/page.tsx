"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft, KeyRound, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [from, setFrom] = useState("/admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe client-side reading of query parameters without Next.js Suspense deopts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      if (fromParam) {
        setFrom(fromParam);
      }
    }
  }, []);

  const executeLogin = async (targetEmail?: string, targetPassword?: string) => {
    const submitEmail = (targetEmail !== undefined ? targetEmail : email).trim();
    const submitPassword = targetPassword !== undefined ? targetPassword : password;

    if (!submitEmail || !submitPassword) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submitEmail, password: submitPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please verify credentials.");
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin();
  };

  const handleAutoFill = () => {
    setEmail("admin@aroha.com");
    setPassword("ArohaAdmin2026!");
    setError(null);
  };

  const handleOneClickLogin = async () => {
    setEmail("admin@aroha.com");
    setPassword("ArohaAdmin2026!");
    await executeLogin("admin@aroha.com", "ArohaAdmin2026!");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center px-4 py-12 text-[#252925]">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6a7d61] hover:text-[#173D32] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Aroha Travels Public Website</span>
        </Link>

        <div className="bg-white border border-[#E9E1D5] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#173D32] text-[#FAF9F6] flex items-center justify-center mx-auto mb-3 shadow">
              <Compass className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#173D32]">
              Staff Operations Portal
            </h1>
            <p className="text-xs text-[#252925]/70 font-light">
              Aroha Travels · Reservations & CMS Atelier
            </p>
          </div>

          {/* Prominent Demo Staff Account Box */}
          <div className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#173D32] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
                Demo Staff Account
              </span>
              <span className="text-[10px] font-mono text-[#6a7d61] bg-white px-2 py-0.5 rounded border border-[#E9E1D5]">
                STAFF_ADMIN
              </span>
            </div>

            <div className="font-mono text-[11px] text-[#252925]/80 bg-white p-2.5 rounded-xl border border-[#E9E1D5]/70 space-y-0.5">
              <p><strong className="text-[#173D32]">Email:</strong> admin@aroha.com</p>
              <p><strong className="text-[#173D32]">Pass:</strong> ArohaAdmin2026!</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={loading}
                className="bg-white hover:bg-[#FAF9F6] text-[#173D32] border border-[#E9E1D5] hover:border-[#173D32] py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm text-center cursor-pointer"
              >
                Auto-fill Inputs
              </button>
              <button
                type="button"
                onClick={handleOneClickLogin}
                disabled={loading}
                className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>1-Click Sign In</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.15em] transition-all shadow hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
            <span className="text-[11px] text-[#6a7d61] font-mono">
              SECURE SESSION · ROLE-BASED ACCESS CONTROL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
