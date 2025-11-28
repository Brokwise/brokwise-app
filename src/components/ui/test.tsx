import React from "react";

const WorkspaceUI = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans">
      {/* --- Background Effects --- */}

      {/* Purple ambient glow (Top Right) */}
      <div className="absolute -top-[10%] -right-[5%] w-[800px] h-[800px] bg-purple-800/20 rounded-full blur-[180px] pointer-events-none" />

      {/* macOS Traffic Lights (Top Left) */}
      <div className="absolute top-6 left-6 flex gap-2 z-10">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/10" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10" />
        <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10" />
      </div>

      {/* --- The Empty Card --- */}
      <div
        className="
        relative 
        w-[500px] 
        h-[600px] 
        bg-[#0f0f11] 
        border border-white/10 
        rounded-2xl 
        shadow-2xl 
        flex flex-col
      "
      >
        {/* CONTENT AREA
          Currently empty as per your request.
          You can drop your form or file tree components here.
        */}
      </div>

      {/* --- Bottom Right Floating Action Button (Optional match) --- */}
      <div className="absolute bottom-8 right-8">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-500 transition-colors rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            className="translate-y-[1px]"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WorkspaceUI;
