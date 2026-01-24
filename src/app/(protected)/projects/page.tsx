"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const ProjectsPage = () => {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto py-8 h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-instrument-serif text-foreground tracking-tight">
              {t("page_projects_title")}
            </h1>
            <p className="text-muted-foreground">
              {t("page_projects_desc")}
            </p>
          </div>

          <Link href="/">
            <Button variant="default">{t("page_projects_back_home")}</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProjectsPage;
