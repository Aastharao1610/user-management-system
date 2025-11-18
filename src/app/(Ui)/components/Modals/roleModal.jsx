"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const CreateRoleModal = ({
  isOpen,
  onClose,
  roleToEdit = null,
  onSuccess,
  isDarkMode = false,
  themeClasses = {},
}) => {
  const { border = "border-gray-300" } = themeClasses;
  const modalBg = "bg-white";
  const text = "text-gray-900";

  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const ALL_ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE"];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/permissions");
        if (res.status === 200) setPermissions(res.data.permissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions.");
      }
    };
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (roleToEdit) {
      console.log("Editing Role:", roleToEdit);
      setRoleName(roleToEdit.name || "");

      // Normalize permissions array
      const normalizedPermissions = (roleToEdit.rolePermissions || []).map(
        (rp) => ({
          permissionId: rp.permissionId ?? rp.permission?.id,
          allowedActions:
            rp.allowedActions ||
            (rp.actions || []).map(
              (a) => a.type?.toUpperCase?.() || a.toUpperCase?.() || a
            ),
        })
      );

      console.log("Normalized Permissions:", normalizedPermissions);
      setSelectedPermissions(normalizedPermissions);
    } else {
      setRoleName("");
      setSelectedPermissions([]);
    }
  }, [roleToEdit]);

  const toggleAction = (permissionId, action) => {
    setSelectedPermissions((prev) => {
      const existing = prev.find((p) => p.permissionId === permissionId);
      if (existing) {
        const updatedActions = existing.allowedActions.includes(action)
          ? existing.allowedActions.filter((a) => a !== action)
          : [...existing.allowedActions, action];
        return prev.map((p) =>
          p.permissionId === permissionId
            ? { ...p, allowedActions: updatedActions }
            : p
        );
      } else {
        return [...prev, { permissionId, allowedActions: [action] }];
      }
    });
  };

  const isActionSelected = (permissionId, action) => {
    const perm = selectedPermissions.find(
      (p) => p.permissionId === permissionId
    );
    return perm ? perm.allowedActions.includes(action) : false;
  };
  const isBlogChecked = (permissionId) => {
    const perm = selectedPermissions.find(
      (p) => p.permissionId === permissionId
    );
    if (!perm) return false;

    const requiredActions = ["CREATE", "READ", "UPDATE", "DELETE"];
    return requiredActions.every((a) => perm.allowedActions.includes(a));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) return toast.warn("Role name is required");
    if (selectedPermissions.length === 0)
      return toast.warn("Select at least one action");

    setIsLoading(true);
    try {
      const payload = {
        roleName: roleName.trim(),
        permissions: selectedPermissions,
      };

      if (roleToEdit?.id) payload.roleId = String(roleToEdit.id);

      console.log("Payload to backend:", payload);

      const method = roleToEdit ? axios.put : axios.post;
      const url = "/api/rolepermission";
      const res = await method(url, payload);

      if (res.status === 200) {
        toast.success(
          roleToEdit
            ? "Role updated successfully!"
            : "Role created successfully!"
        );
        setRoleName("");
        setSelectedPermissions([]);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(
        error.response?.data?.error || "Something went wrong while saving role"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const buttonColor = roleToEdit
    ? isDarkMode
      ? "bg-green-400 hover:bg-green-500"
      : "bg-green-600 hover:bg-green-700"
    : isDarkMode
    ? "bg-indigo-400 hover:bg-indigo-500"
    : "bg-indigo-600 hover:bg-indigo-700";

  const buttonText = isLoading
    ? roleToEdit
      ? "Updating..."
      : "Creating..."
    : roleToEdit
    ? "Update Role"
    : "Create Role";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-xl ${modalBg} p-6 shadow-2xl border ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-2xl font-bold mb-6 ${text}`}>
          {roleToEdit ? "Edit Role" : "Create New Role"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">
              Role Name
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Content Manager"
              className={`w-full p-3 rounded-lg border ${border} ${text}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-500">
              Assign Permissions & Actions
            </label>
            <div
              className={`space-y-4 border ${border} rounded-lg p-4 max-h-80 overflow-y-auto`}
            >
              {/* {permissions.map((perm) => (
                <div key={perm.id} className="border-b pb-2 last:border-none">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {perm.name}
                  </h4>
                  <div className="flex flex-wrap gap-4 ml-2">
                    {ALL_ACTIONS.map((action) => (
                      <label
                        key={action}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isActionSelected(perm.id, action)}
                          onChange={() => toggleAction(perm.id, action)}
                        />
                        <span className="capitalize text-sm">
                          {action.toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))} */}
              {permissions.map((perm) => (
                <div key={perm.id} className="border-b pb-2 last:border-none">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {perm.name}
                  </h4>
                  <div className="flex items-center gap-4 ml-2">
                    {/* Only one checkbox for Blog */}
                    {perm.name === "Blog" ? (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          // checked={isActionSelected(perm.id, "CRUD")}
                          checked={isBlogChecked(perm.id)}
                          onChange={() => {
                            setSelectedPermissions((prev) => {
                              const existing = prev.find(
                                (p) => p.permissionId === perm.id
                              );
                              if (existing) {
                                return prev.filter(
                                  (p) => p.permissionId !== perm.id
                                );
                              } else {
                                // Add with full CRUD automatically
                                return [
                                  ...prev,
                                  {
                                    permissionId: perm.id,
                                    allowedActions: [
                                      "CREATE",
                                      "READ",
                                      "UPDATE",
                                      "DELETE",
                                    ],
                                  },
                                ];
                              }
                            });
                          }}
                        />
                        <span className="capitalize text-sm">Allow Blog</span>
                      </label>
                    ) : (
                      // For Reports or other modules, show filtered actions
                      ALL_ACTIONS.map((action) => {
                        if (perm.name === "Reports" && action !== "READ")
                          return null;
                        return (
                          <label
                            key={action}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isActionSelected(perm.id, action)}
                              onChange={() => toggleAction(perm.id, action)}
                            />
                            <span className="capitalize text-sm">
                              {action.toLowerCase()}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}

              {/* {permissions.map((perm) => (
                <div key={perm.id} className="border-b pb-2 last:border-none">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {perm.name}
                  </h4>
                  <div className="flex flex-wrap gap-4 ml-2">
                    {ALL_ACTIONS.map((action) => {
                      // Only allow READ for "Reports" permission
                      if (perm.name === "Reports" && action !== "READ")
                        return null;

                      return (
                        <label
                          key={action}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isActionSelected(perm.id, action)}
                            onChange={() => toggleAction(perm.id, action)}
                          />
                          <span className="capitalize text-sm">
                            {action.toLowerCase()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))} */}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : buttonColor
              }`}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
