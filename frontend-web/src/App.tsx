import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskList from "./components/TaskList";
import NewTask from "./components/NewTask";
import TaskDetail from "./components/TaskDetail";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const isAuthenticated = true; // Replace with actual auth check

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protect these routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-list"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TaskDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <NewTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
