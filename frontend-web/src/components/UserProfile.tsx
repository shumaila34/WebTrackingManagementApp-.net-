import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react"; // For the profile icon

interface UserData {
  name: string;
  email: string;
  role: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("https://localhost:7208/api/Profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            "Failed to fetch user data",
            response.status,
            response.statusText
          );
          throw new Error("Failed to fetch user data.");
        }

        const result = await response.json();
        setUserData(result);
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching user data:", err.message);
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle logout operation
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <UserCircle className="w-20 h-20 text-blue-400 stroke-2" />
          </div>
          <h1 className="text-3xl font-semibold text-center text-white mb-8">
            User Profile
          </h1>

          {error && (
            <div
              className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {userData ? (
            <>
              <div className="mb-8 space-y-4">
                <h2 className="text-lg font-medium text-gray-300">
                  User Details
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-200">
                    <span className="font-semibold text-gray-400">Name:</span>{" "}
                    {userData.name}
                  </p>
                  <p className="text-gray-200">
                    <span className="font-semibold text-gray-400">Email:</span>{" "}
                    {userData.email}
                  </p>
                  <p className="text-gray-200">
                    <span className="font-semibold text-gray-400">Role:</span>{" "}
                    {userData.role}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">Loading user data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
