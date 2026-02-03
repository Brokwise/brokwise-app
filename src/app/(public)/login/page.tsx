"use client";

import { Suspense } from "react";
import AuthPage from "../_components/AuthPage";
import Image from "next/image";

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="h-screen w-full flex flex-col justify-center items-center gap-4">
      <Image src={"/logo.webp"} height={52} width={52} alt="Brokwise" className="rounded-full" />
      {/* <Loader2 className="animate-spin h-10 w-10" /> */}
      <h1 className="text-2xl text-center">Loading...</h1>
    </div>}>
      <AuthPage initialMode="login" />
    </Suspense>
  );
};

export default LoginPage;
