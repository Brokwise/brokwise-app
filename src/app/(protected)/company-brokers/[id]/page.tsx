"use client";
import { useGetBrokerDetails } from "@/hooks/useCompany";
import { Loader2, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrokerPropertiesTable } from "./_components/BrokerPropertiesTable";
import { BrokerEnquiriesTable } from "./_components/BrokerEnquiriesTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SingleBrokerPage = () => {
  const { id } = useParams();
  const router = useRouter();
  if (!id) {
    return null;
  }
  const { data, error, isLoading } = useGetBrokerDetails(id as string);
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className=" animate-spin" />
      </div>
    );
  }
  console.log(data);
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        {error.message}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
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
