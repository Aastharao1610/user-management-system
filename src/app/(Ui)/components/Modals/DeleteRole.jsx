"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

export const DeleteRoleModal = ({ role, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete("/api/role", {
        data: { name: role.name },
      });

      if (res.status === 200) {
        toast.success("Role deleted successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      toast.error(err.response?.data?.error || "Failed to delete role");
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Confirm Delete
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete the role Deleting this role will also
          delete all users assigned to it. Are you sure?
          <span className="font-semibold text-red-600">{role.name}</span>?
          <br />
          This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg text-white bg-red-600 hover:bg-red-700 transition ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
