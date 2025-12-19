"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Broker } from "@/stores/authStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export const BrokersList = ({
  brokers,
  onRemove,
  loadingRemove,
}: {
  brokers: Broker[];
  onRemove: (brokerId: string) => void;
  loadingRemove: string | null;
}) => {
  if (brokers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No brokers found. Add one to get started.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "incomplete":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "blacklisted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brokers.map((broker) => (
            <TableRow key={broker._id}>
              <TableCell className="font-medium">
                <Link href={`company-brokers/${broker._id}`}>
                  {broker.firstName} {broker.lastName}
                </Link>
              </TableCell>
              <TableCell>{broker.email}</TableCell>
              <TableCell>{broker.mobile}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusColor(broker.status)}
                >
                  {broker.status.charAt(0).toUpperCase() +
                    broker.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={loadingRemove === broker._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Broker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {broker.firstName} from
                        your company? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRemove(broker._id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
