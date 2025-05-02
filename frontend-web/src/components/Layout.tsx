// src/components/Layout.tsx
import React, { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header only if NOT Admin */}
      {role !== "Admin" && <Header />}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
