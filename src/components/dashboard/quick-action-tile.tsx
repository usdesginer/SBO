"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  CreditCard, 
  Landmark, 
  TrendingUp, 
  RefreshCw,
  Wallet,
  ShieldCheck
} from "lucide-react";

const iconMap = {
  cards: CreditCard,
  loans: Landmark,
  markets: TrendingUp,
  security: RefreshCw,
  payments: Wallet,
  compliance: ShieldCheck
};

export type QuickActionIconType = keyof typeof iconMap;

interface QuickActionTileProps {
  label: string;
  iconType: QuickActionIconType;
  href: string;
  isFrequent?: boolean;
}

export function QuickActionTile({ label, iconType, href, isFrequent }: QuickActionTileProps) {
  const Icon = iconMap[iconType];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group h-full"
    >
      <Link href={href} className="block h-full">
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-accent-500/20 blur-[40px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative h-full bg-white rounded-[20px] border border-[#E8EDF4] p-6 flex flex-col items-center justify-center gap-3.5 shadow-[var(--shadow-card)] group-hover:shadow-md transition-all duration-300 overflow-hidden text-center">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F8FAFC] rounded-full -mr-10 -mt-10 group-hover:bg-[#E85D65]/10 transition-colors duration-300" />
          
          <div className="w-12 h-12 rounded-[12px] bg-[#F8FAFC] flex items-center justify-center text-[#101827] group-hover:bg-[#0B1220] group-hover:text-white transition-all duration-300 border border-[#E8EDF4]">
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="text-center">
            <span className="text-xs font-semibold text-[#101827] group-hover:text-[#0B1220] transition-colors">
              {label}
            </span>
            {isFrequent && (
              <div className="mt-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-1 h-1 rounded-full bg-[#E85D65]" />
                <span className="text-[10px] font-medium text-[#718096]">Quick Access</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}