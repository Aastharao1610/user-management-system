"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const CreatePermissionModal = ({
  isOpen,
  onClose,
  permissionToEdit = null,
  onSuccess,
  isDarkMode = false,
  themeClasses = {},
}) => {
  const { border = "border-gray-300", accentColor = "text-indigo-600" } =
    themeClasses;

  const modalBg = "bg-white";
  const text = "text-gray-900";

  const [moduleName, setModuleName] = useState("");
  const [actionName, setActionName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (permissionToEdit) {
      setModuleName(permissionToEdit.module || "");
      setActionName(permissionToEdit.action || "");
      setDescription(permissionToEdit.description || "");
    } else {
      setModuleName("");
      setActionName("");
      setDescription("");
    }
  }, [permissionToEdit]);

  // 2️⃣ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!moduleName.trim() || !actionName.trim()) {
      toast.warn("Module and Action are required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        module: moduleName.trim(),
        action: actionName.trim(),
        description: description.trim(),
      };
      console.log("Payload Sent:", payload);

      let res;
      if (permissionToEdit) {
        // Update existing permission
        res = await axios.put("/api/permissions", {
          id: permissionToEdit.id,
          ...payload,
        });
      } else {
        // Create new permission
        res = await axios.post("/api/permissions", payload);
      }

      console.log("Response:", res);

      if (res.status === 200 || res.status === 201) {
        toast.success(
          permissionToEdit
            ? "Permission updated successfully!"
            : "Permission created successfully!"
        );
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const createBtnColor = isDarkMode
    ? "bg-indigo-400 hover:bg-indigo-500"
    : "bg-indigo-600 hover:bg-indigo-700";
  const updateBtnColor = isDarkMode
    ? "bg-green-400 hover:bg-green-500"
    : "bg-green-600 hover:bg-green-700";
  const buttonColor = permissionToEdit ? updateBtnColor : createBtnColor;
  const buttonText = permissionToEdit
    ? isLoading
      ? "Updating..."
      : "Update Permission"
    : isLoading
    ? "Creating..."
    : "Create Permission";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md bg-opacity-75 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-xl ${modalBg} p-6 shadow-2xl border ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-2xl font-semibold mb-6 ${text}`}>
          {permissionToEdit ? "Edit Permission" : "Create Permission"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Module Name
            </label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="e.g., Blog, User, Role"
              className={`w-full p-3 rounded-lg border ${border} text-base ${text}`}
            />
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Action
            </label>
            <input
              type="text"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              placeholder="e.g., create, edit, delete"
              className={`w-full p-3 rounded-lg border ${border} text-base ${text}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this permission"
              className={`w-full p-3 rounded-lg border ${border} text-base ${text}`}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg cursor-pointer text-white font-semibold ${buttonColor} ${
                isLoading ? "cursor-not-allowed opacity-70" : ""
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
