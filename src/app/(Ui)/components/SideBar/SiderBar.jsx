"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  Shield,
  Lock,
  X, // <-- ADDED: Necessary for the mobile close button
} from "lucide-react";

const iconMap = {
  dashboard: <LayoutDashboard size={22} />,
  blog: <FileText size={22} />,
  reports: <Settings size={22} />,
  users: <Users size={22} />,
  roles: <Shield size={22} />,
  permission: <Lock size={22} />,
};

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  themeClasses,
}) {
  const [permissions, setPermissions] = useState([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        const userPermissions = res.data?.user?.permissions || [];
        setPermissions(userPermissions);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Session expired. Redirecting...");
        router.push("/Login");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const { bg, border, accentColor, inactiveText, hover, isDarkMode } =
    themeClasses;

  const width = "w-80";
  const fontSize = "text-lg";

  const activeBg = isDarkMode ? "bg-indigo-900/40" : "bg-indigo-500";

  return (
    <aside
      className={`
    ${width} flex-shrink-0 border-r ${bg} ${border} flex-col transition-all duration-300 shadow-lg/10 z-40 min-h-screen
    fixed inset-y-0 left-0
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:relative md:translate-x-0 md:flex
  `}
    >
      <div className={`p-4 flex justify-end md:hidden ${bg}`}>
        <button
          onClick={() => setIsSidebarOpen(false)}
          title="Close Menu"
          className={`p-1 rounded-full ${hover} ${inactiveText}`}
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-5"></div>

      <nav className="px-3 space-y-1 flex-grow overflow-y-auto">
        {permissions.length > 0 ? (
          permissions.map((perm) => {
            const permName = perm.name;
            const lower = permName.toLowerCase();
            const currentPath = pathname.toLowerCase();
            const isActive =
              currentPath === `/user/${lower}` ||
              currentPath.includes(`/user/${lower}`);

            const itemClasses = isActive
              ? `${activeBg} ${accentColor} ${isDarkMode ? "text-white" : ""}`
              : `${inactiveText} ${hover}`;

            return (
              <Link
                key={permName}
                onClick={() => setIsSidebarOpen(false)}
                href={`/user/${permName}`}
                className={`flex items-center space-x-3 p-3 ${fontSize} font-semibold rounded-lg transition-all duration-300 ease-in-out ${itemClasses}`}
              >
                <div className="flex items-center space-x-3">
                  <div>{iconMap[lower]}</div>
                  <span
                    className={`
                      ${isActive ? "text-white" : inactiveText} 
                      transition-colors duration-300
                    `}
                  >
                    {permName}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-3 text-center">
            <p className="text-gray-400 text-sm">No navigation available.</p>
          </div>
        )}
      </nav>
    </aside>
  );
}
