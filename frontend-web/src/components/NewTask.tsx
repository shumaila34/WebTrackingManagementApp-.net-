import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

// ✅ Define the user type coming from the API
interface UserSelectItem {
  text: string;
  value: string;
}

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [userList, setUserList] = useState<UserSelectItem[]>([]); // ✅ Typed
  const [role, setRole] = useState("User");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");

    if (storedRole) setRole(storedRole);
    if (storedUserId) setUserId(storedUserId);

    if (storedRole === "Admin") {
      const token = localStorage.getItem("token");
      axios
        .get<UserSelectItem[]>(
          "https://localhost:7208/api/Task/user-select-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setUserList(res.data);
        })
        .catch((err) => console.error("Error fetching user list:", err));
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate,
      category,
      assignedToUserId: role === "Admin" ? assignedToUserId : userId,
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
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="w-full max-w-md md:max-w-lg p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-center text-blue-400 mb-6">
          Create New Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
            required
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Pending" className="bg-gray-800 text-white">
              Pending
            </option>
            <option value="In Progress" className="bg-gray-800 text-white">
              In Progress
            </option>
            <option value="Completed" className="bg-gray-800 text-white">
              Completed
            </option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Low" className="bg-gray-800 text-white">
              Low
            </option>
            <option value="Medium" className="bg-gray-800 text-white">
              Medium
            </option>
            <option value="High" className="bg-gray-800 text-white">
              High
            </option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category"
            required
          />

          {role === "Admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign to
              </label>
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full px-5 py-3 border border-gray-600 rounded-full bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-gray-800 text-white">
                  Select user
                </option>
                {userList.map((user) => (
                  <option
                    key={user.value}
                    value={user.value}
                    className="bg-gray-800 text-white"
                  >
                    {user.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-full font-medium transition duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Task"}
          </button>
        </form>

        {popup && (
          <div className="mt-6 text-center text-green-400 font-semibold bg-green-500/20 p-3 rounded-md border border-green-500/30">
            Task created successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTask;
