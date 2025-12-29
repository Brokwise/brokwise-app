import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { bookingFormSchema, BookingFormValues } from "@/validators/booking";
import { useCreateBooking } from "@/hooks/useBooking";
import { Plot } from "@/models/types/project";
import { Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plot: Plot | null;
  projectId: string;
}

export const BookingDialog = ({
  open,
  onOpenChange,
  plot,
  projectId,
}: BookingDialogProps) => {
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { brokerData } = useApp();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAlternatePhone: "",
      customerAddress: "",
      notes: "",
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      if (brokerData) {
        form.reset({
          customerName: `${brokerData.firstName} ${brokerData.lastName}`,
          customerEmail: brokerData.email,
          customerPhone: brokerData.mobile,
          customerAddress: brokerData.officeAddress || "",
          customerAlternatePhone: "",
          notes: "",
        });
      } else {
        form.reset();
      }
    }
  }, [open, form, brokerData]);

  const onSubmit = (values: BookingFormValues) => {
    if (!plot) return;

    createBooking(
      {
        plotId: plot._id,
        blockId: plot.blockId,
        projectId,
        customerDetails: {
          name: values.customerName,
          email: values.customerEmail,
          phone: values.customerPhone,
          alternatePhone: values.customerAlternatePhone,
          address: values.customerAddress,
        },
        notes: values.notes,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  if (!plot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Plot {plot.plotNumber}</DialogTitle>
          <DialogDescription>
            Enter customer details to book this plot.
            <div className="mt-2 text-sm font-medium text-foreground">
              Plot Area: {plot.area} {plot.areaUnit} • Price: ₹{plot.price}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        readOnly
                        className="bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        autoComplete="email"
                        readOnly
                        className="bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 9876543210"
                        autoComplete="tel"
                        readOnly
                        className="bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerAlternatePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 9876543210"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full address"
                      autoComplete="street-address"
                      readOnly
                      className="bg-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
