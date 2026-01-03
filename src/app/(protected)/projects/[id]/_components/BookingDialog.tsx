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
import { useCreateBookingOrder, useHoldPlot } from "@/hooks/useBooking";
import { Plot } from "@/models/types/project";
import { Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Script from "next/script";
import { toast } from "sonner";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plots: Plot[];
  projectId: string;
  onSuccess?: () => void;
  mode?: "book" | "hold";
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export const BookingDialog = ({
  open,
  onOpenChange,
  plots,
  projectId,
  onSuccess,
  mode = "book",
}: BookingDialogProps) => {
  const { mutateAsync: createOrder, isPending: isOrderPending } =
    useCreateBookingOrder();
  const { mutateAsync: holdPlot, isPending: isHoldPending } = useHoldPlot();
  const { brokerData } = useApp();

  const isPending = mode === "book" ? isOrderPending : isHoldPending;

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

  const onSubmit = async (values: BookingFormValues) => {
    if (plots.length === 0) return;

    try {
      if (mode === "hold") {
        await Promise.all(
          plots.map((plot) =>
            holdPlot({
              plotId: plot._id,
              blockId: plot.blockId._id,
              projectId,
              customerDetails: {
                name: values.customerName,
                email: values.customerEmail,
                phone: values.customerPhone,
                alternatePhone: values.customerAlternatePhone,
                address: values.customerAddress,
              },
              notes: values.notes,
            })
          )
        );

        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        // BOOKING FLOW WITH RAZORPAY
        const response = await createOrder({
          projectId,
          blockId: plots[0].blockId._id,
          plotIds: plots.map((p) => p._id),
          customerDetails: {
            name: values.customerName,
            email: values.customerEmail,
            phone: values.customerPhone,
            alternatePhone: values.customerAlternatePhone,
            address: values.customerAddress,
          },
          notes: values.notes,
        });

        const { order, key_id, amount, currency } = response.data;

        const options = {
          key: key_id,
          amount: amount.toString(),
          currency: currency,
          name: "Brokwise",
          description: "Plot Booking Token",
          order_id: order.id,
          handler: function () {
            toast.success("Payment Successful! Processing booking...");
            onOpenChange(false);
            form.reset();
            if (onSuccess) onSuccess();
          },
          prefill: {
            name: values.customerName,
            email: values.customerEmail,
            contact: values.customerPhone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on(
          "payment.failed",
          function (response: { error: { description: string } }) {
            toast.error("Payment Failed: " + response.error.description);
          }
        );
        rzp1.open();
      }
    } catch (error) {
      console.error(`Error ${mode}ing plots:`, error);
    }
  };

  if (plots.length === 0) return null;

  const totalAmount = plots.reduce((sum, plot) => sum + plot.price, 0);
  const totalArea = plots.reduce((sum, plot) => sum + plot.area, 0);
  const areaUnit = plots[0]?.areaUnit || "SQ_FT";
  const actionLabel = mode === "book" ? "Pay & Book" : "Hold";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionLabel}{" "}
              {plots.length > 1
                ? `${plots.length} Plots`
                : `Plot ${plots[0].plotNumber}`}
            </DialogTitle>
            <DialogDescription>
              Enter customer details to {mode}{" "}
              {plots.length > 1 ? "these plots" : "this plot"}.
              <div className="mt-2 text-sm font-medium text-foreground p-3 bg-muted rounded-md space-y-1">
                <div className="flex justify-between">
                  <span>Selected Plots:</span>
                  <span>{plots.map((p) => p.plotNumber).join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span>
                    {totalArea} {areaUnit}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span>Total Price:</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
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
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending
                    ? mode === "book"
                      ? "Processing..."
                      : "Holding..."
                    : `Confirm ${actionLabel}`}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
