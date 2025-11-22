"use client";
import Link from "next/link";
import Signupcard from "../_components/signupcard";

const LoginPage = () => {
  return (
    <main className="flex flex-col lg:px-[10rem] px-4 justify-center gap-4xl">
      <h1 className="font-instrument-serif text-4xl">Welcome to Brokwise</h1>
      <p>Access your account and continue your journey with us</p>
      <Signupcard isSignup={false} />
      <div>
        Don&apos;t have an account?{" "}
        <Link href="/create-account">Create account</Link>
      </div>
    </main>
  );
};

export default LoginPage;
