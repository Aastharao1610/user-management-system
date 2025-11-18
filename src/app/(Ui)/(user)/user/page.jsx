"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const MetricCard = ({ title, value, themeClasses }) => (
  <div
    className={`p-6 rounded-xl shadow-lg ${themeClasses.bg} border ${themeClasses.border} transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl`}
  >
    <div className="flex items-start justify-between">
      <p className={`text-lg font-medium ${themeClasses.inactiveText}`}>
        {title}
      </p>
    </div>
    <p className={`mt-2 text-4xl font-extrabold ${themeClasses.text}`}>
      {value ?? "—"}
    </p>
  </div>
);

const DashboardView = ({ themeClasses }) => {
  const router = useRouter();
  const {
    accentColor = "text-blue-500",
    inactiveText = "text-gray-500",
    text = "text-black",
    bg = "bg-white",
    border = "border-gray-200",
  } = themeClasses || {};

  const [permissions, setPermissions] = useState([]);
  const [dataCounts, setDataCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Step 1: Fetch user and permissions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        console.log(res, "response");
        const user = res.data?.user;
        console.log(user, "User");
        const userPermissions = user?.permissions || [];
        console.log(userPermissions, "User permisssion");
        const filtered = userPermissions.filter((p) => p.name !== "Dashboard");
        console.log(filtered, "filtered");
        setPermissions(filtered);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/Login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // 🔹 Step 2: Fetch actual data for each permission
  useEffect(() => {
    if (permissions.length === 0) return;

    const fetchCounts = async () => {
      const counts = {};

      for (const perm of permissions) {
        try {
          let endpoint = "";
          let key = ""; // which key to count from

          switch (perm.name) {
            case "Users":
              endpoint = "/api/user";
              key = "users";
              break;
            case "Roles":
              endpoint = "/api/role";
              key = "roles";
              break;
            case "Blog":
              endpoint = "/api/Blog";
              key = "blogs";
              break;
            default:
              endpoint = null;
          }
          console.log(perm);
          console.log(perm.name);
          console.log(perm?.name?.length, "perm?.name?.length");
          console.log(endpoint, "endpoint");
          if (endpoint) {
            const res = await axios.get(endpoint);
            console.log(res, "response of count of response of  ");

            const data = res.data;
            console.log(data, "Dashboard data");
            if (Array.isArray(data)) {
              counts[perm.name] = data.length;
            } else if (Array.isArray(data[key])) {
              counts[perm.name] = data[key].length;
            } else {
              counts[perm.name] = 0;
            }
          } else {
            counts[perm.name] = 0;
          }
        } catch (error) {
          console.error(`Error fetching data for ${perm}:`, error);
          counts[perm.name] = 0;
        }
      }

      setDataCounts(counts);
    };

    fetchCounts();
  }, [permissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`${inactiveText}`}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`p-8 space-y-8 min-h-full transition-colors duration-300`}>
      <h2 className={`text-4xl font-extrabold ${text} border-b ${border} pb-4`}>
        Dashboard Overview
      </h2>

      {permissions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {permissions.map((perm, idx) => (
            <MetricCard
              key={idx}
              title={perm.name}
              value={dataCounts[perm.name] ?? "—"}
              themeClasses={{ accentColor, inactiveText, text, bg, border }}
            />
          ))}
        </div>
      ) : (
        <p className={`${inactiveText}`}>
          No permission data available for this user.
        </p>
      )}
    </div>
  );
};

export default DashboardView;
