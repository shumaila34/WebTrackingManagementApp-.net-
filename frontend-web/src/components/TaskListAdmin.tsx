import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  userName: string; // ✅ Added this
}

const TaskListAdmin: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://localhost:7208/api/Task");
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks from the server.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to the Create Task page
  const navigateToCreateTask = () => {
    navigate("/new-task");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Admin Task Dashboard
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => alert("Import CSV clicked")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Import CSV
          </button>
          <button
            onClick={() => alert("Export CSV clicked")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Export CSV
          </button>
          <button
            onClick={navigateToCreateTask} // Create Task Button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Create Task
          </button>
        </div>
      </div>

      {/* Error handling */}
      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="border p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p>{task.description}</p>
            <div className="mt-2 text-gray-500">
              <span>Status: {task.status}</span>
              <br />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskListAdmin;
