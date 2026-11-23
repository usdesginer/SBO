"use client";

import { useState, useEffect } from "react";
import { Snowflake, Globe, ShoppingCart, DollarSign, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Database } from "@/lib/supabase/types";

type Card = Database["public"]["Tables"]["cards"]["Row"];

interface CardControlsProps {
  card: Card;
}

export function CardControls({ card: initialCard }: CardControlsProps) {
  const [card, setCard] = useState(initialCard);
  const [loading, setLoading] = useState(false);
  const { format } = useCurrency();

  useEffect(() => {
    setCard(initialCard);
  }, [initialCard]);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isFrozen = card.status === "frozen";

  const toggleFreeze = async () => {
    setLoading(true);
    const supabase = createClient();
    const newStatus = isFrozen ? "active" : "frozen";
    await supabase.from("cards").update({ status: newStatus }).eq("id", card.id);
    setCard(prev => ({ ...prev, status: newStatus }));
    setLoading(false);
  };

  const toggleControl = async (field: "online_purchases" | "international_purchases") => {
    const supabase = createClient();
    const newValue = !card[field];
    await supabase.from("cards").update({ [field]: newValue }).eq("id", card.id);
    setCard(prev => ({ ...prev, [field]: newValue }));
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6">
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="premium-glass rounded-[16px] p-6 relative min-h-[240px] flex flex-col justify-between group cursor-pointer"
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ transform: "translateZ(50px)" }}>
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white blur-[110px] -mr-36 -mt-36" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-emerald-400 blur-[90px] -ml-28 -mb-28" />
          </div>

          {isFrozen && (
            <div className="absolute inset-0 bg-[#0B1220]/85 backdrop-blur-xl flex items-center justify-center z-20 rounded-[16px] animate-in fade-in duration-500">
              <div className="text-center" style={{ transform: "translateZ(80px)" }}>
                <Snowflake className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-pulse" />
                <p className="text-white font-bold text-xl uppercase tracking-[0.25em]">Vault Locked</p>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Institutional Security Active</p>
              </div>
            </div>
          )}

          <div className="relative z-10 flex flex-col h-full justify-between" style={{ transform: "translateZ(60px)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.25em] mb-1">Entity Series</p>
                <h3 className="text-white font-bold text-xl tracking-tight uppercase group-hover:tracking-wider transition-all duration-500">{card.card_name}</h3>
              </div>
              <div className="flex gap-1.5 opacity-60">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20" />
                <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 -ml-5" />
              </div>
            </div>

            <div className="my-6">
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.25em] mb-2">Daily Limit</p>
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">{format(card.daily_limit ?? 0, "EUR")}</p>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Available</p>
                  <p className="text-white/80 text-xs font-mono tabular-nums font-bold">{format(card.daily_limit ?? 0, "EUR")}</p>
                </div>
                <div className="w-[1px] h-4 bg-white/15" />
                <div>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Type</p>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-tight">{card.card_type} Infinite</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end gap-3">
              <div className="min-w-0">
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5">Identifier</p>
                <p className="text-white/90 text-xs sm:text-sm font-mono tracking-[0.2em] drop-shadow-lg truncate">{card.card_number_masked}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5">Valid Thru</p>
                <p className="text-white text-xs font-mono font-bold tracking-widest">{String(card.expiry_month).padStart(2, "0")}/{card.expiry_year}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 sm:px-6 pb-6 space-y-4">
        <button 
          onClick={toggleFreeze} 
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-between px-5 py-4 rounded-[12px] border font-bold transition-all duration-300 text-[11px] uppercase tracking-[0.18em] group",
            isFrozen
              ? "border-blue-200 bg-blue-50 text-[#2563EB] hover:bg-blue-100"
              : "border-[#E8EDF4] bg-[#F8FAFC] text-[#718096] hover:bg-white hover:text-[#101827]"
          )}
        >
          <div className="flex items-center gap-3.5">
            <Snowflake className={cn("w-5 h-5 transition-all duration-500", isFrozen ? "animate-pulse" : "opacity-40 group-hover:rotate-180")} />
            <span>{isFrozen ? "Disengage Vault Lock" : "Engage Security Lock"}</span>
          </div>
          <div className={cn(
            "w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 shadow-inner",
            isFrozen ? "bg-[#2563EB]" : "bg-[#E8EDF4]"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-500 ease-out",
              isFrozen ? "translate-x-6" : "translate-x-0"
            )} />
          </div>
        </button>

        <div className="grid grid-cols-1 gap-3">
          {[
            { field: "online_purchases" as const, label: "Digital Channel Access", icon: ShoppingCart },
            { field: "international_purchases" as const, label: "Global Liquidity Access", icon: Globe },
          ].map(({ field, label, icon: Icon }) => (
            <div key={field} className="flex items-center justify-between px-5 py-4 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] group hover:bg-white transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E8EDF4] flex items-center justify-center transition-all group-hover:scale-105">
                  <Icon className="w-4 h-4 text-[#718096] group-hover:text-[#101827] transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider group-hover:text-[#101827]">{label}</span>
              </div>
              <button 
                onClick={() => toggleControl(field)}
                className={cn(
                  "w-10 h-5 rounded-full transition-all duration-500 flex items-center px-1 shadow-inner",
                  card[field] ? "bg-[#059669]" : "bg-[#CBD5E1]"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-500 ease-out",
                  card[field] ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between px-5 py-4 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] group">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E8EDF4] flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#718096]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Daily Disbursement Limit</span>
                <p className="text-sm font-mono tabular-nums font-bold text-[#101827]">{format(card.daily_limit ?? 0, "EUR")}</p>
              </div>
            </div>
            <button className="text-[10px] font-bold text-[#101827] hover:text-[#E85D65] uppercase tracking-[0.16em] transition-colors bg-white px-3 py-1.5 rounded-[10px] border border-[#E8EDF4]">Increase</button>
          </div>
        </div>

        <button className="w-full py-4 text-slate-300 hover:text-brand-950 transition-all text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 opacity-20" />
          Re-Issue Physical Entity
        </button>
      </div>
    </div>
  );
}