"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBid } from "@/hooks/useBid";
import { useGetWalletBalance } from "@/hooks/useCredits";
import {
  Loader2,
  Minus,
  Plus,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface BidBoostProps {
  enquiryId: string;
  disabled?: boolean;
  onBidChange?: (bidCredits: number | null) => void;
}

const LEADERBOARD_SIZE = 4;

const getRankLabel = (rank: number): string => {
  switch (rank) {
    case 1:
      return "1st place";
    case 2:
      return "2nd place";
    case 3:
      return "3rd place";
    case 4:
      return "4th place";
    default:
      return `${rank}th place`;
  }
};

export const BidBoost: React.FC<BidBoostProps> = ({
  enquiryId,
  disabled,
  onBidChange,
}) => {
  const {
    leaderboard,
    minBidToEnterLeaderboard,
    minBidToTopLeaderboard,
    myBid,
    isLeaderboardLoading,
    refetchLeaderboard,
    simulateRank,
  } = useBid(enquiryId);

  const { balance, isLoading: isBalanceLoading } = useGetWalletBalance();
  const [bidAmount, setBidAmount] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [simulatedRank, setSimulatedRank] = useState<number | null>(null);
  const [isBidSet, setIsBidSet] = useState(false);

  // Update lastUpdated when leaderboard refreshes
  useEffect(() => {
    if (!isLeaderboardLoading) {
      setLastUpdated(new Date());
    }
  }, [isLeaderboardLoading, leaderboard]);

  // Set initial bid amount based on min to enter
  useEffect(() => {
    if (minBidToEnterLeaderboard && !myBid) {
      setBidAmount(minBidToEnterLeaderboard);
    }
  }, [minBidToEnterLeaderboard, myBid]);

  // Reset simulated rank when bid amount changes
  useEffect(() => {
    if (isBidSet) {
      // Recalculate simulated rank when leaderboard updates
      const rank = simulateRank(bidAmount);
      setSimulatedRank(rank);
    }
  }, [leaderboard, bidAmount, isBidSet, simulateRank]);

  const handleIncrement = () => {
    setBidAmount((prev) => prev + 1);
    // Reset bid set state when changing amount
    if (isBidSet) {
      setIsBidSet(false);
      setSimulatedRank(null);
      onBidChange?.(null);
    }
  };

  const handleDecrement = () => {
    setBidAmount((prev) => Math.max(1, prev - 1));
    // Reset bid set state when changing amount
    if (isBidSet) {
      setIsBidSet(false);
      setSimulatedRank(null);
      onBidChange?.(null);
    }
  };

  const handleSetBid = () => {
    if (bidAmount < 1 || bidAmount > balance) return;

    // Simulate the rank (UI only, no API call)
    const rank = simulateRank(bidAmount);
    setSimulatedRank(rank);
    setIsBidSet(true);

    // Notify parent of the bid amount to include in submission
    onBidChange?.(bidAmount);
  };

  const handleClearBid = () => {
    setIsBidSet(false);
    setSimulatedRank(null);
    onBidChange?.(null);
  };

  const canSetBid =
    !myBid && bidAmount >= 1 && bidAmount <= balance && !disabled;

  // Build leaderboard display (always show 4 slots)
  // Include simulated bid position if set
  const leaderboardDisplay = React.useMemo(() => {
    const display: Array<{
      rank: number;
      creditsUsed: number | null;
      isMyBid: boolean;
      isSimulated: boolean;
    }> = [];

    if (isBidSet && simulatedRank !== null) {
      // Insert simulated bid into leaderboard
      let currentLeaderboardIndex = 0;

      for (let rank = 1; rank <= LEADERBOARD_SIZE; rank++) {
        if (rank === simulatedRank) {
          // This is where our simulated bid goes
          display.push({
            rank,
            creditsUsed: bidAmount,
            isMyBid: false,
            isSimulated: true,
          });
        } else {
          // Fill with actual leaderboard entries (shifted if needed)
          const entry = leaderboard[currentLeaderboardIndex];
          if (entry && currentLeaderboardIndex < LEADERBOARD_SIZE) {
            // Skip one if we're past the simulated rank (entry got bumped)
            if (rank > simulatedRank) {
              const bumpedEntry = leaderboard[currentLeaderboardIndex];
              if (bumpedEntry) {
                display.push({
                  rank,
                  creditsUsed: bumpedEntry.creditsUsed,
                  isMyBid: myBid?.rank === currentLeaderboardIndex + 1,
                  isSimulated: false,
                });
              } else {
                display.push({
                  rank,
                  creditsUsed: null,
                  isMyBid: false,
                  isSimulated: false,
                });
              }
              currentLeaderboardIndex++;
            } else {
              display.push({
                rank,
                creditsUsed: entry.creditsUsed,
                isMyBid: myBid?.rank === currentLeaderboardIndex + 1,
                isSimulated: false,
              });
              currentLeaderboardIndex++;
            }
          } else {
            display.push({
              rank,
              creditsUsed: null,
              isMyBid: false,
              isSimulated: false,
            });
          }
        }
      }
    } else {
      // No simulation, show actual leaderboard
      for (let i = 0; i < LEADERBOARD_SIZE; i++) {
        const entry = leaderboard[i];
        display.push({
          rank: i + 1,
          creditsUsed: entry?.creditsUsed ?? null,
          isMyBid: myBid?.rank === i + 1,
          isSimulated: false,
        });
      }
    }

    return display;
  }, [leaderboard, myBid, isBidSet, simulatedRank, bidAmount]);

  if (isLeaderboardLoading && leaderboard.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-card space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Boost your proposal{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Bid with Credits to be shown earlier on a enquirer&apos;s list.
          Brokwise will only charge your bid if you&apos;re among the top 4
          bidders, or if the enquirer interacts with your proposal before the
          auction closes.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span className="w-24">Rank</span>
          <span className="flex items-center gap-1">
            Bid
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Credits bid by brokers. Top 4 bids will be charged when the
                    enquiry closes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <span className="ml-auto flex items-center gap-2 text-xs">
            <RefreshCw
              className={cn(
                "h-3 w-3 cursor-pointer hover:text-foreground transition-colors",
                isLeaderboardLoading && "animate-spin"
              )}
              onClick={() => refetchLeaderboard()}
            />
            {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>

        <div className="space-y-2">
          {leaderboardDisplay.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-4 py-2 px-3 rounded-md text-sm",
                entry.isMyBid && "bg-primary/10 border border-primary/20",
                entry.isSimulated &&
                "bg-green-500/10 border border-green-500/30 animate-pulse"
              )}
            >
              <span className="w-24 font-medium">
                {getRankLabel(entry.rank)}
                {entry.isMyBid && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
                {entry.isSimulated && (
                  <span className="ml-2 text-xs text-green-600">(Your bid)</span>
                )}
              </span>
              <span
                className={cn(
                  "font-medium",
                  entry.creditsUsed === null && "text-muted-foreground",
                  entry.isSimulated && "text-green-600"
                )}
              >
                {entry.creditsUsed !== null
                  ? `${entry.creditsUsed} Credit${entry.creditsUsed !== 1 ? "s" : ""}`
                  : "No bids"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Already placed bid message */}
      {myBid && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            You have already placed a bid of {myBid.creditsUsed} Credit
            {myBid.creditsUsed !== 1 ? "s" : ""}
            {myBid.rank ? ` (Ranked #${myBid.rank})` : " (Not in top 4)"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Re-bidding is not allowed. Your bid will be refunded if you&apos;re
            outbid from the top 4.
          </p>
        </div>
      )}

      {/* Bid Set Confirmation */}
      {isBidSet && !myBid && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm font-medium text-green-600 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Bid of {bidAmount} Credit{bidAmount !== 1 ? "s" : ""} will be
            submitted with your proposal
            {simulatedRank
              ? ` (Expected rank: #${simulatedRank})`
              : " (May not enter top 4)"}
          </p>
          <button
            onClick={handleClearBid}
            className="text-xs text-muted-foreground hover:text-foreground mt-1 underline"
          >
            Clear bid
          </button>
        </div>
      )}

      {/* Bid Input Section - Only show if no existing bid */}
      {!myBid && !isBidSet && (
        <>
          {/* Your bid section */}
          <div className="space-y-3">
            <h4 className="font-semibold">Your bid</h4>

            {/* Bid recommendation */}
            <div className="space-y-1">
              <p className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>
                  Bid{" "}
                  <strong className="text-foreground">
                    {minBidToTopLeaderboard} Credit
                    {minBidToTopLeaderboard !== 1 ? "s" : ""}
                  </strong>{" "}
                  or higher to be ranked in{" "}
                  <strong className="text-foreground">1st place</strong>.
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Bid{" "}
                <strong>
                  {minBidToEnterLeaderboard} Credit
                  {minBidToEnterLeaderboard !== 1 ? "s" : ""}
                </strong>{" "}
                or higher to be ranked in the top 4.
              </p>
            </div>

            {/* Bid input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none border-r hover:bg-muted"
                  onClick={handleDecrement}
                  disabled={bidAmount <= 1 || disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-20 h-12 flex items-center justify-center text-lg font-semibold">
                  {bidAmount}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none border-l hover:bg-muted"
                  onClick={handleIncrement}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleSetBid}
                disabled={!canSetBid}
                className="h-12 px-6"
                variant="outline"
              >
                Set bid
              </Button>
            </div>

            {/* Remaining balance */}
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">
                Remaining balance:{" "}
                <span className="font-medium text-foreground">
                  {isBalanceLoading ? (
                    <Loader2 className="inline h-3 w-3 animate-spin" />
                  ) : (
                    `${balance} Credits`
                  )}
                </span>
              </p>
            </div>

            {/* Insufficient balance warning */}
            {bidAmount > balance && !isBalanceLoading && (
              <p className="text-sm text-destructive">
                Insufficient credits. You need {bidAmount - balance} more
                credits to place this bid.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BidBoost;
