import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const CreateTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [role, setRole] = useState("User");
  const [userId, setUserId] = useState(""); // 👈 for regular users
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId"); // 👈 assuming you store it on login

    if (storedRole) setRole(storedRole);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const payload: any = {
      title,
      description,
      status,
      priority,
      dueDate,
      category,
      assignedToUserId: role === "Admin" ? assignedToUserId : userId, // 👈 auto-set for users
    };

    try {
      await axios.post("https://localhost:7208/api/Task", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setPopup(true);
      setTitle("");
      setDescription("");
      setStatus("Pending");
      setPriority("Low");
      setDueDate("");
      setCategory("");
      setAssignedToUserId("");

      navigate(role === "Admin" ? "/admin/tasklist" : "/tasklist");
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="w-full max-w-md md:max-w-lg p-4 md:p-8">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Create New Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            placeholder="Title"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            placeholder="Description"
            required
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            required
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            required
          />

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded"
            placeholder="Category"
            required
          />

          {/* 👇 Only visible for Admins */}
          {role === "Admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to (User ID)
              </label>
              <input
                type="text"
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded"
                placeholder="e.g. user123"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Task"}
          </button>
        </form>

        {popup && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            Task created successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTask;
