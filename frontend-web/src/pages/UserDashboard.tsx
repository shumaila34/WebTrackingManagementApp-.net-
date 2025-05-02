// src/pages/DashboardPage.tsx

import React from "react";
import UserDashboard from "../components/UserDashboard";

const UserDashboardPage: React.FC = () => {
  return (
    // <main className="flex-1 p-6 ml-64">
    <main className="flex-1">
      <UserDashboard />
    </main>
  );
};

export default UserDashboardPage;
