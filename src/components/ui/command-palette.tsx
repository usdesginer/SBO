"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CreditCard, History, User, Landmark, TrendingUp, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS = [
  { id: "dashboard", label: "Dashboard", icon: Command, href: "/dashboard" },
  { id: "accounts", label: "View Accounts", icon: Landmark, href: "/dashboard/accounts" },
  { id: "transfers", label: "Send Money", icon: History, href: "/dashboard/transfers" },
  { id: "cards", label: "Card Settings", icon: CreditCard, href: "/dashboard/cards" },
  { id: "investments", label: "Market Portfolio", icon: TrendingUp, href: "/dashboard/investments" },
  { id: "profile", label: "Institutional Profile", icon: User, href: "/dashboard/security" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null; // Parent handles opening if triggered from elsewhere, but here we just listen
      }
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const filtered = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:pt-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white rounded-[20px] shadow-[0_32px_90px_rgba(11,18,32,0.35)] border border-[#E8EDF4] overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-[#E8EDF4]">
              <Search className="w-5 h-5 text-[#718096]" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts, actions, members..."
                className="flex-1 bg-transparent border-none outline-none text-[#101827] text-sm font-medium placeholder:text-[#94A3B8]"
              />
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-[#F8FAFC] rounded-[10px] transition-colors text-[#718096]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="p-2 max-h-[400px] overflow-y-auto scrollbar-none">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold text-[#718096] uppercase tracking-widest">No matching commands found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.href)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-[12px] hover:bg-[#F8FAFC] transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#718096] group-hover:bg-[#0B1220] group-hover:text-white group-hover:border-[#0B1220] transition-all">
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#101827] tracking-tight">{cmd.label}</p>
                        <p className="text-[11px] text-[#718096] font-mono mt-0.5">{cmd.href}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-[#E85D65] uppercase tracking-widest">Open</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E8EDF4] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-white border border-[#E8EDF4] rounded-[6px] text-[10px] font-bold text-[#718096]">Enter</kbd>
                  <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-white border border-[#E8EDF4] rounded-[6px] text-[10px] font-bold text-[#718096]">Esc</kbd>
                  <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Close</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">System Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
