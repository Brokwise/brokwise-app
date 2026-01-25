"use client";

import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  BidInfoResponse,
  MyBidResponse,
  LeaderboardEntry,
} from "@/models/types/bid";

/**
 * Hook to get bid leaderboard and info for an enquiry
 */
export const useGetBidLeaderboard = (
  enquiryId: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } = useQuery<BidInfoResponse>({
    queryKey: ["bid-leaderboard", enquiryId],
    queryFn: async () => {
      const response = await api.get(`/broker/enquiry/${enquiryId}/bid/leaderboard`);
      return response.data.data;
    },
    enabled: options?.enabled ?? !!enquiryId,
    refetchInterval: 30000, // Refetch every 30 seconds to keep leaderboard fresh
  });

  return {
    leaderboard: data?.leaderboard ?? [],
    totalBids: data?.totalBids ?? 0,
    minBidToEnterLeaderboard: data?.minBidToEnterLeaderboard ?? 1,
    minBidToTopLeaderboard: data?.minBidToTopLeaderboard ?? 1,
    myBid: data?.myBid,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get broker's own bid for an enquiry
 */
export const useGetMyBid = (
  enquiryId: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } = useQuery<MyBidResponse>({
    queryKey: ["my-bid", enquiryId],
    queryFn: async () => {
      const response = await api.get(`/broker/enquiry/${enquiryId}/bid/my-bid`);
      return response.data.data;
    },
    enabled: options?.enabled ?? !!enquiryId,
  });

  return {
    hasBid: data?.hasBid ?? false,
    bid: data?.bid ?? null,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Simulate where a bid would rank on the leaderboard (UI only, no API call)
 * Returns the rank the user would get if they placed this bid
 */
export const simulateBidRank = (
  leaderboard: LeaderboardEntry[],
  bidAmount: number
): number | null => {
  if (bidAmount < 1) return null;

  // Find where this bid would slot in
  // Bids are sorted by creditsUsed DESC, then createdAt ASC
  // New bid would be placed after existing bids with same amount (since it's newer)
  let rank = 1;
  for (const entry of leaderboard) {
    if (bidAmount > entry.creditsUsed) {
      break;
    }
    rank++;
  }

  // Only return rank if within top 4
  return rank <= 4 ? rank : null;
};

/**
 * Combined hook for bid operations (view only - bidding happens with proposal submission)
 */
export const useBid = (enquiryId: string) => {
  const {
    leaderboard,
    totalBids,
    minBidToEnterLeaderboard,
    minBidToTopLeaderboard,
    myBid,
    isLoading: isLeaderboardLoading,
    refetch: refetchLeaderboard,
  } = useGetBidLeaderboard(enquiryId);

  return {
    // Leaderboard data
    leaderboard,
    totalBids,
    minBidToEnterLeaderboard,
    minBidToTopLeaderboard,
    myBid,
    isLeaderboardLoading,
    refetchLeaderboard,

    // Simulate rank (UI only)
    simulateRank: (bidAmount: number) => simulateBidRank(leaderboard, bidAmount),
  };
};

export default useBid;
