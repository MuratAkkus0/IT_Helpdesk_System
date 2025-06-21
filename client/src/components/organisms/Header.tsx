import { FiSearch, FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import type { HeaderProps } from "../../types";

const Header = ({
  title,
  searchQuery = "",
  onSearchChange,
  showSearch = false,
  sidebarOpen,
  onSidebarToggle,
}: HeaderProps) => {
  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSidebarToggle}
          className="p-2 rounded-md bg-gray-800 hover:bg-gray-700"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </Button>
      </div>

      {/* Top Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && onSearchChange && (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Ticket ara..."
                className="pl-10 pr-4 py-2 w-64"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 relative transition-colors">
            <FiBell className="w-5 h-5 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <FiUser className="text-white w-4 h-4" />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
