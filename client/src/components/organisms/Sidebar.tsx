import {
  FiHome,
  FiTrello,
  FiSettings,
  FiPlus,
  FiUser,
  FiX,
} from "react-icons/fi";
import Button from "../atoms/Button";
import type { SidebarProps } from "../../types";

const Sidebar = ({
  isOpen,
  onToggle,
  currentPath,
  onNavigate,
}: SidebarProps) => {
  const navigationItems = [
    {
      path: "/",
      icon: FiHome,
      label: "Dashboard",
    },
    {
      path: "/tickets",
      icon: FiTrello,
      label: "Ticket'lar",
    },
    {
      path: "/create-ticket",
      icon: FiPlus,
      label: "Yeni Ticket",
    },
    {
      path: "/settings",
      icon: FiSettings,
      label: "Ayarlar",
    },
  ];

  const isActivePath = (path: string) => currentPath === path;

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transform transition-transform duration-200 ease-in-out fixed md:static inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-40`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              IT<span className="text-blue-400">Helpdesk</span>
            </h1>
            <p className="text-xs text-gray-400">v2.1.0</p>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant={isActivePath(item.path) ? "primary" : "ghost"}
            size="md"
            onClick={() => onNavigate(item.path)}
            className={`w-full justify-start ${
              isActivePath(item.path)
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            <item.icon className="mr-3 w-5 h-5" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <FiUser className="text-white w-5 h-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin Kullanıcı</p>
            <p className="text-xs text-gray-400">Yönetici</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
