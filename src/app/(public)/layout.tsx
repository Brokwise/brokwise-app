import React from "react";
import Image from "next/image";
import building from "@/../public/images/login.jpg";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col items-center justify-center h-screen lg:px-lg px-4">
      <div className="flex w-full h-[90%]">
        <div className="lg:w-[50%] w-full h-full lg:px-4xl px-2">
          {children}
        </div>
        <div className="lg:w-[50%] w-full h-full lg:block hidden ">
          <Image
            src={building}
            alt="building"
            width={500}
            height={500}
            className="object-cover w-full h-full rounded-lg"
          />
        </div>
      </div>
    </main>
  );
};

export default layout;
