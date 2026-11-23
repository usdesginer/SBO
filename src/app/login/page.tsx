"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, User as UserIcon } from "lucide-react";
import { loginAction } from "@/app/auth/actions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasRedirected = searchParams.get("redirected");
  const { assets } = useSiteSettings();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginAction(identifier, password);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#17243A]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E85D65]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <ArrowLeft className="w-4 h-4 text-white/55 group-hover:-translate-x-1 transition-transform" />
            <span className="text-white/60 text-sm hover:text-white transition-colors">Back to Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className={cn(
            "w-10 h-10 rounded-[12px] flex items-center justify-center text-[#0B1220] font-bold text-xl shadow-lg overflow-hidden",
            !assets.logo && "bg-white"
          )}>
            {assets.logo ? (
              <Image src={assets.logo} width={40} height={40} alt="Pentagon Finances Logo" className="object-contain" unoptimized />
            ) : (
              "P"
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Pentagon Finances</h1>
            <p className="text-xs text-white/55">Secure Internet Banking · Switzerland</p>
          </div>
        </div>

        <div className="bg-[#17243A]/90 backdrop-blur-xl border border-white/15 rounded-[20px] p-7 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1.5">Institutional Access</h2>
          <p className="text-white/60 text-sm mb-7">Sign in to your Pentagon Finances portal</p>

          {wasRedirected && !error && (
            <div className="mb-6 p-3.5 rounded-[10px] bg-[#E85D65]/15 border border-[#E85D65]/30 text-[#E85D65] text-sm font-medium">
              Please sign in to access your digital vault.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-[10px] bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Email or IBAN Account Number
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="member@pentagonfinances.ch or CH..."
                  className="w-full px-4 py-3 bg-[#0B1220]/70 border border-white/15 rounded-[10px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E85D65]/40 focus:border-[#E85D65] transition-all text-sm pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35">
                  <UserIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Secure Password
                </label>
                <a href="/support" className="text-xs text-[#E85D65] hover:underline transition-colors">
                  Support?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0B1220]/70 border border-white/15 rounded-[10px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E85D65]/40 focus:border-[#E85D65] transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#E85D65] focus:ring-[#E85D65]"
              />
              <label htmlFor="remember-me" className="text-xs text-white/60">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-[#E85D65] hover:bg-[#DC555D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-xs rounded-[12px] transition-all shadow-lg shadow-[#E85D65]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Engage Secure Session"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/55 text-xs">
              New to Pentagon Finances?{" "}
              <Link href="/open-account" className="text-[#E85D65] hover:underline font-semibold transition-colors">
                Apply for Membership
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>256-bit SSL Institutional Encryption · PCI DSS Compliant</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
