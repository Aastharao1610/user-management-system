"use client";
import React, { useState, useEffect } from "react";
import { CreatePermissionModal } from "@/app/(Ui)/components/Modals/PermissionModal";
import { Edit, Search, Trash, Plus } from "lucide-react";
import DeleteUserModal from "@/app/(Ui)/components/Modals/DeleteUser";

const Permission = ({ themeClasses = {} }) => {
  const {
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    hover = "cursor-pointer",
    text = "text-black",
    bg = "bg-white",
    border = "border-gray-200",
  } = themeClasses;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [deletePermission, setDeletePermission] = useState(null);

  const tableBg = bg === "bg-gray-900" ? "bg-gray-800" : "bg-white";

  // ✅ Fetch permissions from backend
  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      console.log("Response:", res);

      const data = await res.json();
      console.log("Permissions Data:", data.permissions);

      if (!res.ok) throw new Error(data.error || "Failed to fetch permissions");

      const formatted = data.permissions.map((perm) => ({
        id: perm.id,
        name: perm.name || `${perm.module}_${perm.action}`,
        description: perm.description || "No description provided",
        module: perm.module || "General",
        action: perm.action || "View",
      }));
      setPermissions(formatted);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleEdit = (perm) => {
    setSelectedPermission(perm);
    setIsModalOpen(true);
  };

  const handleDelete = (perm) => {
    setDeletePermission(perm);
  };

  const displayedPermissions = [...permissions];

  return (
    <div className="space-y-6">
      {/* Create / Edit Modal */}
      <CreatePermissionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPermission(null);
        }}
        themeClasses={themeClasses}
        permissionToEdit={selectedPermission}
        onSuccess={fetchPermissions}
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Permission by name..."
            className={`w-full p-2 pl-10 rounded-lg border ${border} ${tableBg} ${text} text-sm focus:ring-2 ${accentColor.replace(
              "text",
              "focus:ring"
            )} focus:border-transparent transition duration-200`}
            style={{ outline: "none" }}
          />
          <Search
            size={22}
            name="Search"
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${inactiveText}`}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center space-x-2 cursor-pointer py-2 px-4 rounded-lg font-semibold text-white ${accentColor.replace(
            "text",
            "bg"
          )} transition duration-200 hover:opacity-90 shadow-md ${accentColor.replace(
            "text",
            "shadow"
          )}/50`}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Permission</span>
        </button>
      </div>

      {/* Permissions Table */}
      <div
        className={`overflow-x-auto rounded-xl shadow-lg border ${border} ${tableBg}`}
      >
        <table className="min-w-full divide-y divide-gray-700">
          <thead className={`${bg}`}>
            <tr>
              {["ID", "Name", "Description", "Action", "Module", "Actions"].map(
                (heading, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${inactiveText}`}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayedPermissions.map((perm) => (
              <tr key={perm.id} className={`${hover}`}>
                <td
                  className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${text} opacity-60`}
                >
                  {perm.id}
                </td>

                <td className={`px-4 py-4 whitespace-nowrap`}>
                  <div className={`text-sm font-medium ${text}`}>
                    {perm.name}
                  </div>
                </td>

                <td
                  className={`px-4 py-4 whitespace-nowrap text-sm ${inactiveText} hidden sm:table-cell`}
                >
                  {perm.description}
                </td>

                <td
                  className={`px-4 py-4 whitespace-nowrap text-sm ${inactiveText}`}
                >
                  {perm.action}
                </td>

                <td
                  className={`px-4 py-4 whitespace-nowrap text-sm ${inactiveText}`}
                >
                  {perm.module}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    title="Edit"
                    onClick={() => handleEdit(perm)}
                    className={`inline-flex cursor-pointer items-center ${accentColor} hover:opacity-75 transition duration-150 p-1 rounded-full`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    title="Delete"
                    onClick={() => handleDelete(perm)}
                    className="inline-flex cursor-pointer items-center text-red-500 hover:opacity-75 transition duration-150 p-1 rounded-full ml-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`flex justify-center items-center py-4 ${inactiveText}`}>
        <p className="text-sm">
          Showing {permissions.length} of {permissions.length} permissions.
        </p>
      </div>

      {/* Delete Modal */}
      {deletePermission && (
        <DeleteUserModal
          user={deletePermission}
          onClose={() => setDeletePermission(null)}
          onSuccess={fetchPermissions}
        />
      )}
    </div>
  );
};

export default Permission;
