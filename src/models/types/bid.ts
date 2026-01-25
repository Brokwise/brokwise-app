// Bid status - ACTIVE means in top 4, REFUNDED means out-bidded and credits returned
export type BidStatus = "ACTIVE" | "REFUNDED";

// Bid interface
export interface Bid {
  _id: string;
  brokerId: string;
  enquiryId: string;
  creditsUsed: number;
  status: BidStatus;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  rank?: number | null;
  isOnLeaderboard?: boolean;
}

// Leaderboard entry - what we show to users
export interface LeaderboardEntry {
  rank: number;
  brokerId: string;
  creditsUsed: number;
  bidId: string;
  createdAt: Date;
}

// Bid info response - includes leaderboard and min/max bid info
export interface BidInfoResponse {
  leaderboard: LeaderboardEntry[];
  totalBids: number;
  minBidToEnterLeaderboard: number; // min credits to get on leaderboard (4th place + 1)
  minBidToTopLeaderboard: number; // min credits to be #1 (current max + 1)
  myBid?: {
    creditsUsed: number;
    status: BidStatus;
    rank?: number; // only if in top 4
  };
}

// Place bid response
export interface PlaceBidResponse {
  bid: Bid;
  refundedBrokers: number;
}

// My bid response
export interface MyBidResponse {
  hasBid: boolean;
  bid: Bid | null;
}
