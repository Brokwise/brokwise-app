"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { Property } from "@/types/property";
import { Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export const ContactSeller = ({ property }: { property: Property }) => {
  const { brokerData, companyData } = useApp();
  const [open, setOpen] = useState(false);

  const handleContact = () => {
    let myCompanyId = companyData?._id;
    if (brokerData?.companyId) {
      myCompanyId =
        typeof brokerData.companyId === "string"
          ? brokerData.companyId
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (brokerData.companyId as any)._id;
    }

    const propertyCompanyId = property.companyId;

    if (myCompanyId && propertyCompanyId && myCompanyId === propertyCompanyId) {
      toast.error("You can't submit it because it's your company");
      return;
    }

    setOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Seller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={handleContact}>
          Contact Seller
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Information</DialogTitle>
              <DialogDescription>
                Get in touch with the seller for this property.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">+91 XXXXXXXXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">seller@example.com</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Actual contact details would be fetched from the API.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
