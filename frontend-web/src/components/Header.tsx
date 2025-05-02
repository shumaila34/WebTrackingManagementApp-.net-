// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-between items-center bg-blue-600 px-6 py-4 shadow-md">
      <h1 className="text-white text-xl sm:text-2xl font-semibold">
        TaskManager
      </h1>

      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
        title="View Profile"
      >
        <span className="text-blue-700 font-medium hidden sm:inline">
          Profile
        </span>
        <span className="text-xl">👤</span>
      </button>
    </div>
  );
};

export default Header;
