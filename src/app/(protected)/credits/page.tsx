"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useApp } from "@/context/AppContext";
import {
    useCredits,
    useGetCreditHistory,
} from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import {
    Wallet,
    CreditCard,
    History,
    Coins,
    Gift,
    Minus,
    RefreshCcw,
    Settings,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    Sparkles,
    ExternalLink,
    Smartphone,
} from "lucide-react";
import { CreditPack, CreditTransaction, CreditTransactionType } from "@/models/types/credit";
import { cn } from "@/lib/utils";
import { isNativeIOS } from "@/utils/helper";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

// Web App Information Component for iOS (Apple Compliant)
const WebAppInfoCard = () => {
    const WEB_APP_URL = "https://app.brokwise.com";

    return (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Additional Features
                </CardTitle>
                <CardDescription>
                    More options are available on our web platform
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Typography variant="p" className="text-muted-foreground">
                    For account management and additional features, visit our web application. 
                    Your account is synced across all platforms.
                </Typography>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => window.open(WEB_APP_URL, "_blank")}
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                </Button>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Your account is synced across all platforms
                </div>
            </CardFooter>
        </Card>
    );
};

// Transaction type icons and colors
const transactionTypeConfig: Record<
    CreditTransactionType,
    { icon: React.ReactNode; color: string; label: string }
> = {
    signup_bonus: {
        icon: <Gift className="h-4 w-4" />,
        color: "text-green-500",
        label: "Signup Bonus",
    },
    purchase: {
        icon: <CreditCard className="h-4 w-4" />,
        color: "text-blue-500",
        label: "Purchase",
    },
    debit: {
        icon: <Minus className="h-4 w-4" />,
        color: "text-red-500",
        label: "Used",
    },
    bid_debit: {
        icon: <Minus className="h-4 w-4" />,
        color: "text-red-500",
        label: "Used",
    },
    refund: {
        icon: <RefreshCcw className="h-4 w-4" />,
        color: "text-orange-500",
        label: "Refund",
    },
    admin_adjustment: {
        icon: <Settings className="h-4 w-4" />,
        color: "text-purple-500",
        label: "Adjustment",
    },
};

// Wallet Balance Card Component
const WalletBalanceCard = ({
    balance,
    isLoading,
}: {
    balance: number;
    isLoading: boolean;
}) => {
    return (
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle>
                    <Wallet className="h-5 w-5 text-primary" />
                    Your Credit Balance
                </CardTitle>
                <CardDescription>Available credits in your wallet</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-12 w-32" />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <Typography variant="value" className="text-4xl text-primary">
                            {balance.toLocaleString()}
                        </Typography>
                        <Typography variant="muted">credits</Typography>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Credit Pack Card Component
const CreditPackCard = ({
    pack,
    isSelected,
    onSelect,
}: {
    pack: CreditPack;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all duration-200 relative overflow-hidden group",
                isSelected
                    ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                    : "hover:border-primary/50 hover:shadow-md"
            )}
            onClick={onSelect}
        >
            {/* Badge */}
            {pack.flagText && (
                <div className="absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    <Typography variant="small">{pack.flagText}</Typography>
                </div>
            )}

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-3 left-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4 text-primary-foreground" />
                </div>
            )}

            <CardHeader className={cn("pb-3", pack.flagText && "pt-8")}>
                <CardTitle>{pack.name}</CardTitle>
                <CardDescription>{pack.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Credits Display */}
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                    <div className="flex items-baseline justify-center gap-1">
                        <Coins className="h-6 w-6 text-primary mr-1" />
                        <Typography variant="value" className="text-foreground">{pack.credits.toLocaleString()}</Typography>
                    </div>
                    <Typography variant="small" className="text-muted-foreground">credits</Typography>
                </div>

                {/* Price */}
                <div className="text-center">
                    <Typography variant="value" className="text-primary">₹{pack.priceInr}</Typography>
                </div>
            </CardContent>

            {/* Bottom indicator bar */}
            <div className={cn(
                "h-1 w-full transition-all duration-200",
                isSelected ? "bg-primary" : "bg-muted group-hover:bg-primary/30"
            )} />
        </Card>
    );
};

// Transaction History Component
const TransactionHistory = () => {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<CreditTransactionType | undefined>(
        undefined
    );
    const { transactions, totalPages, isLoading } = useGetCreditHistory({
        page,
        limit: 10,
        type: typeFilter,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="default">Completed</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>
                            <History className="h-5 w-5" />
                            Transaction History
                        </CardTitle>
                        <CardDescription>Your credit transaction records</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={typeFilter === undefined ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter(undefined)}
                        >
                            All
                        </Button>
                        <Button
                            variant={typeFilter === "purchase" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter("purchase")}
                        >
                            Purchases
                        </Button>
                        <Button
                            variant={typeFilter === "debit" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter("debit")}
                        >
                            Used
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Credits</TableHead>
                                        <TableHead className="text-right">Balance After</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction: CreditTransaction) => {
                                        const config = transactionTypeConfig[transaction.type];
                                        return (
                                            <TableRow key={transaction._id}>
                                                <TableCell>
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-2",
                                                            config?.color
                                                        )}
                                                    >
                                                        {config?.icon}
                                                        <span className="font-medium">{config.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {transaction.description}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-right font-semibold",
                                                        transaction.amount > 0
                                                            ? "text-green-500"
                                                            : "text-red-500"
                                                    )}
                                                >
                                                    {transaction.amount > 0 ? "+" : ""}
                                                    {transaction.amount}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {transaction.balanceAfter}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {formatDate(transaction.createdAt)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile view */}
                        <div className="md:hidden space-y-3">
                            {transactions.map((transaction: CreditTransaction) => {
                                const config = transactionTypeConfig[transaction.type];
                                return (
                                    <Card key={transaction._id} className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div
                                                className={cn("flex items-center gap-2", config.color)}
                                            >
                                                {config.icon}
                                                <span className="font-medium">{config.label}</span>
                                            </div>
                                            <span
                                                className={cn(
                                                    "font-bold",
                                                    transaction.amount > 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                )}
                                            >
                                                {transaction.amount > 0 ? "+" : ""}
                                                {transaction.amount}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 truncate">
                                            {transaction.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Balance: {transaction.balanceAfter}</span>
                                            {getStatusBadge(transaction.status)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {formatDate(transaction.createdAt)}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// Main Credits Page Component
const CreditsPage = () => {
    const { brokerData, brokerDataLoading } = useApp();
    const {
        balance,
        creditPacks,
        isLoading,
        purchasePending,
        initiatePurchase,
    } = useCredits();

    const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
    const [isIOSNative, setIsIOSNative] = useState(false);

    // Check if running on native iOS platform
    useEffect(() => {
        setIsIOSNative(isNativeIOS());
    }, []);

    const handlePurchase = async () => {
        if (!selectedPackId || !brokerData) return;

        await initiatePurchase(selectedPackId, {
            name: `${brokerData.firstName} ${brokerData.lastName}`,
            email: brokerData.email,
            phone: brokerData.mobile,
        });
    };

    if (brokerDataLoading) {
        return (
            <PageShell className="max-w-5xl">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </PageShell>
        );
    }

    return (
        <>
            {/* Only load Razorpay script on non-iOS platforms */}
            {!isIOSNative && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}
            <PageShell className="max-w-5xl">
                <PageHeader
                    title="Credits"
                    description="Purchase and manage your platform credits"
                >
                    <Coins className="h-8 w-8 text-primary" />
                </PageHeader>

                <Tabs defaultValue="purchase" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="purchase" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Buy Credits
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="purchase" className="space-y-6">
                        {/* Wallet Balance */}
                        <WalletBalanceCard balance={balance} isLoading={isLoading} />

                        {/* iOS Native: Show web app info instead of purchase flow */}
                        {isIOSNative ? (
                            <WebAppInfoCard />
                        ) : (
                            <>
                                {/* Credit Packs */}
                                <div>
                                    <Typography variant="h2" className="mb-4 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Choose a Credit Pack
                                    </Typography>
                                    {isLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-48 w-full" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {creditPacks.map((pack) => (
                                                <CreditPackCard
                                                    key={pack.id}
                                                    pack={pack}
                                                    isSelected={selectedPackId === pack.id}
                                                    onSelect={() => setSelectedPackId(pack.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Purchase Button */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                {selectedPackId ? (
                                                    <div className="space-y-1">
                                                        <Typography variant="p" className="font-medium">
                                                            Selected:{" "}
                                                            {
                                                                creditPacks.find((p) => p.id === selectedPackId)
                                                                    ?.name
                                                            }
                                                        </Typography>
                                                        <p className="text-muted-foreground text-sm">
                                                            {
                                                                creditPacks.find((p) => p.id === selectedPackId)
                                                                    ?.credits
                                                            }{" "}
                                                            credits for ₹
                                                            {
                                                                creditPacks.find((p) => p.id === selectedPackId)
                                                                    ?.priceInr
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">
                                                        Select a credit pack to continue
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                size="lg"
                                                onClick={handlePurchase}
                                                disabled={!selectedPackId || purchasePending}
                                                className="w-full sm:w-auto"
                                            >
                                                {purchasePending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Purchase Credits
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            Secure payment powered by Razorpay. Your payment information is
                                            encrypted and secure.
                                        </div>
                                    </CardFooter>
                                </Card>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="history">
                        <TransactionHistory />
                    </TabsContent>
                </Tabs>
            </PageShell>
        </>
    );
};

export default CreditsPage;
