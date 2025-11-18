import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { H1 } from "@/components/text/h1";
const CreateProperty = () => {
  const createPropertySchema = z.object({
    propertyCategory: z.string(),
  });
  const form = useForm<z.infer<typeof createPropertySchema>>({
    defaultValues: {
      propertyCategory: "",
    },
    resolver: zodResolver(createPropertySchema),
  });
  return (
    <main>
      <H1 text="Create Property" />
    </main>
  );
};

export default CreateProperty;
