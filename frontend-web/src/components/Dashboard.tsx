import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Define interfaces for the response data structure
interface TaskCounts {
  Completed: number;
  InProgress: number;
  Pending: number;
}

interface DashboardData {
  role: string;
  taskCounts: TaskCounts;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      navigate("/login"); // Redirect to login if no token or role is found
      return;
    }

    // Fetch data from the dashboard API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://localhost:7208/api/Dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in header
            "Content-Type": "application/json", // ✅ Added content-type
          },
        });

        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }

        const result: DashboardData = await response.json();
        setData(result); // Set fetched data to state
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Set error message
          if (err.message === "Session expired. Please log in again.") {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login"); // Navigate to login if the token is expired
          }
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      {error && <div className="error">{error}</div>}

      {data ? (
        <div>
          <h2>
            {data.role === "Admin" ? "Admin Dashboard" : "User Dashboard"}
          </h2>
          <div>
            <h3>Task Counts</h3>
            <p>Completed: {data.taskCounts.Completed}</p>
            <p>In Progress: {data.taskCounts.InProgress}</p>
            <p>Pending: {data.taskCounts.Pending}</p>
          </div>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default Dashboard;
