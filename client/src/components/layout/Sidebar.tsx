/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UserPlus,
  Clock,
  Settings,
  ChevronRight,
  CreditCard,
  BarChart3,
  ChevronLeft,
  PlusCircle
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile on initial render and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Function to check if a route is active
  const isActive = (route: string) => {
    if (route === "/dashboard" && pathname === "/") {
      return true;
    }
    return pathname?.startsWith(route);
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 self-end mt-2 mr-2 lg:flex hidden"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/dashboard")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Home size={20} />
              {!collapsed && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>

          {/* Groups */}
          <li>
            <Link
              href="/groups"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/groups")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Users size={20} />
              {!collapsed && <span className="ml-3">Groups</span>}
            </Link>
          </li>

          {/* Create Group */}
          <li>
            <Link
              href="/groups/create"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/groups/create")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <PlusCircle size={20} />
              {!collapsed && <span className="ml-3">Create Group</span>}
            </Link>
          </li>

          {/* Friends */}
          <li>
            <Link
              href="/friends"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/friends")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <UserPlus size={20} />
              {!collapsed && <span className="ml-3">Friends</span>}
            </Link>
          </li>

          {/* Activity */}
          <li>
            <Link
              href="/activity"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/activity")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Clock size={20} />
              {!collapsed && <span className="ml-3">Activity</span>}
            </Link>
          </li>

          {/* Expenses */}
          <li>
            <Link
              href="/expenses"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/expenses")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <CreditCard size={20} />
              {!collapsed && <span className="ml-3">Expenses</span>}
            </Link>
          </li>

          {/* Reports */}
          <li>
            <Link
              href="/reports"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive("/reports")
                  ? "bg-[#e4f9f5] text-[#1cc29f]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <BarChart3 size={20} />
              {!collapsed && <span className="ml-3">Reports</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Settings */}
      <div className="py-4 px-2 border-t border-gray-200">
        <Link
          href="/settings"
          className={cn(
            "flex items-center px-3 py-2 rounded-lg transition-colors",
            isActive("/settings")
              ? "bg-[#e4f9f5] text-[#1cc29f]"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Settings size={20} />
          {!collapsed && <span className="ml-3">Settings</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
