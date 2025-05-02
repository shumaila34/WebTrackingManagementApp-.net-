import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Interfaces
interface TaskCounts {
  Completed: number;
  InProgress: number;
  Pending: number;
}

interface DashboardData {
  role: string;
  taskCounts: TaskCounts;
}

interface DashboardProps {
  role: string;
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"]; // Blue, Yellow, Green

const UserDashboard: React.FC<DashboardProps> = ({ role }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://localhost:7208/api/Dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }

        const result: DashboardData = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          if (err.message === "Session expired. Please log in again.") {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const chartData = data
    ? [
        { name: "Completed", value: data.taskCounts.Completed },
        { name: "In Progress", value: data.taskCounts.InProgress },
        { name: "Pending", value: data.taskCounts.Pending },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col items-center justify-start py-12 px-4">
      {/* Header Section */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-blue-800 mb-4 sm:mb-0 text-center w-full">
          {role === "Admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>
        <button
          onClick={() => navigate("/tasklist")}
          className="px-6 py-2 bg-blue-700 hover:bg-blue-900 text-white rounded-lg font-semibold transition duration-300 shadow-md"
        >
          {role === "Admin" ? "Manage Tasks" : " Tasks"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-200 text-red-800 px-6 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Cards */}
      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Completed */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 border-2 border-transparent">
              <h2 className="text-lg text-gray-500 mb-1">Completed</h2>
              <p className="text-4xl font-bold text-blue-700">
                {data.taskCounts.Completed}
              </p>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 border-2 border-transparent">
              <h2 className="text-lg text-gray-500 mb-1">In Progress</h2>
              <p className="text-4xl font-bold text-yellow-500">
                {data.taskCounts.InProgress}
              </p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 border-2 border-transparent">
              <h2 className="text-lg text-gray-500 mb-1">Pending</h2>
              <p className="text-4xl font-bold text-green-500">
                {data.taskCounts.Pending}
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-6">
            <PieChart width={350} height={350}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="top" align="center" />
            </PieChart>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-lg mt-8">Loading Dashboard...</p>
      )}
    </div>
  );
};

export default UserDashboard;
