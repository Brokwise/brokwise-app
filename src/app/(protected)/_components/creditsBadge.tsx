"use client";

import React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWalletBalance } from "@/hooks/useCredits";

export const CreditsBadge = () => {
  const { balance, isLoading } = useGetWalletBalance();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 h-9 px-3"
      asChild
    >
      <Link href="/credits">
        <Coins className="h-4 w-4 text-primary" />
        {isLoading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <span className="font-semibold">{balance.toLocaleString()}</span>
        )}
      </Link>
    </Button>
  );
};
