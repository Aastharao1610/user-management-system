import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const IconMap = {
  Loader: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
};

const Icon = ({ name, className }) => {
  return <span className={className}>{IconMap[name] || null}</span>;
};

export const CreateUserModal = ({
  isOpen,
  onClose,
  themeClasses,
  existingUser = null,
  onSuccess,
}) => {
  const {
    border = "border-gray-300",
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    text = "text-gray-900",
    bg = "bg-white",
  } = themeClasses;

  const modalBg = bg === "bg-gray-900" ? "bg-gray-800" : "bg-white";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: "",
  });
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingUser && roles.length > 0) {
      const userRoleName =
        typeof existingUser.role === "string"
          ? existingUser.role
          : existingUser.role?.name || "";

      const matchedRole = roles.find(
        (r) => r.name.toLowerCase() === userRoleName.toLowerCase()
      );

      setFormData({
        name: existingUser.name || "",
        email: existingUser.email || "",
        roleId: matchedRole ? matchedRole.id : "",
      });
    } else if (!existingUser) {
      setFormData({ name: "", email: "", roleId: "" });
    }
  }, [existingUser, roles, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const res = await axios.get("/api/role");
          setRoles(res.data.roles);
        } catch (error) {
          console.error("Error fetching roles:", error);
          toast.error("Unable to fetch roles");
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, roleId } = formData;

    if (!name.trim() || !email.trim() || !roleId) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      if (existingUser) {
        // ✳️ UPDATE USER
        const res = await axios.put("/api/user", {
          email: existingUser.email,
          newEmail: email,
          name,
          roleId: Number(roleId),
        });
        console.log(
          res,
          "Response of edit user modal to check where the issue is "
        );
        // Backend should check if email changed and send a mail automatically.
        toast.success(res.data.message || "User updated successfully");
      } else {
        // ➕ CREATE USER
        const res = await axios.post("/api/user", { name, email, roleId });
        toast.success(res.data.message || "User created successfully");
      }

      onSuccess?.(); // refresh table/list if callback passed
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          (existingUser ? "Failed to update user" : "Failed to create user")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const createBtnBase = `py-3 px-6 rounded-lg font-semibold text-white transition duration-200 shadow-md w-full`;
  const createBtnColor = "bg-indigo-600 hover:bg-indigo-700";
  const loadingBtnColor = "bg-indigo-400 text-white cursor-not-allowed";
  const inputStyle = `w-full p-3 rounded-lg border ${border} ${modalBg} ${text} text-sm focus:ring-2 ${accentColor.replace(
    "text",
    "focus:ring"
  )} focus:border-transparent transition duration-200`;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md bg-opacity-75 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-xl ${modalBg} p-6 shadow-2xl border ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-2xl font-bold mb-6 ${text}`}>
          {existingUser ? "Edit User" : "Create New User"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${inactiveText}`}>
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="John Doe"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${inactiveText}`}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="john.doe@example.com"
              disabled={!!existingUser} // 👈 optional: disable editing email
            />
          </div>

          {/* Role Field */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${inactiveText}`}>
              User Role
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className={inputStyle}
            >
              <option value="">Select a Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`py-3 px-6 rounded-lg font-semibold ${inactiveText} hover:bg-gray-100 transition duration-150`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={
                isLoading
                  ? `${createBtnBase} ${loadingBtnColor} flex items-center justify-center space-x-2`
                  : `${createBtnBase} ${createBtnColor}`
              }
            >
              {isLoading ? (
                <>
                  <Icon name="Loader" className="w-5 h-5 mr-2" />
                  <span>
                    {existingUser ? "Updating User..." : "Creating User..."}
                  </span>
                </>
              ) : (
                <span>{existingUser ? "Update User" : "Create User"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
