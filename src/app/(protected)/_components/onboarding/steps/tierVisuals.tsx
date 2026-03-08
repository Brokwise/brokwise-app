import React from "react";
import { Crown, Rocket, Zap } from "lucide-react";
import { TIER } from "@/models/types/subscription";

export const tierIcons: Record<TIER, React.ReactNode> = {
  BASIC: <Zap className="h-6 w-6" />,
  ESSENTIAL: <Rocket className="h-6 w-6" />,
  PRO: <Crown className="h-6 w-6" />,
};

export const tierColors: Record<TIER, string> = {
  BASIC: "from-gray-500 to-gray-600",
  ESSENTIAL: "from-blue-500 to-blue-600",
  PRO: "from-amber-500 to-amber-600",
};
