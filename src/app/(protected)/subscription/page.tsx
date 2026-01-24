"use client";

import React, { useState } from "react";
import Script from "next/script";
import { useApp } from "@/context/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Crown,
  Zap,
  Rocket,
  Check,
  X,
  Calendar,
  TrendingUp,
  Building,
  FileText,
  Send,
  Loader2,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  TIER,
  SubscriptionDuration,
  SUBSCRIPTION_DURATION_LABELS,
} from "@/models/types/subscription";
import {
  PRICING,
  TIER_INFO,
  DURATION_SAVINGS,
  getRazorpayPlan,
} from "@/config/tier_limits";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// Tier icons mapping
const tierIcons: Record<TIER, React.ReactNode> = {
  STARTER: <Zap className="h-6 w-6" />,
  ESSENTIAL: <Rocket className="h-6 w-6" />,
  ELITE: <Crown className="h-6 w-6" />,
};

// Tier colors mapping
const tierColors: Record<TIER, string> = {
  STARTER: "from-gray-500 to-gray-600",
  ESSENTIAL: "from-blue-500 to-blue-600",
  ELITE: "from-amber-500 to-amber-600",
};

const tierBorderColors: Record<TIER, string> = {
  STARTER: "border-gray-200",
  ESSENTIAL: "border-blue-200",
  ELITE: "border-amber-200",
};

// const tierBadgeColors: Record<TIER, string> = {
//   STARTER: "bg-gray-100 text-gray-800",
//   ESSENTIAL: "bg-blue-100 text-blue-800",
//   ELITE: "bg-amber-100 text-amber-800",
// };

// Status badge variants
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Active
        </Badge>
      );
    case "authenticated":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Authenticated
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Cancelled
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Current Subscription Card
const CurrentSubscriptionCard = ({
  subscription,
  tier,
  isLoading,
}: {
  subscription?: {
    tier: TIER;
    status: string;
    currentPeriodStart: Date | string;
    currentPeriodEnd: Date | string;
    duration?: SubscriptionDuration;
  };
  tier?: TIER;
  isLoading: boolean;
}) => {
  const currentTier = subscription?.tier || tier || "STARTER";
  const tierInfo = TIER_INFO[currentTier];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2",
        tierBorderColors[currentTier]
      )}
    >
      {/* Gradient header */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
          tierColors[currentTier]
        )}
      />

      <CardHeader className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg bg-gradient-to-r text-white",
                tierColors[currentTier]
              )}
            >
              {tierIcons[currentTier]}
            </div>
            <div>
              <CardTitle className="text-xl">{tierInfo.name} Plan</CardTitle>
              <CardDescription>{tierInfo.description}</CardDescription>
            </div>
          </div>
          {subscription && getStatusBadge(subscription.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscription && subscription.status !== "cancelled" && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Started: {formatDate(subscription.currentPeriodStart)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Renews: {formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Building className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {PRICING[currentTier].PROPERTY_LISTING}
            </p>
            <p className="text-xs text-muted-foreground">Property Listings</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {PRICING[currentTier].ENQUIRY_LISTING}
            </p>
            <p className="text-xs text-muted-foreground">Enquiry Listings</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Send className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {PRICING[currentTier].SUBMIT_PROPERTY_ENQUIRY}
            </p>
            <p className="text-xs text-muted-foreground">Submissions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Usage Statistics Card
const UsageStatsCard = ({
  usage,
  limits,
  isLoading,
  periodStart,
  periodEnd,
}: {
  usage?: {
    property_listing: number;
    enquiry_listing: number;
    submit_property_enquiry: number;
  };
  limits?: {
    property_listing: number;
    enquiry_listing: number;
    submit_property_enquiry: number;
  };
  isLoading: boolean;
  periodStart?: Date | string;
  periodEnd?: Date | string;
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    {
      label: "Property Listings",
      icon: <Building className="h-4 w-4" />,
      used: usage?.property_listing || 0,
      limit: limits?.property_listing || 0,
    },
    {
      label: "Enquiry Listings",
      icon: <FileText className="h-4 w-4" />,
      used: usage?.enquiry_listing || 0,
      limit: limits?.enquiry_listing || 0,
    },
    {
      label: "Property Submissions",
      icon: <Send className="h-4 w-4" />,
      used: usage?.submit_property_enquiry || 0,
      limit: limits?.submit_property_enquiry || 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage This Period
          </CardTitle>
          {periodStart && periodEnd && (
            <span className="text-xs text-muted-foreground">
              {formatDate(periodStart)} - {formatDate(periodEnd)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageItems.map((item) => {
          const percentage =
            item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0;
          const isNearLimit = percentage >= 80;
          const isAtLimit = percentage >= 100;

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    "font-medium",
                    isAtLimit && "text-red-500",
                    isNearLimit && !isAtLimit && "text-yellow-600"
                  )}
                >
                  {item.used} / {item.limit}
                </span>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className={cn(
                  "h-2",
                  isAtLimit && "[&>div]:bg-red-500",
                  isNearLimit && !isAtLimit && "[&>div]:bg-yellow-500"
                )}
              />
              {isAtLimit && (
                <p className="text-xs text-red-500">
                  Limit reached. Upgrade to continue.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Plan Selection Card
const PlanCard = ({
  tier,
  isCurrentPlan,
  selectedDuration,
  onSelect,
  isSelected,
}: {
  tier: TIER;
  isCurrentPlan: boolean;
  selectedDuration: SubscriptionDuration;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  const tierInfo = TIER_INFO[tier];
  const plan = tier !== "STARTER" ? getRazorpayPlan(tier, selectedDuration) : null;
  const savingsInfo = DURATION_SAVINGS[selectedDuration];

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-primary shadow-lg",
        isCurrentPlan && "border-2 border-green-500",
        tierInfo.recommended && "border-2 border-primary"
      )}
      onClick={onSelect}
    >
      {/* Badges */}
      {tierInfo.recommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-green-500 text-white">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center pt-8">
        <div
          className={cn(
            "w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r text-white mb-2",
            tierColors[tier]
          )}
        >
          {tierIcons[tier]}
        </div>
        <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
        <CardDescription className="min-h-[40px]">
          {tierInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {/* Pricing */}
        <div>
          {tier === "STARTER" ? (
            <div className="text-4xl font-bold">Free</div>
          ) : (
            <>
              <div className="text-4xl font-bold">
                ₹{plan?.amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {SUBSCRIPTION_DURATION_LABELS[selectedDuration]}
              </div>
              {savingsInfo.savingsPercent && (
                <Badge variant="secondary" className="mt-2">
                  Save {savingsInfo.savingsPercent}%
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2 text-sm text-left">
          {tierInfo.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          disabled={isCurrentPlan && tier !== "STARTER"}
        >
          {isCurrentPlan ? (
            "Current Plan"
          ) : isSelected ? (
            <>
              Selected <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Select Plan <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Subscription Page Component
const SubscriptionPage = () => {
  const { brokerData, brokerDataLoading } = useApp();
  const {
    subscription,
    usage,
    usageLimits,
    tier,
    periodStart,
    periodEnd,
    isLoading,
    createPending,
    cancelPending,
    initiateSubscription,
    cancelSubscription,
  } = useSubscription();

  const [selectedTier, setSelectedTier] = useState<TIER | null>(null);
  const [selectedDuration, setSelectedDuration] =
    useState<SubscriptionDuration>("3_MONTHS");

  const currentTier = subscription?.tier || tier || "STARTER";

  const handleUpgrade = async () => {
    if (!selectedTier || !brokerData || selectedTier === "STARTER") return;

    await initiateSubscription(selectedTier, selectedDuration, {
      name: `${brokerData.firstName} ${brokerData.lastName}`,
      email: brokerData.email,
      phone: brokerData.mobile,
    });
  };

  const handleCancelSubscription = async () => {
    await cancelSubscription();
  };

  if (brokerDataLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            Subscription
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and usage
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Plans
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CurrentSubscriptionCard
                subscription={subscription}
                tier={tier}
                isLoading={isLoading}
              />
              <UsageStatsCard
                usage={usage}
                limits={usageLimits}
                isLoading={isLoading}
                periodStart={periodStart}
                periodEnd={periodEnd}
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {currentTier !== "ELITE" && (
                  <Button
                    onClick={() => {
                      const tab = document.querySelector(
                        '[data-state="inactive"][value="plans"]'
                      ) as HTMLButtonElement;
                      tab?.click();
                    }}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                )}
                {currentTier !== "STARTER" &&
                  subscription?.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-500">
                          <X className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel Subscription?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel your subscription?
                            You will be moved to the Starter plan and lose
                            access to premium features. Your current usage will
                            be retained.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={cancelPending}
                          >
                            {cancelPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              "Yes, Cancel"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {/* Duration Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Duration
                </CardTitle>
                <CardDescription>
                  Choose your billing cycle. Longer durations offer better
                  savings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {(
                    Object.keys(SUBSCRIPTION_DURATION_LABELS) as SubscriptionDuration[]
                  ).map((duration) => {
                    const savingsInfo = DURATION_SAVINGS[duration];
                    return (
                      <Button
                        key={duration}
                        variant={
                          selectedDuration === duration ? "default" : "outline"
                        }
                        onClick={() => setSelectedDuration(duration)}
                        className="flex-1 min-w-[120px]"
                      >
                        <div className="flex flex-col items-center">
                          <span>{savingsInfo.label}</span>
                          {savingsInfo.savingsPercent && (
                            <span className="text-xs opacity-75">
                              Save {savingsInfo.savingsPercent}%
                            </span>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["STARTER", "ESSENTIAL", "ELITE"] as TIER[]).map((planTier) => (
                <PlanCard
                  key={planTier}
                  tier={planTier}
                  isCurrentPlan={currentTier === planTier}
                  selectedDuration={selectedDuration}
                  onSelect={() => setSelectedTier(planTier)}
                  isSelected={selectedTier === planTier}
                />
              ))}
            </div>

            {/* Checkout Card */}
            {selectedTier && selectedTier !== "STARTER" && selectedTier !== currentTier && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">
                        Upgrade to {TIER_INFO[selectedTier].name}
                      </p>
                      <p className="text-muted-foreground">
                        ₹
                        {getRazorpayPlan(
                          selectedTier,
                          selectedDuration
                        )?.amount.toLocaleString()}{" "}
                        for {SUBSCRIPTION_DURATION_LABELS[selectedDuration]}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleUpgrade}
                      disabled={createPending}
                      className="w-full sm:w-auto"
                    >
                      {createPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-4 w-4" />
                          Upgrade Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Secure payment powered by Razorpay. Your payment information
                    is encrypted and secure.
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">Starter</th>
                        <th className="text-center py-3 px-4">Essential</th>
                        <th className="text-center py-3 px-4">Elite</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Property Listings</td>
                        <td className="text-center py-3 px-4">
                          {PRICING.STARTER.PROPERTY_LISTING}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ESSENTIAL.PROPERTY_LISTING}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ELITE.PROPERTY_LISTING}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Enquiry Listings</td>
                        <td className="text-center py-3 px-4">
                          {PRICING.STARTER.ENQUIRY_LISTING}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ESSENTIAL.ENQUIRY_LISTING}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ELITE.ENQUIRY_LISTING}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Property Submissions</td>
                        <td className="text-center py-3 px-4">
                          {PRICING.STARTER.SUBMIT_PROPERTY_ENQUIRY}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY}
                        </td>
                        <td className="text-center py-3 px-4">
                          {PRICING.ELITE.SUBMIT_PROPERTY_ENQUIRY}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Support</td>
                        <td className="text-center py-3 px-4">Basic</td>
                        <td className="text-center py-3 px-4">Priority</td>
                        <td className="text-center py-3 px-4">Premium</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Analytics</td>
                        <td className="text-center py-3 px-4">
                          <X className="h-4 w-4 mx-auto text-red-500" />
                        </td>
                        <td className="text-center py-3 px-4">
                          <Check className="h-4 w-4 mx-auto text-green-500" />
                        </td>
                        <td className="text-center py-3 px-4">
                          <Check className="h-4 w-4 mx-auto text-green-500" />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Team Collaboration</td>
                        <td className="text-center py-3 px-4">
                          <X className="h-4 w-4 mx-auto text-red-500" />
                        </td>
                        <td className="text-center py-3 px-4">
                          <X className="h-4 w-4 mx-auto text-red-500" />
                        </td>
                        <td className="text-center py-3 px-4">
                          <Check className="h-4 w-4 mx-auto text-green-500" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SubscriptionPage;
