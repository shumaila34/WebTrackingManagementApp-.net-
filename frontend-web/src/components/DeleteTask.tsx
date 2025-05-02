import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrashAlt, FaArrowLeft } from "react-icons/fa";

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
}

const DeleteTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get<Task>(
          `https://localhost:7208/api/Task/${id}`
        );
        setTask(response.data);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!task || !userId) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`https://localhost:7208/api/Task/${task.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Delete Task
        </h1>

        {task ? (
          <>
            <div className="text-center mb-6">
              <p className="text-lg mb-2">
                Are you sure you want to delete this task?
              </p>
              <h2 className="text-xl font-semibold text-blue-500">
                {task.title}
              </h2>
              <p className="text-gray-700">{task.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Due Date: {task.dueDate}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Enter Your User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => navigate("/tasks")}
                className="flex items-center gap-2 bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                <FaArrowLeft />
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className={`flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  "Deleting..."
                ) : (
                  <>
                    <FaTrashAlt />
                    Delete
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">Loading task details...</p>
        )}
      </div>
    </div>
  );
};

export default DeleteTask;
