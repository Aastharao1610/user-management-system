"use client";
import React, { useState, useEffect } from "react";
import { CreateUserModal } from "@/app/(Ui)/components/Modals/userModal";
import DeleteUserModal from "@/app/(Ui)/components/Modals/DeleteUser";
import { Edit, Trash, Search, Plus } from "lucide-react";
import axios from "axios";
import { useUserPermissions } from "@/hooks/usePermission";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import Pagination from "@/app/(Ui)/components/common/page";

export const User = ({ themeClasses = {} }) => {
  const {
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    hover = "cursor-pointer",
    text = "text-black",
    bg = "bg-white",
    border = "border-gray-200",
  } = themeClasses;

  const { loading, permissions } = useUserPermissions();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");

  const usersPermission = permissions.find((p) => p.name === "Users") || {
    allowedActions: [],
  };
  const handleSearch = (term) => {
    console.log(term);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/user", {
        params: {
          page,
          limit,
          search,
        },
      });

      if (res.status !== 200)
        throw new Error(res.data.error || "Failed to fetch users");

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages);
      setTotalRecords(res.data.totalCount);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  if (loading) return <UserSkeleton />;
  if (error) return <p className="text-red-500">{error}</p>;

  const tableBg = bg === "bg-gray-900" ? "bg-gray-800" : "bg-white";

  const handleEdit = (user) => {
    setEditUser(user);
    setIsModalOpen(true);
  };
  const numericLimit = limit === "All" ? null : Number(limit);

  return (
    <div className="space-y-6">
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditUser(null);
        }}
        themeClasses={themeClasses}
        existingUser={editUser}
        onSuccess={fetchUsers}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setPage(1); // Reset page on search
              handleSearch(e.target.value);
              setSearch(e.target.value);
            }}
            className={`w-full p-2 pl-10 rounded-lg border ${border} ${tableBg} ${text} text-sm focus:ring-2 ${accentColor.replace(
              "text",
              "focus:ring"
            )} focus:border-transparent transition duration-200`}
          />
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${inactiveText}`}
          />
        </div>

        {usersPermission.allowedActions.includes("CREATE") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex cursor-pointer items-center space-x-2 py-2 px-4 rounded-lg font-semibold text-white ${accentColor.replace(
              "text",
              "bg"
            )} transition duration-200 hover:opacity-90 shadow-md`}
          >
            <Plus className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {usersPermission.allowedActions.includes("READ") && (
        <div className={`rounded-xl shadow-lg border ${border} ${tableBg}`}>
          <table className="w-full divide-y divide-gray-700">
            <thead className={`${bg}`}>
              <tr>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${inactiveText}`}
                >
                  ID
                </th>
                <th
                  className={`px-3 py-3 text-left text-xs font-medium ${inactiveText}`}
                >
                  User
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${inactiveText} hidden sm:table-cell`}
                >
                  Email
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${inactiveText} hidden md:table-cell`}
                >
                  Role
                </th>
                {(usersPermission.allowedActions.includes("UPDATE") ||
                  usersPermission.allowedActions.includes("DELETE")) && (
                  <th
                    className={`px-3 py-3 text-right text-xs font-medium ${inactiveText}`}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {users.map((user, index) => (
                <tr key={user.id} className={hover}>
                  <td className={`px-4 py-4 text-sm font-medium ${text}`}>
                    {/* {limit ? (page - 1) * limit + index + 1 : index + 1} */}
                    {numericLimit
                      ? (page - 1) * numericLimit + index + 1
                      : index + 1}

                    {console.log(
                      numericLimit
                        ? (page - 1) * numericLimit + index + 1
                        : index + 1
                    )}
                  </td>

                  <td className="px-3 py-4">
                    <div className={`text-sm font-medium ${text}`}>
                      {user.name}
                    </div>
                    <div className={`text-xs ${inactiveText} block sm:hidden`}>
                      {user.email}
                    </div>
                  </td>

                  <td
                    className={`px-4 py-4 text-sm ${inactiveText} hidden sm:table-cell`}
                  >
                    {user.email}
                  </td>

                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`px-2 text-xs font-semibold`}>
                      {user.role?.name || "No Role"}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-right">
                    {usersPermission.allowedActions.includes("UPDATE") && (
                      <button
                        onClick={() => handleEdit(user)}
                        className={`p-1 cursor-pointer rounded-full ${accentColor}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {usersPermission.allowedActions.includes("DELETE") && (
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1 cursor-pointer rounded-full ml-1 text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={fetchUsers}
        />
      )}
      {totalRecords > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          setLimit={setLimit}
          totalRecords={totalRecords}
        />
      )}
    </div>
  );
};

export default User;
