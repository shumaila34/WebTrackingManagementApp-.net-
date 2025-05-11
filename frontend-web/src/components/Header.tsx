import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react"; // Import the UserCircle icon

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 shadow-md rounded-b-lg">
      <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
        TaskManager
      </h1>
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "#f0f4f8" }} // Lighter hover effect
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full transition-all duration-300
                   hover:bg-white/30 border border-white/10" // Added subtle border
        title="View Profile"
      >
        <span className="text-blue-100 font-medium hidden sm:inline">
          Profile
        </span>
        {/* Replace the generic emoji with a more styled icon */}
        <UserCircle className="w-7 h-7 text-blue-100" />
      </motion.button>
    </div>
  );
};

export default Header;
