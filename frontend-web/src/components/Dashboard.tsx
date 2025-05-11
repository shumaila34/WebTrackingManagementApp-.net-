import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector,
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

const COLORS = ["#29abe2", "#f9a602", "#90ee90"]; // Light blue, amber, light green

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent,
    name,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={mx} cy={my} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${name} (${value})`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#777"
      >{`( ${(percent * 100).toFixed(2)}% )`}</text>
    </g>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (entry: any, index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
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
      } finally {
        setIsLoading(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black py-10 font-sans"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-extrabold text-blue-300">
            Task Management Dashboard
          </h1>
          <button
            onClick={() => navigate("/admin/tasklist")}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium transition duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105"
          >
            <span className="hidden sm:inline">Manage</span> Tasks
          </button>
        </motion.div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center text-gray-400 py-8 flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 mx-auto text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V1a7 7 0 00-7 7h1zm9 2v-1a7 7 0 007-7h-1a8 8 0 01-8 8v1z"
              ></path>
            </svg>
            <p className="mt-2 font-medium text-gray-300">Loading Data...</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-semibold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col gap-8"
          >
            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center"
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-blue-400 font-semibold text-xl mb-2">
                  Completed
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.taskCounts.completed}
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center"
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-amber-400 font-semibold text-xl mb-2">
                  In Progress
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.taskCounts.inProgress}
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center"
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-green-400 font-semibold text-xl mb-2">
                  Pending
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.taskCounts.pending}
                </div>
              </motion.div>
            </div>

            {/* Task Distribution Pie Chart */}
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 text-center">
                Task Distribution
              </h2>
              <div className="w-full flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      onMouseEnter={onPieEnter}
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
                        backgroundColor: "#374151",
                        borderColor: "#4a5568",
                        color: "#fff",
                        borderRadius: "0.5rem",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend
                      wrapperStyle={{
                        color: "#fff",
                        marginTop: "20px",
                        fontFamily:
                          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
