import React from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { Broker } from "@/stores/authStore";
import { Company } from "@/models/types/company";

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
    return <div>Loading...</div>;
  }

  const getStatusIcon = () => {
    switch (activeData.status) {
      case "approved":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "blacklisted":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (activeData.status) {
      case "approved":
        return "border border-green-100 text-green-800 dark:border-green-900 dark:text-green-100 bg-transparent";
      case "pending":
        return "border border-yellow-100 text-yellow-800 dark:border-yellow-500 dark:text-yellow-100 bg-transparent";
      case "blacklisted":
        return "border border-red-100 text-red-800 dark:border-red-900 dark:text-red-100 bg-transparent";
      default:
        return "border border-gray-100 text-gray-800 dark:border-gray-900 dark:text-gray-100 bg-transparent";
    }
  };

  const getStatusMessage = () => {
    const isCompany = activeType === "company";
    switch (activeData.status) {
      case "approved":
        return {
          title: "Account Approved!",
          message: `Congratulations! Your ${
            isCompany ? "company" : "broker"
          } account has been approved.${
            !isCompany && "brokerId" in activeData
              ? ` Your broker ID is ${activeData.brokerId}.`
              : ""
          }`,
        };
      case "pending":
        return {
          title: "Account Under Review",
          message:
            "Your profile details have been submitted and are currently under review. We'll notify you once the review is complete.",
        };
      case "blacklisted":
        return {
          title: "Account Suspended",
          message:
            "Your account has been suspended. Please contact support for more information.",
        };
      default:
        return {
          title: "Account Status",
          message: "Your account status is being processed.",
        };
    }
  };

  const statusInfo = getStatusMessage();
  const isCompany = activeType === "company";
  const broker = activeData as Broker;
  const company = activeData as Company;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Button
        variant={"link"}
        onClick={() => signOut()}
        className="absolute top-4 right-4"
      >
        Logout
      </Button>
      <Card className="w-full max-w-2xl relative overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 h-96 w-96 blur-3xl bg-primary/80 rounded-full"></div>
        <CardHeader className="text-center relative">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
          <Badge className={cn(getStatusColor(), "w-fit mx-auto")}>
            {activeData.status.charAt(0).toUpperCase() +
              activeData.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4 relative">
          <p className="dark:text-gray-400 text-gray-600">
            {statusInfo.message}
          </p>

          <div className="mt-6 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Your Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {isCompany ? (
                <>
                  <div>
                    <strong>Company Name:</strong> {company.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {company.email}
                  </div>
                  <div>
                    <strong>Mobile:</strong> {company.mobile}
                  </div>
                  <div>
                    <strong>GSTIN:</strong> {company.gstin}
                  </div>
                  <div>
                    <strong>City:</strong> {company.city}
                  </div>
                  <div>
                    <strong>Employees:</strong> {company.noOfEmployees}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>Name:</strong> {broker.firstName} {broker.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> {broker.email}
                  </div>
                  <div>
                    <strong>Mobile:</strong> {broker.mobile}
                  </div>
                  <div>
                    <strong>Company:</strong> {broker.companyName}
                  </div>
                  <div>
                    <strong>City:</strong> {broker.city}
                  </div>
                  <div>
                    <strong>Experience:</strong> {broker.yearsOfExperience}{" "}
                    years
                  </div>
                  {broker.brokerId && (
                    <div>
                      <strong>Broker ID:</strong> {broker.brokerId}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {activeData.status === "pending" && onEdit && (
            <Button onClick={onEdit} className="w-full mt-4">
              Edit Details
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
