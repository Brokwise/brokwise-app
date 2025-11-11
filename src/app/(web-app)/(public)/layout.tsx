import React from "react";
import Image from "next/image";
import building from "@/../public/images/login.jpg";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col items-center justify-center h-screen px-lg">
      <div className="flex w-full h-[90%] bg-white">
        <div className="w-[50%] h-full px-4xl">{children}</div>
        <div className="w-[50%] h-full ">
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
