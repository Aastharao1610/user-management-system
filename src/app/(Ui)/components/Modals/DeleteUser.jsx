"use client";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DeleteUserModal = ({ user, onClose, onSuccess }) => {
  const handleDelete = async () => {
    try {
      const res = await axios.delete("/api/user", {
        data: { email: user.email },
      });

      toast.success(res.data.message || "User deleted successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-[350px] text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Delete User
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <b>{user.name}</b>?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
