import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("pending"); // Default status set to 'pending'
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const response = await axios.post(
        "/api/tasks",
        { title, status, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
        New Task
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 border rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="inProgress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default NewTask;
