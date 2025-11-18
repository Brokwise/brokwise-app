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
  commercialPropertySchema,
  CommercialPropertyFormData,
} from "@/validators/property";

interface CommercialFormProps {
  onBack: () => void;
}

export const CommercialForm: React.FC<CommercialFormProps> = ({ onBack }) => {
  const form = useForm<CommercialPropertyFormData>({
    resolver: zodResolver(commercialPropertySchema),
    defaultValues: {
      propertyCategory: "COMMERCIAL",
      propertyType: "SHOP",
      address: "",
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
    },
  });

  const onSubmit = (data: CommercialPropertyFormData) => {
    console.log("Commercial Property Data:", data);
    // Handle form submission here
  };

  const propertyType = form.watch("propertyType");
  const plotType = form.watch("plotType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commercial Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property Type */}
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SHOWROOM">Showroom</SelectItem>
                      <SelectItem value="HOTEL">Hotel</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="SHOP">Shop</SelectItem>
                      <SelectItem value="OFFICE_SPACE">Office Space</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter complete property address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SHOWROOM SPECIFIC FIELDS */}
            {propertyType === "SHOWROOM" && (
              <>
                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Showroom Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter size"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            <SelectItem value="SQ_FT">Square Feet</SelectItem>
                            <SelectItem value="SQ_METER">
                              Square Meter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Floor */}
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ground">Ground Floor</SelectItem>
                          <SelectItem value="1">1st Floor</SelectItem>
                          <SelectItem value="2">2nd Floor</SelectItem>
                          <SelectItem value="3">3rd Floor</SelectItem>
                          <SelectItem value="4">4th Floor</SelectItem>
                          <SelectItem value="5">5th Floor</SelectItem>
                          <SelectItem value="6">6th Floor</SelectItem>
                          <SelectItem value="7">7th Floor</SelectItem>
                          <SelectItem value="8">8th Floor</SelectItem>
                          <SelectItem value="9">9th Floor</SelectItem>
                          <SelectItem value="10">10th Floor</SelectItem>
                          <SelectItem value="11">11th Floor</SelectItem>
                          <SelectItem value="12">12th Floor</SelectItem>
                          <SelectItem value="13">13th Floor</SelectItem>
                          <SelectItem value="14">14th Floor</SelectItem>
                          <SelectItem value="15">15th Floor</SelectItem>
                          <SelectItem value="16">16th Floor</SelectItem>
                          <SelectItem value="17">17th Floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rental Income */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Rental Income (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rentalIncome.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rentalIncome.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2500000"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Retail, Display, Sales"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* HOTEL SPECIFIC FIELDS */}
            {propertyType === "HOTEL" && (
              <>
                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter size"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            <SelectItem value="SQ_FT">Square Feet</SelectItem>
                            <SelectItem value="SQ_METER">
                              Square Meter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Floor */}
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ground">Ground Floor</SelectItem>
                          <SelectItem value="1">1st Floor</SelectItem>
                          <SelectItem value="2">2nd Floor</SelectItem>
                          <SelectItem value="3">3rd Floor</SelectItem>
                          <SelectItem value="4">4th Floor</SelectItem>
                          <SelectItem value="5">5th Floor</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rental Income */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Rental Income (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rentalIncome.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rentalIncome.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2500000"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Hospitality, Tourism, Business"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hotel Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Select from: Reception Lobby Area, Daily Housekeeping, On Site Dining Restaurant, Conference Meeting Rooms, Elevator Lift, Fitness Center, Spa Massage Services, Laundry Service, Business Center, High Speed Wi Fi, Parking Space, Airport Shuttle, Cctv Surveillance, Fire Safety Equipment"
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
              </>
            )}

            {/* HOSTEL SPECIFIC FIELDS */}
            {propertyType === "HOSTEL" && (
              <>
                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostel Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter size"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            <SelectItem value="SQ_FT">Square Feet</SelectItem>
                            <SelectItem value="SQ_METER">
                              Square Meter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Beds and Rooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="beds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Beds</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select beds" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40,
                              50,
                            ].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Beds
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter number of rooms"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rental Income */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Rental Income (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rentalIncome.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rentalIncome.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Rental Income (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2500000"
                              max="2500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>Range: 0 to 25L</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Hostel Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostel Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Select from: Shared Kitchen, Common Lounge Area, Dormitory Private Rooms, Study Work Zones, Lockers For Each Bed, Shared Bathrooms, 24 7 Security, Laundry Facilities, Wi Fi, Housekeeping, Cctv Surveillance, Bicycle Parking, Social Activities Zone, Meal Options Available, Air Conditioning Fans"
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
              </>
            )}

            {/* SHOP SPECIFIC FIELDS */}
            {propertyType === "SHOP" && (
              <>
                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter size"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            <SelectItem value="SQ_FT">Square Feet</SelectItem>
                            <SelectItem value="SQ_METER">
                              Square Meter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Status */}
                <FormField
                  control={form.control}
                  name="propertyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Land">Land</SelectItem>
                          <SelectItem value="Constructed">
                            Constructed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Plot Type */}
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

                {/* Front Facing */}
                <FormField
                  control={form.control}
                  name="facing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Front Facing</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facing direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NORTH">North</SelectItem>
                          <SelectItem value="SOUTH">South</SelectItem>
                          <SelectItem value="EAST">East</SelectItem>
                          <SelectItem value="WEST">West</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Enter front road width"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Corner Plot Additional Fields */}
                {plotType === "CORNER" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sideFacing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side Facing</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select side facing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NORTH">North</SelectItem>
                              <SelectItem value="SOUTH">South</SelectItem>
                              <SelectItem value="EAST">East</SelectItem>
                              <SelectItem value="WEST">West</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sideRoadWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side Road Width (in feet)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter side road width"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

            {/* OFFICE SPACE SPECIFIC FIELDS */}
            {propertyType === "OFFICE_SPACE" && (
              <>
                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter size"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            <SelectItem value="SQ_FT">Square Feet</SelectItem>
                            <SelectItem value="SQ_METER">
                              Square Meter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Project Area */}
                <FormField
                  control={form.control}
                  name="projectArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Area (sq ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter project area"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Office Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Select from: Furnished Cabins Workstations, Conference Meeting Rooms, High Speed Internet, Air Conditioning, 24 7 Security Surveillance, Reception Front Desk, Pantry Cafeteria, Power Backup, Printing Scanning Services, Parking Area, Elevator Lift, Fire Safety Exit Routes, Cleaning Maintenance, Access Control System, Networking It Support Infrastructure"
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
              </>
            )}

            {/* Common Fields for All Commercial Types */}

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

            {/* Add Location - Placeholder for Google Maps */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Details</h3>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Google Maps Integration - Click to select location
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (To be implemented with Google Maps API)
                </p>
              </div>
            </div>

            {/* Add Localities */}
            <FormField
              control={form.control}
              name="localities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Localities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter nearby localities separated by commas (e.g., MI Road, Pink City, Bani Park)"
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
                    Enter multiple localities separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (About Property) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Property</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the property features, amenities, and other details"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the property (minimum 10
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media Files</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Featured Media</label>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">
                      Upload JPEG image or MP4 video
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Images List</label>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">
                      Upload multiple JPEG images
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Plan</label>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">
                      Upload PDF or JPEG
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                Create Commercial Property
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
