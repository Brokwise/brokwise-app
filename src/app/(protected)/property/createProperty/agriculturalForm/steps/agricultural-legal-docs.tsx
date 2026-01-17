import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import { Loader2, Upload, X, FileText } from "lucide-react";

interface AgriculturalLegalDocsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const AgriculturalLegalDocs: React.FC<AgriculturalLegalDocsProps> = ({
  form,
}) => {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const handleFileUpload = async (
    file: File | null,
    fieldName: "jamabandiUrl" | "khasraPlanUrl"
  ) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const path = generateFilePath(file.name, `property-${fieldName}`);
      const url = await uploadFileToFirebase(file, path);
      form.setValue(fieldName, url, { shouldValidate: true });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      toast.error(`Error uploading document: ${error}`);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeFile = (fieldName: "jamabandiUrl" | "khasraPlanUrl") => {
    form.setValue(fieldName, "", { shouldValidate: true });
  };

  const getFileName = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      const fileNameWithParams = parts[parts.length - 1];
      const fileName = fileNameWithParams.split("?")[0];
      return fileName.length > 30
        ? fileName.substring(0, 30) + "..."
        : fileName;
    } catch {
      return "Document";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Legal Documents (Optional)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="jamabandiUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jamabandi Document</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {!field.value ? (
                    <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-3 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["jamabandiUrl"] ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold">
                            Upload Jamabandi
                          </p>
                          <p className="text-xs text-muted-foreground/75">
                            PDF, JPG, PNG
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading["jamabandiUrl"]}
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0] || null,
                            "jamabandiUrl"
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-3 p-4 rounded-xl border bg-muted/50 group">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getFileName(field.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded successfully
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile("jamabandiUrl")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload Jamabandi document from your device
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
              <FormLabel>Khasra Plan Document</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {!field.value ? (
                    <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-3 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-200">
                          {uploading["khasraPlanUrl"] ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold">
                            Upload Khasra Plan
                          </p>
                          <p className="text-xs text-muted-foreground/75">
                            PDF, JPG, PNG
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading["khasraPlanUrl"]}
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0] || null,
                            "khasraPlanUrl"
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-3 p-4 rounded-xl border bg-muted/50 group">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getFileName(field.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded successfully
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile("khasraPlanUrl")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload Khasra Plan document from your device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
