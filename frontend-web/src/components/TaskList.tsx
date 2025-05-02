import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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
  assignedTo?: string; // Optional for admin table
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string>("user"); // 👈 new state
  const tasksPerPage = 5;

  const navigate = useNavigate();

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

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`https://localhost:7208/api/Task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
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

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">My Task List</h1>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={navigateToCreateTask}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <FaPlus className="mr-2" /> Create Task
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded border border-blue-400 text-blue-600"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="InProgress">In Progress</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 rounded border border-blue-400 text-blue-600"
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
          className="px-4 py-2 border rounded border-blue-300"
        />
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={handleButtonClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Import File
        </button>
        <button
          onClick={handleExportCSV}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-600 text-xl">
          Loading tasks...
        </div>
      ) : userRole === "admin" ? (
        <table className="w-full border border-blue-200">
          <thead className="bg-blue-100 text-blue-700">
            <tr>
              <th className="px-4 py-2">Task Name</th>
              <th className="px-4 py-2">Assigned To</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map((task) => (
              <tr key={task.id} className="border-t text-center">
                <td className="px-4 py-2">{task.title}</td>
                <td className="px-4 py-2">{task.assignedTo || "N/A"}</td>
                <td className="px-4 py-2">{task.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(task.id)}
                    className="text-green-600 hover:underline"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      const ok = window.confirm("Delete this task?");
                      if (ok) handleDelete(task.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="space-y-6">
          {paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition"
            >
              <h2 className="text-2xl font-semibold text-blue-600">
                {task.title}
              </h2>
              <p className="text-blue-500 mt-2">{task.description}</p>
              <div className="text-sm text-blue-400 mt-2 flex justify-between">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <span>Category: {task.category}</span>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => navigateToTaskDetail(task.id)}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-green-600 hover:underline flex items-center"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => {
                    const ok = window.confirm("Are you sure?");
                    if (ok) handleDelete(task.id);
                  }}
                  className="text-red-600 hover:underline flex items-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-blue-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
