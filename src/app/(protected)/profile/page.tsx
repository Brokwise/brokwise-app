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
  Lock,
  Key,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import {
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxios from "@/hooks/useAxios";

const ProfilePage = () => {
  const {
    brokerData,
    brokerDataLoading,
    setBrokerData,
    setCompanyData,
    companyData,
    companyDataLoading,
  } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const api = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeavingCompany, setIsLeavingCompany] = useState(false);

  const brokerCompanyDetails =
    brokerData &&
    brokerData.companyId &&
    typeof brokerData.companyId === "object"
      ? brokerData.companyId
      : null;

  const hasPassword = user?.providerData.some(
    (p) => p.providerId === "password"
  );

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(firebaseAuth, user.email);
      toast.success("Password reset email sent to " + user.email);
    } catch (error) {
      console.error(error);
      toast.error(
        (error as { message: string }).message || "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email, newPassword);
      await linkWithCredential(user, credential);
      toast.success("Password set successfully");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if ((error as { code: string }).code === "auth/requires-recent-login") {
        toast.error("Please log out and log in again to set a password");
      } else {
        toast.error(
          (error as { message: string }).message || "Failed to set password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCompany = async () => {
    try {
      setIsLeavingCompany(true);
      const response = await api.post("/broker/leave-company");
      const result = response?.data?.data as {
        message?: string;
        broker?: typeof brokerData;
      };
      if (result?.broker) {
        setBrokerData(result.broker);
      } else if (brokerData) {
        setBrokerData({
          ...brokerData,
          companyId: undefined,
          companyName: "",
          gstin: "",
        });
      }
      setCompanyData(null);
      toast.success(result?.message || "You have left the company.");
      setIsLeaveDialogOpen(false);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as { message?: string }).message ||
        "Failed to leave the company.";
      toast.error(message);
    } finally {
      setIsLeavingCompany(false);
    }
  };

  if (brokerDataLoading || companyDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!brokerData && !companyData) {
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

  if (companyData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Company Profile</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {companyData.name?.[0]}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{companyData.name}</CardTitle>
              <p className="text-muted-foreground">{companyData.email}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    companyData.status === "approved" ? "default" : "secondary"
                  }
                >
                  {companyData.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </h3>
                <p className="text-lg font-medium">{companyData.email}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Mobile
                </h3>
                <p className="text-lg font-medium">{companyData.mobile}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">{companyData.city}</p>
                  {companyData.officeAddress && (
                    <p className="text-sm text-muted-foreground">
                      {companyData.officeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> GSTIN
                </h3>
                <p className="text-lg font-medium">
                  {companyData.gstin || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Employees
                </h3>
                <p className="text-lg font-medium">
                  {companyData.noOfEmployees || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brokerProfile = brokerData;
  if (!brokerProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        Profile not found
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
            {brokerProfile.firstName[0]}
            {brokerProfile.lastName[0]}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {brokerProfile.firstName} {brokerProfile.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{brokerProfile.email}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  brokerProfile.status === "approved" ? "default" : "secondary"
                }
              >
                {brokerProfile.status.toUpperCase()}
              </Badge>
              {brokerProfile.brokerId && (
                <Badge variant="outline">ID: {brokerProfile.brokerId}</Badge>
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
              <p className="text-lg font-medium">{brokerProfile.mobile}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Experience
              </h3>
              <p className="text-lg font-medium">
                {brokerProfile.yearsOfExperience === 15
                  ? "15+"
                  : brokerProfile.yearsOfExperience}{" "}
                Years
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h3>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{brokerProfile.city}</p>
                {brokerProfile.officeAddress && (
                  <p className="text-sm text-muted-foreground">
                    {brokerProfile.officeAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" /> RERA Number
              </h3>
              <p className="text-lg font-medium">
                {brokerProfile.reraNumber || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">Security</CardTitle>
            <CardDescription>
              Manage your password and account security
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4" /> Password
              </h3>
              <p className="text-sm">
                {hasPassword
                  ? "You have a password set for your account."
                  : "You currently sign in with Google. Set a password to sign in with email."}
              </p>
            </div>
            {hasPassword ? (
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Reset Password
              </Button>
            ) : (
              <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Set Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Password</DialogTitle>
                    <DialogDescription>
                      Create a password to sign in with your email address.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPassword} disabled={loading}>
                      {loading ? "Setting Password..." : "Set Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {brokerCompanyDetails ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {brokerCompanyDetails.name}
                  </CardTitle>
                  <CardDescription>Company Details</CardDescription>
                </div>
              </div>
              <Dialog
                open={isLeaveDialogOpen}
                onOpenChange={setIsLeaveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={isLeavingCompany}>
                    Leave Company
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave company</DialogTitle>
                    <DialogDescription>
                      You will no longer be associated with{" "}
                      {brokerCompanyDetails.name}. You can request to join again
                      later.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsLeaveDialogOpen(false)}
                      disabled={isLeavingCompany}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLeaveCompany}
                      disabled={isLeavingCompany}
                    >
                      {isLeavingCompany ? "Leaving..." : "Leave Company"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.email}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Mobile
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.mobile}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">
                    {brokerCompanyDetails.city}
                  </p>
                  {brokerCompanyDetails.officeAddress && (
                    <p className="text-sm text-muted-foreground">
                      {brokerCompanyDetails.officeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> GSTIN
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.gstin || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Employees
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.noOfEmployees || 0}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> Status
                </h3>
                <Badge
                  variant={
                    brokerCompanyDetails.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {brokerCompanyDetails.status.toUpperCase()}
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
                  {brokerProfile.companyName || "Company Details"}
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
                  {brokerProfile.gstin || "N/A"}
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
