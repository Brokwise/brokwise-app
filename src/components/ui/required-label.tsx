import React from "react";

export const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </span>
);
