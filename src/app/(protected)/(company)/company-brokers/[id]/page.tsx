"use client";
import { useGetBrokerDetails } from "@/hooks/useCompany";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrokerPropertiesTable } from "./_components/BrokerPropertiesTable";
import { BrokerEnquiriesTable } from "./_components/BrokerEnquiriesTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const SingleBrokerPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data, error, isLoading } = useGetBrokerDetails(id as string);

  if (!id) {
    return null;
  }
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className=" animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        {error.message}
      </div>
    );
  }
  if (!data) return null;
  const { broker: brokerData } = data;

  const getInitials = (first?: string, last?: string) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarFallback className="text-xl md:text-2xl">
                {getInitials(brokerData.firstName, brokerData.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4 flex-1">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">
                    {brokerData.firstName} {brokerData.lastName}
                  </h1>
                  <Badge
                    variant={
                      brokerData.status === "approved" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {brokerData.status}
                  </Badge>
                </div>
                {brokerData.companyName && (
                  <div className="flex items-center text-muted-foreground gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{brokerData.companyName}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{brokerData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{brokerData.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {brokerData.city}, {brokerData.officeAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{brokerData.yearsOfExperience} Years Experience</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="properties">
                Properties ({data.properties.length})
              </TabsTrigger>
              <TabsTrigger value="enquiries">
                Enquiries ({data.enquiries.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              <BrokerPropertiesTable data={data.properties} />
            </TabsContent>
            <TabsContent value="enquiries">
              <BrokerEnquiriesTable data={data.enquiries} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleBrokerPage;
