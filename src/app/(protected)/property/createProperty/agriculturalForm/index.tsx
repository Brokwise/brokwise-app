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
  agriculturalPropertySchema,
  AgriculturalPropertyFormData,
} from "@/validators/property";

interface AgriculturalFormProps {
  onBack: () => void;
}

export const AgriculturalForm: React.FC<AgriculturalFormProps> = ({
  onBack,
}) => {
  const form = useForm<AgriculturalPropertyFormData>({
    resolver: zodResolver(agriculturalPropertySchema),
    defaultValues: {
      propertyCategory: "AGRICULTURAL",
      propertyType: "AGRICULTURAL_LAND",
      address: "",
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
    },
  });

  const onSubmit = (data: AgriculturalPropertyFormData) => {
    console.log("Agricultural Property Data:", data);
    // Handle form submission here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agricultural Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property Title */}
            <FormField
              control={form.control}
              name="propertyTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a descriptive title for the agricultural property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete property address including village, tehsil, district"
                      {...field}
                    />
                  </FormControl>
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
                    <FormLabel>Land Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter land size"
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
                    <FormLabel>Size Unit</FormLabel>
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
                    Width of the road adjacent to the agricultural land
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Legal Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Legal Documents (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jamabandiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jamabandi Document URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/jamabandi.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload and provide URL for Jamabandi document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="khasraPlanUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khasra Plan Document URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/khasra-plan.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload and provide URL for Khasra Plan document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                    <FormDescription>
                      Price per acre/bigha/hectare as per selected unit
                    </FormDescription>
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
                  <FormLabel>Property Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the agricultural land - soil type, water source, crops grown, irrigation facilities, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the agricultural land
                    including soil quality, water availability, and farming
                    potential (minimum 10 characters)
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
                Create Agricultural Property
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
