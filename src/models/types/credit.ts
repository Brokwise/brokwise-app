// Credit Pack Configuration
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  description: string;
  flagText?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export type CreditTransactionType =
  | "signup_bonus"
  | "purchase"
  | "debit"
  | "bid_debit"
  | "refund"
  | "admin_adjustment";

// Transaction status
export type CreditTransactionStatus = "pending" | "completed" | "failed";

// Credit Wallet Interface
export interface CreditWallet {
  _id: string;
  brokerId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Transaction Interface
export interface CreditTransaction {
  _id: string;
  brokerId: string;
  walletId: string;
  type: CreditTransactionType;
  amount: number; // Credits amount (positive for credit, negative for debit)
  balanceAfter: number;
  description: string;
  status: CreditTransactionStatus;
  // Payment related fields (for purchases)
  orderId?: string;
  paymentId?: string;
  packId?: string;
  amountPaidInr?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface WalletBalanceResponse {
  balance: number;
  walletId: string;
}

export interface CreditPacksResponse {
  packs: CreditPack[];
}

export interface CreatePurchaseOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  key_id: string;
  amount: number;
  currency: string;
  pack: CreditPack;
}

export interface TransactionHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CheckCreditBalanceResponse {
  hasEnough: boolean;
  requiredAmount: number;
}
