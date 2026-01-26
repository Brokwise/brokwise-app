"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { PageShell, PageHeader } from "@/components/ui/layout";

const ProjectsPage = () => {
  const { t } = useTranslation();

  return (
    <PageShell className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>

          <PageHeader
            title={t("page_projects_title")}
            description={t("page_projects_desc")}
            className="text-center sm:flex-col"
          />

          <Link href="/">
            <Button variant="default">{t("page_projects_back_home")}</Button>
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default ProjectsPage;
