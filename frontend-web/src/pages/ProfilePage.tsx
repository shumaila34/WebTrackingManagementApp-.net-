// src/pages/UserProfile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define the type for User
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null); // Type the user state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/profile"); // Adjust your API route
        setUser(res.data); // User data is now set with proper typing
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login"); // Redirect to login page if error occurs
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = ""; // Clear the auth token
    navigate("/login"); // Redirect to login after logout
  };

  // Loading state
  if (!user) {
    return <div className="p-8 text-center text-gray-600">Loading user...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">User Profile</h1>

      <div className="bg-white shadow-md rounded p-6 max-w-md mx-auto space-y-4">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
