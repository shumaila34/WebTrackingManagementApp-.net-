// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import TaskList from "./components/TaskList";
import NewTask from "./components/NewTask";
import TaskDetail from "./components/TaskDetail";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import UpdateTask from "./components/UpdateTask"; // UpdateTask component
import DeleteTask from "./components/DeleteTask"; // DeleteTask component
import TaskListAdmin from "./components/TaskListAdmin"; // Admin Task List component

const App: React.FC = () => {
  const isAuthenticated = true; // Replace with actual auth check

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes wrapped in Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <UserDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Task List Route */}
        <Route
          path="/admin/tasklist"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <TaskListAdmin />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasklist"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <TaskList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-task"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <NewTask />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <TaskDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Route for task update, taskId is passed via URL */}
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <UpdateTask />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Route for task deletion */}
        <Route
          path="/delete/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <DeleteTask />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
