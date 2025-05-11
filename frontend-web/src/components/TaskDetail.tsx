import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

// Extended Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  dueDate?: string;
  userName?: string;
}

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view this task.");
        return;
      }

      try {
        const res = await axios.get(`https://localhost:7208/api/Task/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTask(res.data);
      } catch (err: any) {
        console.error("Error fetching task:", err);
        if (err.response?.status === 403) {
          setError("You are not authorized to view this task.");
        } else if (err.response?.status === 404) {
          setError("Task not found.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized: Please log in.");
          navigate("/login"); // redirect to login page
        } else {
          setError("Something went wrong while fetching the task.");
        }
      }
    };

    fetchTask();
  }, [id, navigate]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-black">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-800 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-gray-600 bg-black">
        Loading task...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Task Details</h1>

      <div className="bg-gray-800 shadow-lg rounded-xl p-6 max-w-3xl mx-auto">
        <div className="rounded-lg bg-gray-700 shadow-sm">
          <div className="border-b px-6 py-4 text-xl font-semibold bg-gray-600 rounded-t-lg text-white">
            Task Information
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-300">ID:</strong>
                <span className="ml-2 text-white">{task.id}</span>
              </div>
              <div>
                <strong className="text-gray-300">Title:</strong>
                <span className="ml-2 text-white">{task.title}</span>
              </div>
              <div>
                <strong className="text-gray-300">Description:</strong>
                <span className="ml-2 text-white">{task.description}</span>
              </div>
              <div>
                <strong className="text-gray-300">Status:</strong>
                <span className="ml-2 text-white">{task.status}</span>
              </div>
              <div>
                <strong className="text-gray-300">Priority:</strong>
                <span className="ml-2 text-white">{task.priority}</span>
              </div>
              {task.category && (
                <div>
                  <strong className="text-gray-300">Category:</strong>
                  <span className="ml-2 text-white">{task.category}</span>
                </div>
              )}
              {task.dueDate && (
                <div>
                  <strong className="text-gray-300">Due Date:</strong>
                  <span className="ml-2 text-white">
                    {format(new Date(task.dueDate), "dd MMM, yyyy")}
                  </span>
                </div>
              )}
              {task.userName && (
                <div>
                  <strong className="text-gray-300">Assigned To:</strong>
                  <span className="ml-2 text-white">{task.userName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 flex justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-md shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out font-semibold"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/newtask")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition duration-300 ease-in-out font-semibold"
        >
          Create New Task
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;
