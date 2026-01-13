"use client";

import React, { Suspense } from "react";
import AuthPage from "../_components/AuthPage";

const CreateAccountPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AuthPage initialMode="signup" />
    </Suspense>
  );
};

export default CreateAccountPage;
