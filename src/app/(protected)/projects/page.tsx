"use client";

import React, { useState } from "react";
import { useGetProjects } from "@/hooks/useProject";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { formatAddress } from "@/utils/helper";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";

const ProjectsPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { projects, isLoading, error } = useGetProjects({
    search: debouncedSearch,
  });

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Error loading projects: {error.message}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <Image
                    width={100}
                    height={100}
                    src={project.images?.[0] || "/images/placeholder.webp"}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.webp";
                    }}
                  />
                  <Badge
                    className="absolute top-2 right-2"
                    variant={
                      project.projectStatus === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {project.projectStatus}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {formatAddress(project.address)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" />
                      {project.numberOfPlots} Plots
                    </div>
                    <div className="capitalize">{project.projectUse}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default ProjectsPage;
