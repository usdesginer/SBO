"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Institutional Animated Number
 * Uses en-IE locale for comma-separated multi-currency formatting (e.g. 245,688.89).
 */
export function AnimatedNumber({ value, className, size = "md" }: AnimatedNumberProps) {
  const count = useMotionValue(0);
  
  const integerPart = useTransform(count, (latest) => 
    new Intl.NumberFormat("en-IE", { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(Math.floor(latest))
  );

  const decimalPart = useTransform(count, (latest) => {
    const val = latest.toFixed(2);
    const parts = val.split(".");
    return `.${parts[1] || "00"}`;
  });

  const [intDisplay, setIntDisplay] = useState("0");
  const [decDisplay, setDecDisplay] = useState(".00");

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "circOut" });
    return controls.stop;
  }, [value, count]);

  useEffect(() => {
    const unsubscribeInt = integerPart.on("change", (latest) => setIntDisplay(latest));
    const unsubscribeDec = decimalPart.on("change", (latest) => setDecDisplay(latest));
    return () => {
      unsubscribeInt();
      unsubscribeDec();
    };
  }, [integerPart, decimalPart]);

  const sizes = {
    sm: { int: "text-[15px] sm:text-[17px] font-semibold", dec: "text-xs font-medium" },
    md: { int: "text-lg sm:text-xl font-bold", dec: "text-xs font-medium" },
    lg: { int: "text-xl sm:text-2xl font-bold", dec: "text-sm font-medium" },
    xl: { int: "text-2xl sm:text-[26px] font-bold", dec: "text-sm sm:text-base font-medium" },
  };

  const currentSize = sizes[size];

  return (
    <span className={cn("inline-flex items-baseline font-mono tabular-nums tracking-[-0.035em]", className)}>
      <span className={cn("leading-none", currentSize.int)}>{intDisplay}</span>
      <span className={cn("opacity-55 leading-none", currentSize.dec)}>{decDisplay}</span>
    </span>
  );
}