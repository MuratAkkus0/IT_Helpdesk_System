import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../organisms/Header";
import Sidebar from "../organisms/Sidebar";
import { FiPlus } from "react-icons/fi";

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (): string => {
    const titles: Record<string, string> = {
      "/": "Dashboard",
      "/tickets": "Ticket Management",
      "/create-ticket": "New Ticket",
      "/settings": "Settings",
    };
    return titles[location.pathname] || "Dashboard";
  };

  const getPageDescription = (): string => {
    const descriptions: Record<string, string> = {
      "/": "You can view and analyze all data in the system",
      "/tickets": "You can view and manage all tickets in the system",
      "/create-ticket": "You can create a new support ticket",
      "/settings": "You can manage system settings",
    };
    return descriptions[location.pathname] || "";
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPath={location.pathname}
        onNavigate={navigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={location.pathname === "/tickets"}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{getPageTitle()}</h1>
              <p className="text-gray-400">{getPageDescription()}</p>
            </div>

            {location.pathname === "/tickets" && (
              <button
                onClick={() => navigate("/create-ticket")}
                className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
              >
                <FiPlus className="mr-2" />
                New Ticket
              </button>
            )}
          </div>

          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
