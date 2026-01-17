"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addBrokerSchema } from "@/validators/company";
import { z } from "zod";
import { addBroker } from "@/models/api/company";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { logError } from "@/utils/errors";

export const AddBrokerDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof addBrokerSchema>>({
    resolver: zodResolver(addBrokerSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof addBrokerSchema>) => {
    try {
      setLoading(true);
      const rawIdentifier = data.identifier.trim();
      const looksLikeEmail = z
        .string()
        .email()
        .safeParse(rawIdentifier).success;
      const digitsOnly = rawIdentifier.replace(/\D/g, "");
      await addBroker({
        email: looksLikeEmail ? rawIdentifier : undefined,
        phone: looksLikeEmail ? undefined : digitsOnly,
      });
      toast.success("Broker added successfully!");
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      logError({
        description: "Error adding broker",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to add broker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Broker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Broker</DialogTitle>
          <DialogDescription>
            Invite a new broker by email or phone number.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="broker@example.com or +91 98765 43210"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Broker"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
