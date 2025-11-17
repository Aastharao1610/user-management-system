"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CreateRoleModal } from "@/app/(Ui)/components/Modals/roleModal";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { DeleteRoleModal } from "@/app/(Ui)/components/Modals/DeleteRole";
import { useUserPermissions } from "@/hooks/usePermission";
import { toast } from "react-toastify";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import Pagination from "@/app/(Ui)/components/common/page";

export const Role = ({ themeClasses = {} }) => {
  const {
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    text = "text-black",
    bg = "bg-white",
    border = "border-gray-200",
  } = themeClasses;

  const { loading, permissions } = useUserPermissions();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteModalRole, setDeleteModalRole] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const usersPermission = permissions.find((p) => p.name === "Roles") || {
    allowedActions: [],
  };

  const tableBg = bg === "bg-gray-900" ? "bg-gray-800" : "bg-white";

  // API CALL
  const getRoles = async (pageNumber = 1, pageLimit = 10, searchQuery = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/rolepermission", {
        params: { page: pageNumber, limit: pageLimit, search: searchQuery },
      });

      if (response.status === 200) {
        const {
          roles: fetchedRoles = [],
          totalPages,
          totalCount,
        } = response.data;

        setRoles(
          fetchedRoles.map((role) => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions || [],
          }))
        );

        setTotalPages(totalPages);
        setTotalRecords(totalCount);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      getRoles(1, limit, search);
      setPage(1);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // Pagination fetch
  useEffect(() => {
    getRoles(page, limit, search);
  }, [page, limit]);

  return (
    <>
      {!usersPermission.allowedActions.includes("READ") ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-semibold text-gray-400">
            You don’t have permission to view roles.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* MODALS */}
          {isRoleModalOpen && (
            <CreateRoleModal
              isOpen={isRoleModalOpen}
              onClose={() => {
                setIsRoleModalOpen(false);
                setSelectedRole(null);
              }}
              roleToEdit={selectedRole}
              onSuccess={getRoles}
              themeClasses={themeClasses}
              usersPermission={usersPermission}
            />
          )}

          {deleteModalRole && (
            <DeleteRoleModal
              role={deleteModalRole}
              onClose={() => setDeleteModalRole(null)}
              onSuccess={getRoles}
            />
          )}

          {/* SEARCH + ADD BUTTON */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full p-2 pl-10 rounded-lg border ${border} ${tableBg} ${text}`}
              />
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${inactiveText}`}
              />
            </div>

            {usersPermission.allowedActions.includes("CREATE") && (
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setIsRoleModalOpen(true);
                }}
                className={`flex cursor-pointer items-center space-x-2 py-2 px-4 text-white ${accentColor.replace(
                  "text",
                  "bg"
                )} rounded-lg`}
              >
                <Plus className="w-5 h-5" />
                <span>Add New Role</span>
              </button>
            )}
          </div>

          {/* TABLE */}
          <div
            className={`overflow-x-auto rounded-xl shadow-lg border ${border} ${tableBg}`}
          >
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={bg}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                    Role Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase hidden md:table-cell">
                    Permissions
                  </th>
                  {(usersPermission.allowedActions.includes("UPDATE") ||
                    usersPermission.allowedActions.includes("DELETE")) && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="p-4">
                      <UserSkeleton />
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-400">
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr key={role.id}>
                      <td className="px-4 py-4 text-sm opacity-60">
                        {(page - 1) * limit + index + 1}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium">
                        {role.name}
                      </td>

                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <div className="flex flex-wrap justify-center gap-1">
                          {role.permissions.map((perm, idx) => (
                            <span
                              key={idx}
                              className="text-sm text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>

                      {(usersPermission.allowedActions.includes("UPDATE") ||
                        usersPermission.allowedActions.includes("DELETE")) && (
                        <td className="px-4 py-4 text-right">
                          {usersPermission.allowedActions.includes(
                            "UPDATE"
                          ) && (
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setIsRoleModalOpen(true);
                              }}
                              className={`${accentColor} p-1 rounded-full cursor-pointer`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {usersPermission.allowedActions.includes(
                            "DELETE"
                          ) && (
                            <button
                              onClick={() => setDeleteModalRole(role)}
                              className="text-red-500 cursor-pointer p-1 rounded-full ml-1"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
      )}
    </>
  );
};

export default Role;
