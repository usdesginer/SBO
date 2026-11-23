import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  User, Mail, Phone, ShieldCheck, 
  Clock, MapPin, Smartphone, Key 
} from "lucide-react";

function InfoBlock({ icon: Icon, label, value }: { icon: any, label: string, value: string | null }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4]">
      <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center border border-[#E8EDF4] text-[#0B1220]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-[#101827]">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export default async function SecurityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101827] tracking-tight">Security &amp; Profile</h1>
        <p className="text-[#718096] text-sm">Manage your personal information and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-[#0B1220]" />
            <h2 className="text-base font-bold text-[#101827]">Personal Details</h2>
          </div>
          <div className="space-y-3">
            <InfoBlock icon={User} label="Full Name" value={profile?.full_name || user.email} />
            <InfoBlock icon={Mail} label="Email Address" value={user.email || null} />
            <InfoBlock icon={Phone} label="Mobile Number" value={profile?.phone || null} />
            <InfoBlock icon={MapPin} label="Residency" value="Switzerland (Verified)" />
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#059669]" />
            <h2 className="text-base font-bold text-[#101827]">Account Status</h2>
          </div>
          <div className="space-y-3">
            <InfoBlock icon={ShieldCheck} label="KYC Verification" value={profile?.kyc_status?.toUpperCase() || "PENDING"} />
            <InfoBlock icon={Clock} label="Last Login" value={new Date(user.last_sign_in_at!).toLocaleString("en-IE")} />
            <InfoBlock icon={Smartphone} label="2FA Status" value="Enabled (SMS)" />
            <InfoBlock icon={Key} label="Access Level" value={profile?.role?.toUpperCase() || "CUSTOMER"} />
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6">
        <h2 className="text-base font-bold text-[#101827] mb-6">Security Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 rounded-[12px] border border-[#E8EDF4] text-left hover:bg-[#F8FAFC] transition-all group">
            <p className="text-sm font-bold text-[#101827] group-hover:text-[#17243A] transition-colors">Change Password</p>
            <p className="text-xs text-[#718096] mt-1">Update your login credentials</p>
          </button>
          <button className="p-4 rounded-[12px] border border-[#E8EDF4] text-left hover:bg-[#F8FAFC] transition-all group">
            <p className="text-sm font-bold text-[#101827] group-hover:text-[#17243A] transition-colors">Update 2FA</p>
            <p className="text-xs text-[#718096] mt-1">Configure multi-factor auth</p>
          </button>
          <button className="p-4 rounded-[12px] border border-[#E8EDF4] text-left hover:bg-red-50/40 transition-all group">
            <p className="text-sm font-bold text-[#DC2626]">Deactivate Account</p>
            <p className="text-xs text-[#718096] mt-1">Close your digital profile</p>
          </button>
        </div>
      </div>
    </div>
  );
}
