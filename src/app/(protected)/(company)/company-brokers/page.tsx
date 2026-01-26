"use client";

import React, { useEffect, useState } from "react";
import { AddBrokerDialog } from "./_components/addBrokerDialog";
import { BrokersList } from "./_components/brokersList";
import {
  getCompanyBrokers,
  removeBrokerFromCompany,
} from "@/models/api/company";
import { Broker } from "@/stores/authStore";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { Loader } from "@/components/ui/loader";

const BrokersPage = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await getCompanyBrokers({});
      setBrokers(response.data);
    } catch (error) {
      logError({
        description: "Error fetching company brokers",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      // toast.error("Failed to load brokers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleRemoveBroker = async (brokerId: string) => {
    try {
      setRemovingId(brokerId);
      await removeBrokerFromCompany({ brokerId });
      setBrokers((prev) => prev.filter((b) => b._id !== brokerId));
      toast.success("Broker removed successfully");
    } catch (error) {
      logError({
        description: "Error removing broker",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to remove broker");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto py-10 px-4 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Brokers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your company&apos;s brokers
          </p>
        </div>
        <AddBrokerDialog onSuccess={fetchBrokers} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader type="disc" size={"1rem"} />
        </div>
      ) : (
        <BrokersList
          brokers={brokers}
          onRemove={handleRemoveBroker}
          loadingRemove={removingId}
        />
      )}
    </div>
  );
};

export default BrokersPage;
