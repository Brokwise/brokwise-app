import type { Viewport } from "next";
import React from "react";

export const viewport: Viewport = {
  themeColor: "#0a2f61",
};

const WelcomeLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default WelcomeLayout;
