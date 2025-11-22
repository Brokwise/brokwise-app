import React from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export const StatusDisplay = () => {
  const { brokerData } = useApp();

  if (!brokerData) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = () => {
    switch (brokerData.status) {
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
    switch (brokerData.status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "blacklisted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getStatusMessage = () => {
    switch (brokerData.status) {
      case "approved":
        return {
          title: "Account Approved!",
          message: `Congratulations! Your broker account has been approved. Your broker ID is ${brokerData.brokerId}.`,
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

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
          <Badge className={getStatusColor()}>
            {brokerData.status.charAt(0).toUpperCase() +
              brokerData.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{statusInfo.message}</p>

          <div className="mt-6 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Your Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Name:</strong> {brokerData.firstName}{" "}
                {brokerData.lastName}
              </div>
              <div>
                <strong>Email:</strong> {brokerData.email}
              </div>
              <div>
                <strong>Mobile:</strong> {brokerData.mobile}
              </div>
              <div>
                <strong>Company:</strong> {brokerData.companyName}
              </div>
              <div>
                <strong>City:</strong> {brokerData.city}
              </div>
              <div>
                <strong>Experience:</strong> {brokerData.yearsOfExperience}{" "}
                years
              </div>
              {brokerData.brokerId && (
                <div>
                  <strong>Broker ID:</strong> {brokerData.brokerId}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
