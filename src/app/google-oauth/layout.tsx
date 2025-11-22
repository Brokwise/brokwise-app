import React, { Suspense } from "react";
// import { LoadingSkeleton } from "@/app/(protected)/app/_components/LoadingSkeleton";

const GoogleOauthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div>
          {/* <LoadingSkeleton /> */}
          <div>Loading...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default GoogleOauthLayout;
