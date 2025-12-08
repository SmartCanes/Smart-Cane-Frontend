import React from "react";

const UserStatus = ({ name = "User", online = true }) => {
  const userInitial = name ? name.charAt(0).toUpperCase() : "";

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-50 rounded-full p-1 pr-5 shadow-sm border border-gray-200">
        <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 pb-1">
          <span className="text-white text-lg font-medium">{userInitial}</span>
        </div>
        <span className="ml-3 font-semibold text-gray-800 text-sm tracking-tight">
          {name}
        </span>
      </div>
      {online && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 ">
          <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border-2 border-white animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            Online
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatus;
