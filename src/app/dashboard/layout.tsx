import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { RealtimeProvider } from "@/components/realtime-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { DISPLAY_CURRENCY_COOKIE, normalizeCurrency } from "@/lib/currency";
import { PageTransition } from "@/components/ui/page-transition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialCurrency = normalizeCurrency(cookieStore.get(DISPLAY_CURRENCY_COOKIE)?.value);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirected=true");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader profile={profile} />
          <RealtimeProvider>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-clip">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </RealtimeProvider>
        </div>
      </div>
    </CurrencyProvider>
  );
}
