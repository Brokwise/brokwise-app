import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import React from "react";
import { Input } from "@/components/ui/input";

interface AgriculturalLegalDocsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const AgriculturalLegalDocs: React.FC<AgriculturalLegalDocsProps> = ({
  form,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Legal Documents (Optional)</h3>

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
  );
};
