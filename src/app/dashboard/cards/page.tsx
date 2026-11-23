import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardControls } from "@/components/dashboard/card-controls";

export default async function CardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cards } = await supabase.from("cards").select("*").eq("user_id", user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#101827] tracking-tight">Card Management</h1>
      {(!cards || cards.length === 0) ? (
        <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-8 text-center text-[#718096]">
          No cards found. Contact Support to request.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => (
            <CardControls key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
