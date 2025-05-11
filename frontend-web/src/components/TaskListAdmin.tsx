import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle } from "lucide-react";

// Define the types and interfaces
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  userName: string;
}

interface PopupState {
  show: boolean;
  message: string;
  type?: "success" | "error";
}

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      variants={popupVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="bg-gray-800 p-6 rounded-md shadow-lg border border-gray-700">
        <p className="text-lg text-white mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Dummy UI components (for demonstration purposes)
const Button: React.FC<any> = ({ className, variant, onClick, children }) => (
  <button
    className={`${className} px-6 py-3 rounded-full font-medium transition duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      variant === "outline"
        ? "border bg-transparent text-blue-400 hover:bg-blue-500/20 hover:text-white border-blue-500/30"
        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Card: React.FC<any> = ({ className, children }) => (
  <div
    className={`${className} rounded-lg shadow-lg bg-gray-800 border border-gray-700`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<any> = ({ className, children }) => (
  <div className={`${className} p-6`}>{children}</div>
);

const CardTitle: React.FC<any> = ({ className, children }) => (
  <h2 className={`${className} text-2xl font-semibold text-white`}>
    {children}
  </h2>
);

const CardDescription: React.FC<any> = ({ className, children }) => (
  <p className={`${className} text-gray-400`}>{children}</p>
);

const CardContent: React.FC<any> = ({ className, children }) => (
  <div className={`${className} p-6`}>{children}</div>
);

const Input: React.FC<any> = ({ className, placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`${className} w-full rounded-full border border-gray-700 bg-gray-700 text-white placeholder:text-gray-400 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
  />
);
// End dummy components

const TaskListAdmin: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    taskId: number | null;
    isOpen: boolean;
  }>({
    taskId: null,
    isOpen: false,
  });
  const [popup, setPopup] = useState<PopupState>({ show: false, message: "" });

  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://localhost:7208/api/Task", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected response format.");
      }
    } catch (err: any) {
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

  const handleEditTask = (taskId: number) => {
    navigate(`/edit/${taskId}`);
  };

  const handleDeleteClick = (taskId: number) => {
    setDeleteConfirmation({ taskId: taskId, isOpen: true });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.taskId) {
      try {
        await axios.delete(
          `https://localhost:7208/api/Task/${deleteConfirmation.taskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPopup({
          show: true,
          message: "Task deleted successfully!",
          type: "success",
        });
        setDeleteConfirmation({ taskId: null, isOpen: false });
        // Refresh the task list
        fetchTasks();
      } catch (err: any) {
        console.error("Error deleting task:", err);
        setPopup({
          show: true,
          message: `Error deleting task: ${err.message || "Unknown error"}`,
          type: "error",
        });
      }
    }
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ taskId: null, isOpen: false });
  };

  const navigateToCreateTask = () => {
    navigate("/new-task");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const popupVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-6 bg-black">
      <Card>
        <CardHeader>
          <CardTitle>Admin Task List</CardTitle>
          <CardDescription>Manage tasks within the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <Input
              type="text"
              placeholder="Search by Title"
              value={searchTerm}
              onChange={handleSearchChange}
              className="md:w-1/3"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => alert("Import CSV clicked")}
              >
                Import CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => alert("Export CSV clicked")}
              >
                Export CSV
              </Button>
              <Button onClick={navigateToCreateTask} className="">
                Create Task
              </Button>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          {/* Display tasks in a table */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900">
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm text-blue-400">
                      {task.title}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm text-gray-300">
                      {task.description}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm text-yellow-400">
                      {task.status}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm text-white">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm text-purple-400">
                      {task.userName}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-800 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditTask(task.id)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-white border-blue-500/30 px-2 py-1 rounded-full" // Adjusted padding and shape
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteClick(task.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-white border-red-500/30 px-2 py-1 rounded-full" // Adjusted padding and shape
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this task?"
      />

      {/* Success/Error Popup */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          >
            <div
              className={`bg-gray-800 p-6 rounded-xl text-center max-w-sm w-[90%] border ${
                popup.type === "success" ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="flex justify-center items-center mb-4">
                {popup.type === "success" ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h2
                className={`text-xl font-bold ${
                  popup.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {popup.message}
              </h2>
              <Button
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                onClick={() => setPopup({ show: false, message: "" })}
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskListAdmin;
