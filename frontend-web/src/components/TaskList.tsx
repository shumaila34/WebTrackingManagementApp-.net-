import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileImport,
  FaFileExport,
} from "react-icons/fa";
import { AlertTriangle } from "lucide-react"; // Changed the import
import { motion, AnimatePresence } from "framer-motion";

type Priority = "High" | "Medium" | "Low";
type Status = "Pending" | "Completed" | "InProgress";

type Task = {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  category: string;
  assignedTo?: string;
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [tasksPerPage] = useState<number>(5);
  const navigate = useNavigate();
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const priorityOrder: Record<Priority, number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (role) setUserRole(role);

      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("https://localhost:7208/api/Task", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDeleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`https://localhost:7208/api/Task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setShowDeletePopup(false);
      setDeleteTaskId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (id: number) => navigate(`/edit/${id}`);
  const navigateToTaskDetail = (id: number) => navigate(`/task/${id}`);
  const navigateToCreateTask = () => navigate("/new-task");

  const filteredTasks = tasks
    .filter((task) => {
      const statusMatch =
        statusFilter === "All" || task.status === statusFilter;
      const priorityMatch =
        priorityFilter === "All" || task.priority === priorityFilter;
      const searchMatch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      return statusMatch && priorityMatch && searchMatch;
    })
    .sort((a, b) => {
      const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
      return pd !== 0
        ? pd
        : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput?.click();
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Title,Description,Status,Priority,DueDate,Category"]
        .concat(
          tasks.map((task) =>
            [
              task.id,
              task.title,
              task.description,
              task.status,
              task.priority,
              new Date(task.dueDate).toLocaleDateString(),
              task.category,
            ]
              .map((field) => `"${field}"`)
              .join(",")
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "InProgress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-gray-100 text-gray-800";
      default:
        return "";
    }
  };

  const popupVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700">My Task List</h1>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={navigateToCreateTask}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700
                                        transition-all duration-300 shadow-lg px-6 py-3 rounded-full flex items-center
                                        hover:scale-105"
        >
          <FaPlus className="mr-2" /> Create Task
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[180px] bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-md"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="InProgress">In Progress</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-[180px] bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-md"
        >
          <option value="All">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[280px] bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-md"
        />

        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={handleButtonClick}
          className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-300 px-6 py-3 rounded-md flex items-center"
        >
          <FaFileImport className="mr-2" /> Import File
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 px-6 py-3 rounded-md flex items-center"
        >
          <FaFileExport className="mr-2" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-600 text-xl">
          Loading tasks...
        </div>
      ) : userRole === "admin" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-blue-200 shadow-md rounded-lg">
            <thead className="bg-blue-50 text-blue-700">
              <tr>
                <th className="px-6 py-3 text-left text-white">Task Name</th>
                <th className="px-6 py-3 text-left text-white">Assigned To</th>
                <th className="px-6 py-3 text-left text-white">Status</th>
                <th className="px-6 py-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigateToTaskDetail(task.id)}
                  >
                    {task.title}
                  </td>
                  <td className="px-6 py-4">{task.assignedTo || "N/A"}</td>
                  <td className={`px-6 py-4 ${getStatusColor(task.status)}`}>
                    {task.status}
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTaskId(task.id);
                        setShowDeletePopup(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700"
            >
              <h2
                className="text-2xl font-semibold text-blue-400 cursor-pointer hover:underline"
                onClick={() => navigateToTaskDetail(task.id)}
              >
                {task.title}
              </h2>
              <p className="text-gray-300 mt-2">{task.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                <span
                  className={`${getStatusColor(task.status)} px-2 py-1 rounded-md`}
                >
                  Status: {task.status}
                </span>
                <span
                  className={`${getPriorityColor(task.priority)} px-2 py-1 rounded-md`}
                >
                  Priority: {task.priority}
                </span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <span>Category: {task.category}</span>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => navigateToTaskDetail(task.id)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-green-400 hover:text-green-300 flex items-center"
                >
                  <FaEdit className="mr-1 h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTaskId(task.id);
                    setShowDeletePopup(true);
                  }}
                  className="text-red-400 hover:text-red-300 flex items-center"
                >
                  <FaTrash className="mr-1 h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={
                currentPage === index + 1
                  ? "bg-blue-600 text-white px-4 py-2 rounded-md"
                  : "text-blue-400 hover:bg-blue-500 hover:text-white  px-4 py-2 rounded-md"
              }
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDeletePopup && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-gray-800 p-6 rounded-xl text-center max-w-sm w-[90%] border border-red-500">
              <div className="flex justify-center items-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-4">
                Are you sure?
              </h2>
              <p className="text-gray-300 mb-6">
                This action cannot be undone. Do you want to delete this task?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    if (deleteTaskId !== null) {
                      handleDeleteTask(deleteTaskId);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setDeleteTaskId(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
