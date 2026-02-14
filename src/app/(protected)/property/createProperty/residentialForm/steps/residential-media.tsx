import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import Image from "next/image";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/utils/upload";
import { Loader2, Wand2Icon, X, Plus, Upload } from "lucide-react";
import { useState } from "react";
import useAxios from "@/hooks/useAxios";
import {
  getPropertyMediaSrc,
  isSampleLandMedia,
  SAMPLE_LAND_MEDIA_DISCLAIMER,
  SAMPLE_LAND_MEDIA_PATH,
} from "@/lib/property-media";
interface ResidentialMediaProps {
  uploading: { [key: string]: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  setUploading: React.Dispatch<
    React.SetStateAction<{
      [key: string]: boolean;
    }>
  >;
  propertyType: "FLAT" | "VILLA" | "LAND";
}

export const ResidentialMedia: React.FC<ResidentialMediaProps> = ({
  form,
  setUploading,
  uploading,
  propertyType,
}) => {
  // Dynamic label based on property type
  const isLandProperty = propertyType === "LAND";
  const floorPlanLabel = propertyType === "LAND" ? "Site Plan" : "Floor Plans";
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const api = useAxios();
  const handleFileUpload = async (
    files: FileList | null,
    fieldName: "featuredMedia" | "images" | "floorPlans"
  ) => {
    if (!files || files.length === 0) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const convertedFile = await convertImageToWebP(file);
        const path = generateFilePath(
          convertedFile.name,
          `property-${fieldName}`
        );
        return await uploadFileToFirebase(convertedFile, path);
      });

      const urls = await Promise.all(uploadPromises);

      if (fieldName === "featuredMedia") {
        form.setValue(fieldName, urls[0], { shouldValidate: true });
      } else {
        const currentUrls = form.getValues(fieldName) || [];
        form.setValue(fieldName, [...currentUrls, ...urls], {
          shouldValidate: true,
        });
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      toast.error(`Error uploading ${fieldName}: ${error}`);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeFile = (
    fieldName: "featuredMedia" | "images" | "floorPlans",
    index?: number
  ) => {
    if (fieldName === "featuredMedia") {
      form.setValue(fieldName, "", { shouldValidate: true });
    } else {
      const currentUrls = form.getValues(fieldName) || [];
      if (typeof index === "number") {
        const newUrls = [...currentUrls];
        newUrls.splice(index, 1);
        form.setValue(fieldName, newUrls, { shouldValidate: true });
      }
    }
  };
  const handleGenerateDescription = async () => {
    try {
      setGeneratingDescription(true);
      const response = await api.post("/utils/ai", {
        data: form.getValues(),
      });
      const data = await response.data;
      form.setValue("description", data.description, { shouldValidate: true });
      setGeneratingDescription(false);
      toast.success("Description generated successfully");
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Error generating description");
      setGeneratingDescription(false);
    }
  };
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              About Property <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  placeholder="Describe the property features, amenities, and other details"
                  className="min-h-[120px]"
                  {...field}
                />
                <div className="w-full flex justify-end py-1 ">
                  <Button
                    disabled={generatingDescription}
                    onClick={() => handleGenerateDescription()}
                    className="h-8 text-sm "
                  >
                    {generatingDescription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Generate Description <Wand2Icon />
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Media Files</h3>

        <FormField
          control={form.control}
          name="featuredMedia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Featured Media{" "}
                {!isLandProperty && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {isLandProperty && (
                    <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        No real media? Use sample land image
                      </p>
                      <p className="text-xs text-amber-800">
                        {SAMPLE_LAND_MEDIA_DISCLAIMER}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          isSampleLandMedia(field.value)
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          form.setValue("featuredMedia", SAMPLE_LAND_MEDIA_PATH, {
                            shouldValidate: true,
                          })
                        }
                      >
                        {isSampleLandMedia(field.value)
                          ? "Sample image selected"
                          : "Use sample image"}
                      </Button>
                    </div>
                  )}
                  {!field.value ? (
                    <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full max-w-md h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-4 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["featuredMedia"] ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-semibold">
                            Upload featured image
                          </p>
                          <p className="text-xs text-muted-foreground/75">
                            SVG, PNG, JPG or GIF
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading["featuredMedia"]}
                        onChange={(e) =>
                          handleFileUpload(e.target.files, "featuredMedia")
                        }
                      />
                    </div>
                  ) : (
                    <div className="relative w-full max-w-md h-32 rounded-xl border bg-muted overflow-hidden group">
                      <Image
                        width={400}
                        height={225}
                        src={getPropertyMediaSrc(field.value)}
                        alt="Featured Media"
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFile("featuredMedia")}
                          className="translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                        >
                          <X className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              {isLandProperty && (
                <FormDescription>
                  Featured media is optional for land. You can upload your own
                  photo or use the sample image.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!field.value || field.value.length === 0 ? (
                    <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full max-w-md h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-4 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["images"] ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-semibold">
                            Upload gallery images
                          </p>
                          <p className="text-xs text-muted-foreground/75">
                            Add multiple photos to showcase property
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading["images"]}
                        onChange={(e) =>
                          handleFileUpload(e.target.files, "images")
                        }
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {/* Upload Button */}
                      <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer group">
                        <div className="p-3 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["images"] ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </div>
                        <span className="text-xs font-semibold">Add More</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          disabled={uploading["images"]}
                          onChange={(e) =>
                            handleFileUpload(e.target.files, "images")
                          }
                        />
                      </div>

                      {field.value?.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="relative aspect-[4/3] rounded-xl border bg-muted overflow-hidden group"
                        >
                          <Image
                            width={200}
                            height={200}
                            src={url}
                            alt={`Property image ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                              onClick={() => removeFile("images", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floorPlans"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {floorPlanLabel} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!field.value || field.value.length === 0 ? (
                    <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full max-w-md h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-2 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["floorPlans"] ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold">
                            Upload {floorPlanLabel.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading["floorPlans"]}
                        onChange={(e) =>
                          handleFileUpload(e.target.files, "floorPlans")
                        }
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {/* Upload Button */}
                      <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer group">
                        <div className="p-3 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["floorPlans"] ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </div>
                        <span className="text-xs font-semibold">Add More</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          disabled={uploading["floorPlans"]}
                          onChange={(e) =>
                            handleFileUpload(e.target.files, "floorPlans")
                          }
                        />
                      </div>

                      {field.value?.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="relative aspect-[4/3] rounded-xl border bg-muted overflow-hidden group"
                        >
                          <Image
                            src={url}
                            height={200}
                            width={200}
                            alt={`Floor plan ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                              onClick={() => removeFile("floorPlans", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
