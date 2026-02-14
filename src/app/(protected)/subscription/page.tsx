"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useApp } from "@/context/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
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
  ExternalLink,
  Smartphone,
  CreditCard,
  Star,
} from "lucide-react";
import {
  TIER,
  RegularDuration,
  REGULAR_DURATION_LABELS,
} from "@/models/types/subscription";
import {
  TIER_INFO,
  ACTIVATION_TIER_INFO,
  ACTIVATION_PLANS,
  DURATION_SAVINGS,
  getRazorpayPlan,
  ACTIVATION_LIMITS,
  REGULAR_LIMITS,
  REGULAR_CREDITS,
} from "@/config/tier_limits";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { isNativeIOS } from "@/utils/helper";
import { Typography } from "@/components/ui/typography";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// Web App Information Component for iOS (Apple Compliant)
const WebAppInfoCard = () => {
  const { t } = useTranslation();
  const WEB_APP_URL = "https://app.brokwise.com";

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          {t("page_subscription_additional_features") || "Additional Features"}
        </CardTitle>
        <CardDescription>
          {t("page_subscription_more_options") || "More options are available on our web platform"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Typography variant="p" className="text-muted-foreground">
          {t("page_subscription_web_info") || "For account management and additional features, visit our web application."}{" "}
          {t("page_subscription_sync_info") || "Your account is synced across all platforms."}
        </Typography>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => window.open(WEB_APP_URL, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("page_subscription_visit_website") || "Visit Website"}
        </Button>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("page_subscription_sync_message") || "Your account is synced across all platforms"}
        </div>
      </CardFooter>
    </Card>
  );
};

// Tier icons mapping
const tierIcons: Record<TIER, React.ReactNode> = {
  BASIC: <Zap className="h-6 w-6" />,
  ESSENTIAL: <Rocket className="h-6 w-6" />,
  PRO: <Crown className="h-6 w-6" />,
};

// Tier colors mapping
const tierColors: Record<TIER, string> = {
  BASIC: "from-gray-500 to-gray-600",
  ESSENTIAL: "from-blue-500 to-blue-600",
  PRO: "from-amber-500 to-amber-600",
};

const tierBorderColors: Record<TIER, string> = {
  BASIC: "border-gray-200",
  ESSENTIAL: "border-blue-200",
  PRO: "border-amber-200",
};


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

const getPhaseBadge = (phase: string | null) => {
  if (phase === "activation") {
    return (
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
        <Star className="h-3 w-3 mr-1" />
        Activation
      </Badge>
    );
  }
  if (phase === "regular") {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        Regular
      </Badge>
    );
  }
  return null;
};

// Current Subscription Card
const CurrentSubscriptionCard = ({
  subscription,
  tier,
  isLoading,
  limits,
}: {
  subscription?: {
    tier: TIER;
    status: string;
    phase?: string;
    currentPeriodStart: Date | string;
    currentPeriodEnd: Date | string;
    duration?: string;
    activationCompletedAt?: Date | string;
  };
  tier?: TIER;
  isLoading: boolean;
  limits?: {
    PROPERTY_LISTING: number;
    ENQUIRY_LISTING: number;
    SUBMIT_PROPERTY_ENQUIRY: number;
  };
}) => {
  const { t } = useTranslation();
  const currentTier = subscription?.tier || tier || "BASIC";


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
              <CardTitle className="text-xl">{t(`page_subscription_tier_${currentTier.toLowerCase()}_name`)} {t("page_subscription_plan")}</CardTitle>
              <CardDescription>{t(`page_subscription_tier_${currentTier.toLowerCase()}_desc`)}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {subscription && getStatusBadge(subscription.status)}
            {subscription && getPhaseBadge(subscription.phase || null)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscription && subscription.status !== "cancelled" && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {t("page_subscription_started")}: {formatDate(subscription.currentPeriodStart)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{t("page_subscription_renews")}: {formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          </div>
        )}

        {/* Activation phase notice */}
        {subscription?.phase === "activation" && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
            <p className="text-purple-700 dark:text-purple-300">
              <Star className="h-4 w-4 inline mr-1" />
              {t("page_subscription_activation_notice", 'You are on the activation plan. After this period ends, choose a regular plan to continue.')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Building className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {limits?.PROPERTY_LISTING ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">{t("page_subscription_feature_property_listing")}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {limits?.ENQUIRY_LISTING ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">{t("page_subscription_feature_enquiry_listing")}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Send className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {limits?.SUBMIT_PROPERTY_ENQUIRY ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">{t("page_subscription_feature_property_submission")}</p>
          </div>
        </div>
      </CardContent>
    </Card >
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
  const { t } = useTranslation();
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
      label: t("page_subscription_feature_property_listing"),
      icon: <Building className="h-4 w-4" />,
      used: usage?.property_listing || 0,
      limit: limits?.property_listing || 0,
    },
    {
      label: t("page_subscription_feature_enquiry_listing"),
      icon: <FileText className="h-4 w-4" />,
      used: usage?.enquiry_listing || 0,
      limit: limits?.enquiry_listing || 0,
    },
    {
      label: t("page_subscription_feature_property_submission"),
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
            {t("page_subscription_usage_period")}
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
                  {t("page_subscription_limit_reached")}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ─── Activation Plan Card (for users who need to activate) ───────────────────
const ActivationPlanCard = ({
  tier,
  onSelect,
  isSelected,
}: {
  tier: TIER;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  const info = ACTIVATION_TIER_INFO[tier];
  const plan = ACTIVATION_PLANS[tier];

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-primary shadow-lg",
        info.recommended && "border-2 border-primary"
      )}
      onClick={onSelect}
    >
      {info.recommended && !isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Popular
          </Badge>
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
        <CardTitle className="text-xl">{info.name}</CardTitle>
        <CardDescription className="min-h-[40px]">
          {info.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div>
          <div className="text-4xl font-bold">₹{plan.amount}</div>
          <div className="text-sm text-muted-foreground">1 Month Activation</div>
        </div>

        <ul className="space-y-2 text-sm text-left">
          {info.features.map((feature, index) => (
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
        >
          {isSelected ? (
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

// ─── Regular Plan Card (for users who completed activation) ──────────────────
const RegularPlanCard = ({
  tier,
  isCurrentPlan,
  selectedDuration,
  onSelect,
  isSelected,
}: {
  tier: TIER;
  isCurrentPlan: boolean;
  selectedDuration: RegularDuration;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  const tierInfo = TIER_INFO[tier];
  const plan = getRazorpayPlan(tier, selectedDuration);
  const credits = REGULAR_CREDITS[tier]?.[selectedDuration] || 0;
  const savingsInfo = DURATION_SAVINGS[selectedDuration] || { savingsPercent: 0 };

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
        <div>
          <div className="text-4xl font-bold">
            ₹{plan?.amount.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {REGULAR_DURATION_LABELS[selectedDuration]}
          </div>
          {savingsInfo.savingsPercent && (
            <Badge variant="secondary" className="mt-2">
              Save {savingsInfo.savingsPercent}%
            </Badge>
          )}
          {credits > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3 inline mr-1" />
              {credits} Credits included
            </div>
          )}
        </div>

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
          disabled={isCurrentPlan}
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

// ─── Feature Comparison Table ────────────────────────────────────────────────
const FeatureComparisonTable = ({
  phase,
}: {
  phase: "activation" | "regular";
}) => {
  const { t } = useTranslation();
  const limits = phase === "activation" ? ACTIVATION_LIMITS : REGULAR_LIMITS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("page_subscription_feature_comparison")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">{t("page_subscription_feature_col")}</th>
                <th className="text-center py-3 px-4">Basic</th>
                <th className="text-center py-3 px-4">Essential</th>
                <th className="text-center py-3 px-4">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">{t("page_subscription_feature_property_listing")}</td>
                <td className="text-center py-3 px-4">{limits.BASIC.PROPERTY_LISTING}</td>
                <td className="text-center py-3 px-4">{limits.ESSENTIAL.PROPERTY_LISTING}</td>
                <td className="text-center py-3 px-4">{limits.PRO.PROPERTY_LISTING}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">{t("page_subscription_feature_enquiry_listing")}</td>
                <td className="text-center py-3 px-4">{limits.BASIC.ENQUIRY_LISTING}</td>
                <td className="text-center py-3 px-4">{limits.ESSENTIAL.ENQUIRY_LISTING}</td>
                <td className="text-center py-3 px-4">{limits.PRO.ENQUIRY_LISTING}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">{t("page_subscription_feature_property_submission")}</td>
                <td className="text-center py-3 px-4">{limits.BASIC.SUBMIT_PROPERTY_ENQUIRY}</td>
                <td className="text-center py-3 px-4">{limits.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY}</td>
                <td className="text-center py-3 px-4">{limits.PRO.SUBMIT_PROPERTY_ENQUIRY}</td>
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
  );
};

// ─── Main Subscription Page Component ────────────────────────────────────────
const SubscriptionPage = () => {
  const { brokerData, brokerDataLoading } = useApp();
  const {
    subscription,
    usage,
    usageLimits,
    tier,
    limits,
    periodStart,
    periodEnd,
    isLoading,
    createPending,
    cancelPending,
    activationPending,
    verifyPending,
    currentPhase,
    hasCompletedActivation,
    needsActivation,
    initiateActivation,
    initiateSubscription,
    cancelSubscription,
  } = useSubscription();

  const [selectedTier, setSelectedTier] = useState<TIER | null>(null);
  const [selectedDuration, setSelectedDuration] =
    useState<RegularDuration>("3_MONTHS");
  const [isIOSNative, setIsIOSNative] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { t } = useTranslation();

  // Check if running on native iOS platform
  useEffect(() => {
    setIsIOSNative(isNativeIOS());
  }, []);

  const currentTier = subscription?.tier || tier || "BASIC";
  const WEB_APP_URL = "https://app.brokwise.com";

  // Whether the broker has any usable subscription right now
  const hasActiveSubscription =
    !!subscription &&
    (subscription.status === "active" ||
      subscription.status === "authenticated" ||
      subscription.status === "created");

  // Determine if the user should see activation plans or regular plans
  const showActivationPlans = needsActivation;
  const showRegularPlans = hasCompletedActivation || currentPhase === "regular";
  // If user is in activation phase and it hasn't expired, show regular plans for "after activation"
  const isInActivation = currentPhase === "activation" && subscription?.status === "active";

  // Auto-switch to plans tab when broker has no active subscription
  useEffect(() => {
    if (!isLoading && !hasActiveSubscription) {
      setActiveTab("plans");
    }
  }, [isLoading, hasActiveSubscription]);

  const handleActivationPurchase = async () => {
    if (!selectedTier || !brokerData) return;

    await initiateActivation(selectedTier, {
      name: `${brokerData.firstName} ${brokerData.lastName}`,
      email: brokerData.email,
      phone: brokerData.mobile,
    });
  };

  const handleUpgrade = async () => {
    if (!selectedTier || !brokerData) return;

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
      <PageShell className="max-w-6xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  return (
    <>
      {/* Only load Razorpay script on non-iOS platforms */}
      {!isIOSNative && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}
      <PageShell className="max-w-6xl">
        <PageHeader
          title={t("page_subscription_title")}
          description={t("page_subscription_subtitle")}
        >
          <Crown className="h-8 w-8 text-primary" />
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("page_subscription_tab_overview")}
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              {t("page_subscription_tab_plans")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Activation Required Banner */}
            {(showActivationPlans && !hasActiveSubscription) && (
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                      <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-lg">
                        {t("page_subscription_activate_title", "Activate Your Account")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("page_subscription_activate_desc", "Purchase an activation pack to start using the platform")}
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("plans")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("page_subscription_get_started", "Get Started")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CurrentSubscriptionCard
                subscription={subscription}
                tier={tier}
                isLoading={isLoading}
                limits={limits}
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
                <CardTitle className="text-lg">{t("page_subscription_quick_actions")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {isIOSNative ? (
                  <Button
                    variant="outline"
                    onClick={() => window.open(WEB_APP_URL, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("page_subscription_visit_website", "Visit Website")}
                  </Button>
                ) : (
                  <>
                    {/* Show upgrade/plans button */}
                    <Button onClick={() => setActiveTab("plans")}>
                      <Rocket className="mr-2 h-4 w-4" />
                      {showActivationPlans
                        ? (t("page_subscription_activate_now", "Activate Now"))
                        : t("page_subscription_upgrade_plan", "Upgrade Plan")}
                    </Button>

                    {/* Cancel button for active regular subscriptions */}
                    {currentPhase === "regular" &&
                      subscription?.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-red-500">
                              <X className="mr-2 h-4 w-4" />
                              {t("page_subscription_cancel_sub_btn", "Cancel Subscription")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("page_subscription_cancel_title", "Cancel Subscription")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("page_subscription_cancel_desc", "Are you sure you want to cancel your subscription?")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("page_subscription_keep_sub", "Keep Subscription")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancelSubscription}
                                className="bg-red-500 hover:bg-red-600"
                                disabled={cancelPending}
                              >
                                {cancelPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("page_subscription_cancelling", "Cancelling...")}
                                  </>
                                ) : (
                                  t("page_subscription_yes_cancel", "Yes, Cancel")
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {/* iOS Native: Show web app info instead of purchase flow */}
            {isIOSNative ? (
              <>
                <WebAppInfoCard />
                <FeatureComparisonTable phase={showActivationPlans ? "activation" : "regular"} />
              </>
            ) : (
              <>
                {/* ─── Activation Plans (for new users) ──────────────── */}
                {(showActivationPlans && !isInActivation) && (
                  <>
                    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="h-5 w-5 text-purple-600" />
                          {t("page_subscription_activation_packs", "Activation Packs")}
                        </CardTitle>
                        <CardDescription>
                          {t("page_subscription_activation_desc", "Start with a 1-month activation pack to explore the platform with reduced limits")}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(["BASIC", "ESSENTIAL", "PRO"] as TIER[]).map((planTier) => (
                        <ActivationPlanCard
                          key={planTier}
                          tier={planTier}
                          onSelect={() => setSelectedTier(planTier)}
                          isSelected={selectedTier === planTier}
                        />
                      ))}
                    </div>

                    {/* Activation Checkout */}
                    {selectedTier && (
                      <Card className="border-primary">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-semibold text-lg">
                                {ACTIVATION_TIER_INFO[selectedTier].name} {t("page_subscription_activation_pack", "Activation Pack")}
                              </p>
                              <p className="text-muted-foreground">
                                ₹{ACTIVATION_PLANS[selectedTier].amount} {t("page_subscription_1_month_access", "for 1 month")}
                              </p>
                            </div>
                            <Button
                              size="lg"
                              onClick={handleActivationPurchase}
                              disabled={activationPending || verifyPending}
                              className="w-full sm:w-auto"
                            >
                              {(activationPending || verifyPending) ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t("page_subscription_processing", "Processing...")}
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  {t("page_subscription_activate_now", "Activate Now")}
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t("page_subscription_secure_payment", "Secure Payment")}
                          </div>
                        </CardFooter>
                      </Card>
                    )}

                    <FeatureComparisonTable phase="activation" />
                  </>
                )}

                {/* ─── Regular Plans (after activation or for upgrade) ── */}
                {(showRegularPlans || isInActivation) && (
                  <>
                    {isInActivation && (
                      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-blue-600" />
                            {t("page_subscription_regular_plans", "Regular Plans")}
                          </CardTitle>
                          <CardDescription>
                            {t("page_subscription_regular_desc", "After your activation period ends, choose a regular plan to continue with higher limits")}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}

                    {/* Duration Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {t("page_subscription_select_duration", "Select Duration")}
                        </CardTitle>
                        <CardDescription>
                          {t("page_subscription_duration_desc", "Choose your billing cycle. Longer durations offer better savings.")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4">
                          {(
                            Object.keys(REGULAR_DURATION_LABELS) as RegularDuration[]
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
                                  <span>{REGULAR_DURATION_LABELS[duration]}</span>
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

                    {/* Regular Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(["BASIC", "ESSENTIAL", "PRO"] as TIER[]).map((planTier) => (
                        <RegularPlanCard
                          key={planTier}
                          tier={planTier}
                          isCurrentPlan={
                            currentPhase === "regular" && currentTier === planTier
                          }
                          selectedDuration={selectedDuration}
                          onSelect={() => setSelectedTier(planTier)}
                          isSelected={selectedTier === planTier}
                        />
                      ))}
                    </div>

                    {/* Regular Checkout Card */}
                    {selectedTier &&
                      !(currentPhase === "regular" && currentTier === selectedTier) && (
                        <Card className="border-primary">
                          <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-lg">
                                  {t("page_subscription_upgrade_to", { plan: TIER_INFO[selectedTier].name })}
                                </p>
                                <p className="text-muted-foreground">
                                  ₹{getRazorpayPlan(selectedTier, selectedDuration)?.amount.toLocaleString()}{" "}
                                  for {REGULAR_DURATION_LABELS[selectedDuration]}
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
                                    {t("page_subscription_processing")}
                                  </>
                                ) : (
                                  <>
                                    <Rocket className="mr-2 h-4 w-4" />
                                    {isInActivation
                                      ? (t("page_subscription_subscribe_now", "Subscribe Now"))
                                      : t("page_subscription_upgrade_now")}
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                          <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              {t("page_subscription_secure_payment", "Secure Payment")}
                            </div>
                          </CardFooter>
                        </Card>
                      )}

                    <FeatureComparisonTable phase="regular" />
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
};

export default SubscriptionPage;
