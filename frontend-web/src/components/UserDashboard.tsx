import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// Interfaces
interface TaskCounts {
  completed: number;
  inProgress: number;
  pending: number;
}

interface DashboardData {
  role: string;
  taskCounts: TaskCounts;
}

interface DashboardProps {
  role: string;
}

const COLORS = ["#4F46E5", "#F59E0B", "#10B981"]; // Tailwind Indigo, Amber, Emerald

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
        console.log({ result });

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
        { name: "Completed", value: data.taskCounts.completed },
        { name: "In Progress", value: data.taskCounts.inProgress },
        { name: "Pending", value: data.taskCounts.pending },
      ]
    : [];
  console.log({ data });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-4xl font-bold text-white mb-4 sm:mb-0 text-center">
            {role === "Admin" ? "Admin Dashboard" : "User Dashboard"}
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/tasklist")}
            className="w-64 py-3 px-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-full font-bold tracking-wide shadow-lg hover:shadow-2xl hover:brightness-110 active:brightness-90 transition-all duration-300 ring-2 ring-white/20"
          >
            {role === "Admin" ? "Manage Tasks" : "Tasks"}
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Cards */}
        {data ? (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {/* Completed */}
            <motion.div variants={cardVariants} whileHover="hover">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg text-gray-300 text-center">
                    Completed
                  </h2>
                </div>
                <div className="p-6 pt-0">
                  <p className="text-4xl font-bold text-blue-400 text-center">
                    {data.taskCounts.completed}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* In Progress */}
            <motion.div variants={cardVariants} whileHover="hover">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg text-gray-300 text-center">
                    In Progress
                  </h2>
                </div>
                <div className="p-6 pt-0">
                  <p className="text-4xl font-bold text-yellow-400 text-center">
                    {data.taskCounts.inProgress}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pending */}
            <motion.div variants={cardVariants} whileHover="hover">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg text-gray-300 text-center">Pending</h2>
                </div>
                <div className="p-6 pt-0">
                  <p className="text-4xl font-bold text-green-400 text-center">
                    {data.taskCounts.pending}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <p className="text-gray-400 text-lg mt-8">Loading Dashboard...</p>
        )}

        {/* Pie Chart */}
        {data && (
          <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    borderColor: "#444",
                    color: "#fff",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
