import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>(""); // To handle password input
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message for password update
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
          throw new Error("Failed to fetch user data.");
        }

        const result = await response.json();
        setUserData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
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

  // Handle password change
  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7208/api/Profile/change-password",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change password.");
      }

      setNewPassword(""); // Clear the password input field
      setErrorMessage(null); // Clear any previous error messages
      alert("Password changed successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-blue-600 mb-6">
          User Profile
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {userData ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800">
                User Details
              </h2>
              <p className="text-gray-600">Name: {userData.name}</p>
              <p className="text-gray-600">Email: {userData.email}</p>
              <p className="text-gray-600">Role: {userData.role}</p>
            </div>

            {/* Password Change Form */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800">
                Change Password
              </h2>
              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                  {errorMessage}
                </div>
              )}
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={handlePasswordChange}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
              >
                Change Password
              </button>
            </div>

            {/* Logout Button */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
