// src/pages/TaskDetail.jsx

// src/pages/TaskDetail.jsx
import React from "react";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// Define the Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string; // Added priority as a new property
}

const TaskDetail = () => {
  const { id } = useParams(); // Get task ID from URL
  const navigate = useNavigate();

  // Define the task state with the Task interface
  const [task, setTask] = useState<Task | null>(null); // Initially null, later it will hold a Task object

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${id}`); // Replace with your API endpoint
        setTask(res.data); // Assuming the data matches the Task interface structure
      } catch (err) {
        console.error("Failed to fetch task:", err);
      }
    };

    fetchTask();
  }, [id]);

  if (!task) {
    return <div className="p-8 text-center text-gray-600">Loading task...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Task Details</h1>

      <div className="bg-white shadow-md rounded p-6 max-w-3xl mx-auto space-y-4">
        <p>
          <strong>ID:</strong> {task.id}
        </p>
        <p>
          <strong>Title:</strong> {task.title}
        </p>
        <p>
          <strong>Description:</strong> {task.description}
        </p>
        <p>
          <strong>Status:</strong> {task.status}
        </p>
        <p>
          <strong>Priority:</strong> {task.priority}
        </p>{" "}
        {/* Display priority */}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/newtask")} // This will navigate to the New Task page
          className="ml-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Create New Task
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;
