"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { OnboardingDetails } from "@/app/(protected)/_components/onboarding/onboardingDetails";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Building2,
  Briefcase,
  MapPin,
  FileText,
  Award,
  Users,
  Mail,
} from "lucide-react";

const ProfilePage = () => {
  const { brokerData, brokerDataLoading } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const companyDetails =
    brokerData &&
    brokerData.companyId &&
    typeof brokerData.companyId === "object"
      ? brokerData.companyId
      : null;

  if (brokerDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!brokerData) {
    return (
      <div className="flex items-center justify-center h-full">
        Profile not found
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <OnboardingDetails
          isEditing={true}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {brokerData.firstName[0]}
            {brokerData.lastName[0]}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {brokerData.firstName} {brokerData.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{brokerData.email}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  brokerData.status === "approved" ? "default" : "secondary"
                }
              >
                {brokerData.status.toUpperCase()}
              </Badge>
              {brokerData.brokerId && (
                <Badge variant="outline">ID: {brokerData.brokerId}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact
              </h3>
              <p className="text-lg font-medium">{brokerData.mobile}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Experience
              </h3>
              <p className="text-lg font-medium">
                {brokerData.yearsOfExperience === 15
                  ? "15+"
                  : brokerData.yearsOfExperience}{" "}
                Years
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h3>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{brokerData.city}</p>
                {brokerData.officeAddress && (
                  <p className="text-sm text-muted-foreground">
                    {brokerData.officeAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" /> RERA Number
              </h3>
              <p className="text-lg font-medium">
                {brokerData.reraNumber || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {companyDetails ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{companyDetails.name}</CardTitle>
                <CardDescription>Company Details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </h3>
                <p className="text-lg font-medium">{companyDetails.email}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Mobile
                </h3>
                <p className="text-lg font-medium">{companyDetails.mobile}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">{companyDetails.city}</p>
                  {companyDetails.officeAddress && (
                    <p className="text-sm text-muted-foreground">
                      {companyDetails.officeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> GSTIN
                </h3>
                <p className="text-lg font-medium">
                  {companyDetails.gstin || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Employees
                </h3>
                <p className="text-lg font-medium">
                  {companyDetails.noOfEmployees || 0}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> Status
                </h3>
                <Badge
                  variant={
                    companyDetails.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {companyDetails.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {brokerData.companyName || "Company Details"}
                </CardTitle>
                <CardDescription>
                  Associated Company Information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> GSTIN
                </h3>
                <p className="text-lg font-medium">
                  {brokerData.gstin || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
