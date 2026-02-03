"use client";

import React, { Suspense } from "react";
import AuthPage from "../_components/AuthPage";
import Image from "next/image";

const CreateAccountPage = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
          <Image src={"/logo.webp"} height={52} width={52} alt="Brokwise" className="rounded-full" />
        </div>
      }
    >
      <AuthPage initialMode="signup" />
    </Suspense>
  );
};

export default CreateAccountPage;
