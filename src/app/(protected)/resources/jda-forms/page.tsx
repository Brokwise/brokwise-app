"use client";

import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";

import { useJDAForm } from "@/hooks/useJdaForm";
import { H1 } from "@/components/text/h1";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface JdaForm {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
}

export default function JDAFormsPage() {
  const { formsData, isLoadingForms, errorForms } = useJDAForm();

  if (isLoadingForms) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (errorForms) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load JDA forms.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <H1 text="JDA Forms" />
        <p className="text-center text-muted-foreground">
          Access and download essential JDA forms and documents.
        </p>
      </div>

      {formsData && formsData.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {formsData.map((form: JdaForm) => (
            <Card
              key={form._id}
              className="flex flex-col transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-6" />
                </div>
                <CardTitle className="line-clamp-1 text-lg">
                  {form.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="line-clamp-3">
                  {form.description ||
                    "No description available for this form."}
                </CardDescription>
              </CardContent>
              <CardFooter>
                {form.fileUrl ? (
                  <Button asChild className="w-full" variant="secondary">
                    <Link
                      href={form.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                      <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    Document Unavailable
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-2 text-muted-foreground">
          <FileText className="size-12 opacity-20" />
          <p>No forms available at the moment.</p>
        </div>
      )}
    </div>
  );
}
