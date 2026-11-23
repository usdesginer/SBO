"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";

export default function RegisterMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "customer" as "customer" | "admin",
    kycStatus: "approved" as "pending" | "approved" | "rejected",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.fullName || !form.email || !form.password) {
      return setError("Full name, email and password are required.");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    setLoading(true);

    const res = await fetch("/api/admin/create-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        kycStatus: form.kycStatus,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create member.");
    } else {
      setSuccess(`Member "${form.fullName}" created successfully!`);
      setTimeout(() => router.push(`/admin/members/${data.userId}`), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/members"
          className="flex items-center gap-1.5 text-[#718096] hover:text-[#101827] transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Register New Member</h1>
        <p className="text-[#718096] text-sm mt-1">
          Create a new customer account. The member can sign in immediately using the credentials you set.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 space-y-4 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-bold text-[#101827] border-b border-[#E8EDF4] pb-3 mb-4 uppercase tracking-wider">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Maria Schneider"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+41 79 123 45 67"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="maria@example.com"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm pr-10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#101827] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Role & KYC */}
        <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 space-y-4 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-bold text-[#101827] border-b border-[#E8EDF4] pb-3 mb-4 uppercase tracking-wider">
            Account Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  update("role", e.target.value)
                }
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm transition-all"
              >
                <option value="customer">Customer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
                KYC Status
              </label>
              <select
                value={form.kycStatus}
                onChange={(e) => update("kycStatus", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 text-sm transition-all"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-[12px] bg-red-50 border border-red-200 text-[#DC2626] text-sm font-medium">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-[#059669] text-sm font-medium">
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded-[12px] transition-colors shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating member...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 text-[#E85D65]" />
              Create Member Account
            </>
          )}
        </button>
      </form>
    </div>
  );
}
