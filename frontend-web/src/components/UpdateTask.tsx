import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router";

const UpdateTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);

  // Use `useParams` to get the `id` from the URL
  const { id } = useParams<{ id: string }>();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`https://localhost:7208/api/Task/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const task = res.data;
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.dueDate?.split("T")[0]);
        setCategory(task.category);
      } catch (err) {
        console.error("Failed to fetch task:", err);
      }
    };

    if (id) fetchTask();
  }, [id, token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `https://localhost:7208/api/Task/${id}`,
        {
          title,
          description,
          status,
          priority,
          dueDate: new Date(dueDate).toISOString(), // ✅ ISO string conversion
          category,
          userId: "", // optional
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPopup(true);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="w-full max-w-md md:max-w-lg p-4 md:p-8">
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Update Task
          </h1>
        </div>

        <form
          onSubmit={handleUpdate}
          className="space-y-4 flex flex-col items-center"
        >
          {/* Title */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
              required
            />
          </div>

          {/* Status */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Priority:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Due Date:
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex items-center w-full">
            <label className="w-1/4 text-base md:text-lg font-semibold text-blue-400">
              Category:
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-3/4 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end w-full">
            <button
              type="submit"
              disabled={loading}
              className={`w-2/3 px-2 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating Task..." : "Update Task"}
            </button>
          </div>
        </form>

        {/* Success Popup */}
        {popup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg text-center max-w-sm w-[90%]">
              <h2 className="text-xl font-bold text-blue-500">
                Task updated successfully!
              </h2>
              <button
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                onClick={() => setPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateTask;
