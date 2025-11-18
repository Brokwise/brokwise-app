"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resortPropertySchema,
  ResortPropertyFormData,
} from "@/validators/property";

interface ResortFormProps {
  onBack: () => void;
}

export const ResortForm: React.FC<ResortFormProps> = ({ onBack }) => {
  const form = useForm<ResortPropertyFormData>({
    resolver: zodResolver(resortPropertySchema),
    defaultValues: {
      propertyCategory: "RESORT",
      propertyType: "RESORT",
      address: "",
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
    },
  });

  const onSubmit = (data: ResortPropertyFormData) => {
    console.log("Resort Property Data:", data);
    // Handle form submission here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resort Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resort Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete resort address including location, city, state"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Status */}
            <FormField
              control={form.control}
              name="propertyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Status</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Operational, Under Construction, Ready to Operate"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Current operational status of the resort
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resort Area</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter total area"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizeUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACRES">Acres</SelectItem>
                        <SelectItem value="HECTARE">Hectare</SelectItem>
                        <SelectItem value="BIGHA">Bigha</SelectItem>
                        <SelectItem value="SQ_FT">Square Feet</SelectItem>
                        <SelectItem value="SQ_METER">Square Meter</SelectItem>
                        <SelectItem value="SQ_YARDS">Square Yards</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Facing and Plot Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facing Direction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select facing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORTH">North</SelectItem>
                        <SelectItem value="SOUTH">South</SelectItem>
                        <SelectItem value="EAST">East</SelectItem>
                        <SelectItem value="WEST">West</SelectItem>
                        <SelectItem value="NORTH_EAST">North East</SelectItem>
                        <SelectItem value="NORTH_WEST">North West</SelectItem>
                        <SelectItem value="SOUTH_EAST">South East</SelectItem>
                        <SelectItem value="SOUTH_WEST">South West</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plotType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plot type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ROAD">Road Facing</SelectItem>
                        <SelectItem value="CORNER">Corner Plot</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Front Road Width */}
            <FormField
              control={form.control}
              name="frontRoadWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front Road Width (in feet)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter road width"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Width of the main access road to the resort
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Unit (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter rate per unit"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter total price"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resort Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the resort - facilities, amenities, rooms, dining, recreational activities, location advantages, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide comprehensive details about the resort including
                    facilities, amenities, and unique features (minimum 10
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenities */}
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resort Amenities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List amenities separated by commas (e.g., Swimming Pool, Spa, Restaurant, Conference Hall, Garden, Parking)"
                      {...field}
                      value={field.value?.join(", ") || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(", ")
                            .filter((item) => item.trim())
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter amenities separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkboxes */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isPriceNegotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Price Negotiable</FormLabel>
                      <FormDescription>
                        Check if the price is open for negotiation
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Property</FormLabel>
                      <FormDescription>
                        Mark as featured property for better visibility
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Resort Property
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
