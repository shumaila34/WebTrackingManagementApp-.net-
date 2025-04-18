// pages/TaskList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  status: string;
  description: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]); // State ko array se initialize karna
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found");
        return;
      }

      try {
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data); // Response ko console par dekhain
        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          console.error("Tasks data is not an array");
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  const handleNewTaskClick = () => {
    navigate("/tasks/new");
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
        🗂️ Tasks
      </h1>
      <button
        onClick={handleNewTaskClick}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        New Task
      </button>
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 border rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p>Status: {task.status}</p>
              <p>Description: {task.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
