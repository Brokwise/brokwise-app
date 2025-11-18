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
  residentialPropertySchema,
  ResidentialPropertyFormData,
} from "@/validators/property";

interface ResidentialFormProps {
  onBack: () => void;
}

export const ResidentialForm: React.FC<ResidentialFormProps> = ({ onBack }) => {
  const form = useForm<ResidentialPropertyFormData>({
    resolver: zodResolver(residentialPropertySchema),
    defaultValues: {
      propertyCategory: "RESIDENTIAL",
      propertyType: "FLAT",
      address: "",
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
    },
  });

  const onSubmit = (data: ResidentialPropertyFormData) => {
    console.log("Residential Property Data:", data);
    // Handle form submission here
  };

  const propertyType = form.watch("propertyType");
  const plotType = form.watch("plotType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residential Property Details</CardTitle>
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
                      <SelectItem value="FLAT">Flat/Apartment</SelectItem>
                      <SelectItem value="VILLA">Villa</SelectItem>
                      <SelectItem value="LAND">Residential Land</SelectItem>
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

            {/* FLAT SPECIFIC FIELDS */}
            {propertyType === "FLAT" && (
              <>
                {/* Penthouse Checkbox */}
                <FormField
                  control={form.control}
                  name="isPenthouse"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Penthouse</FormLabel>
                        <FormDescription>
                          Check if this is a penthouse apartment
                        </FormDescription>
                      </div>
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
                        <FormLabel>Property Size</FormLabel>
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

                {/* BHK and Washrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bhk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 BHK</SelectItem>
                            <SelectItem value="2">2 BHK</SelectItem>
                            <SelectItem value="3">3 BHK</SelectItem>
                            <SelectItem value="4">4 BHK</SelectItem>
                            <SelectItem value="5">5 BHK</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="washrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Washrooms</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Society */}
                <FormField
                  control={form.control}
                  name="society"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Society Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter society name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* Possession Date */}
                <FormField
                  control={form.control}
                  name="possessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possession Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Select possession date or leave empty for immediate
                        possession
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Flat Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Select from: Balcony, Attached Washroom, Cupboard, Desert Cooler, Air Conditioning, Cafeteria, Car Parking, Club House, High Security (CCTV), Modular Kitchen, Power Backup, Security Guard, Semi Furnished, Swimming Pool, Wooden Wardroom, Children Play Area, CLUB & LOUNGE, Fully Furnished, Fire Alarm System, Gym, MULTIPLEX, Rain Water Harvesting"
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

            {/* VILLA SPECIFIC FIELDS */}
            {propertyType === "VILLA" && (
              <>
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

                {/* Villa Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Villa Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Select from: Private Swimming Pool, Garden Lawn, Private Parking, Fully Equipped Kitchen, Barbecue Area, Security System, Terrace Balcony, Furnished Interiors, Air Conditioning, Wi Fi, Power Backup, Staff Quarters, Pet Friendly, Jacuzzi Spa, Fire Pit"
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

                {/* Size and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Villa Size</FormLabel>
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
                            <SelectItem value="SQ_YARDS">
                              Square Yards
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* LAND SPECIFIC FIELDS */}
            {propertyType === "LAND" && (
              <>
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
                            <SelectItem value="SQ_YARDS">
                              Square Yards
                            </SelectItem>
                            <SelectItem value="ACRES">Acres</SelectItem>
                            <SelectItem value="BIGHA">Bigha</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Common Fields for All Types */}

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
                      placeholder="Enter nearby localities separated by commas (e.g., Malviya Nagar, C-Scheme, Vaishali Nagar)"
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

              {/* Featured Media */}
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
                Create Residential Property
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
