import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Ban,
  Building2,
  Mail,
  Phone,
  FileText,
  MapPin,
  Users,
  LogOut,
  Edit2,
  User,
  Briefcase,
  Hash,
  LucideProps,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { Broker } from "@/stores/authStore";
import { Company } from "@/models/types/company";
import { Separator } from "@/components/ui/separator";

interface StatusDisplayProps {
  onEdit?: () => void;
  data?: Broker | Company;
  type?: "broker" | "company";
}

export const StatusDisplay = ({ onEdit, data, type }: StatusDisplayProps) => {
  const { brokerData, companyData } = useApp();
  const [signOut] = useSignOut(firebaseAuth);

  const activeData = data || brokerData || companyData;
  const activeType =
    type ||
    (activeData
      ? "firstName" in activeData
        ? "broker"
        : "company"
      : undefined);

  if (!activeData || !activeType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (activeData.status) {
      case "approved":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
          borderColor: "border-emerald-200 dark:border-emerald-500/20",
          badgeClass:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
          title: "Account Approved",
          description: "Your account is active and verified",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-500/10",
          borderColor: "border-amber-200 dark:border-amber-500/20",
          badgeClass:
            "bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-500/10 text-md px-6 py-2 shadow-sm border border-amber-200 dark:border-amber-500/20",
          title: "Profile Under Review",
          description: "We are currently reviewing your profile details. You'll be notified once the verification is complete.",
        };
      case "blacklisted":
        return {
          icon: Ban,
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-500/10",
          borderColor: "border-red-200 dark:border-red-500/20",
          badgeClass:
            "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20",
          title: "Account Suspended",
          description: "Please contact support for assistance",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-500",
          bgColor: "bg-slate-50 dark:bg-slate-500/10",
          borderColor: "border-slate-200 dark:border-slate-500/20",
          badgeClass:
            "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500/20",
          title: "Processing",
          description: "Status update in progress",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isCompany = activeType === "company";
  const broker = activeData as Broker;
  const company = activeData as Company;

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    label: string;
    value?: string | number;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="p-2 rounded-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium  break-all">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/50">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Card className="w-full max-w-2xl overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        <div className={`h-3 w-full bg-gradient-to-r from-transparent via-${statusConfig.color.split("-")[1]}-500/20 to-transparent`} />

        {/* Decorative background gradient */}
        <div className={cn("absolute inset-0 opacity-[0.03] pointer-events-none", statusConfig.bgColor)} />

        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto mb-6 relative">
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-xl opacity-50",
                statusConfig.bgColor
              )}
            />
            <div
              className={cn(
                "relative flex items-center justify-center w-24 h-24 rounded-full border-[6px] bg-white dark:bg-slate-900 shadow-lg mx-auto transform transition-all duration-500 hover:scale-105",
                statusConfig.borderColor,
                statusConfig.color,
                activeData.status === "pending" && "animate-pulse"
              )}
              style={{ animationDuration: activeData.status === "pending" ? "3s" : undefined }}
            >
              <statusConfig.icon className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={cn(
                "px-4 py-1.5 text-sm font-medium",
                statusConfig.badgeClass
              )}
            >
              {statusConfig.title}
            </Badge>
            <CardTitle className="text-3xl font-normal mt-4 ">
              {isCompany
                ? company.name
                : `${broker.firstName} ${broker.lastName}`}
            </CardTitle>
            <CardDescription className="text-base  max-w-md mx-auto">
              {statusConfig.description}
            </CardDescription>
          </div>
        </CardHeader>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isCompany ? (
              <>
                <DetailItem
                  icon={Building2}
                  label="Company Name"
                  value={company.name}
                />
                <DetailItem
                  icon={FileText}
                  label="GSTIN"
                  value={company.gstin}
                />
                <DetailItem
                  icon={Mail}
                  label="Email Address"
                  value={company.email}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone Number"
                  value={company.mobile}
                />
                <DetailItem
                  icon={MapPin}
                  label="Headquarters"
                  value={company.city}
                />
                <DetailItem
                  icon={Users}
                  label="Team Size"
                  value={company.noOfEmployees}
                />
              </>
            ) : (
              <>
                <DetailItem
                  icon={User}
                  label="Full Name"
                  value={`${broker.firstName} ${broker.lastName}`}
                />
                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={broker.companyName}
                />
                <DetailItem
                  icon={Mail}
                  label="Email Address"
                  value={broker.email}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone Number"
                  value={broker.mobile}
                />
                <DetailItem
                  icon={MapPin}
                  label="Location"
                  value={broker.city}
                />
                <DetailItem
                  icon={Briefcase}
                  label="Experience"
                  value={`${broker.yearsOfExperience === 15
                    ? "15+"
                    : broker.yearsOfExperience
                    } Years`}
                />
                {broker.brokerId && (
                  <DetailItem
                    icon={Hash}
                    label="Broker ID"
                    value={broker.brokerId}
                  />
                )}
              </>
            )}
          </div>

          {activeData.status === "pending" && onEdit && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={onEdit}
                variant="outline"
                className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
