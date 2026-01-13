"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProjectsPage = () => {
  return (
    <main className="container mx-auto py-8 h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-instrument-serif text-foreground tracking-tight">
              Coming Soon
            </h1>
            <p className="text-muted-foreground">
              We are working hard to bring you the projects section. Stay tuned
              for updates!
            </p>
          </div>

          <Link href="/">
            <Button variant="default">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProjectsPage;
