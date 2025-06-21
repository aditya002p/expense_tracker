import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Toggle user dropdown
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-[#1cc29f] font-bold text-2xl">Split</span>
              <span className="font-bold text-2xl">Wise</span>
              <span className="text-[#1cc29f] font-bold text-2xl">Clone</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-[#1cc29f] font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/groups" 
              className="text-gray-700 hover:text-[#1cc29f] font-medium transition-colors"
            >
              Groups
            </Link>
            <Link 
              href="/activity" 
              className="text-gray-700 hover:text-[#1cc29f] font-medium transition-colors"
            >
              Activity
            </Link>
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative mr-2">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative ml-3">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-[#1cc29f] flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="hidden md:block font-medium">John Doe</span>
                <ChevronDown size={16} className={cn(
                  "transition-transform duration-200",
                  isUserMenuOpen ? "rotate-180" : ""
                )} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                  <Link 
                    href="/profile" 
                    className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Your Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle logout
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMenu}
              className="ml-4 md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3 py-2">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-[#1cc29f] font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/groups" 
                className="text-gray-700 hover:text-[#1cc29f] font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Groups
              </Link>
              <Link 
                href="/activity" 
                className="text-gray-700 hover:text-[#1cc29f] font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Activity
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
