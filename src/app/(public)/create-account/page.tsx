"use client";

import Link from "next/link";

import Signupcard from "../_components/signupcard";

const CreateAccountPage = () => {
  return (
    <main className="flex flex-col px-[3rem] lg:px-[10rem] justify-center gap-2xl lg:gap-4xl">
      <h1 className="font-instrument-serif text-4xl">Welcome to Brokwise</h1>
      <p>Create your account and continue your journey with us</p>
      <Signupcard isSignup={true} />
      <div>
        Already have an account? <Link href="/login">Login</Link>
      </div>
    </main>
  );
};

export default CreateAccountPage;
