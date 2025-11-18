// "use client";
// import React, { useState } from "react";
// import { CreateRoleModal } from "@/app/(Ui)/components/Modals/roleModal";
// import { DeleteRoleModal } from "@/app/(Ui)/components/Modals/DeleteRole";
// import { Edit, Plus, Trash } from "lucide-react";
// import axios from "axios";
// import { useUserPermissions } from "@/hooks/usePermission";
// import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
// import PaginatedList from "@/app/(Ui)/components/paginatedList/paginatedList";

// export const Role = ({ themeClasses = {} }) => {
//   const {
//     accentColor = "text-indigo-600",
//     inactiveText = "text-gray-500",
//     text = "text-black",
//     bg = "bg-white",
//     border = "border-gray-200",
//     hover = "hover:bg-gray-50",
//   } = themeClasses;

//   const { loading, permissions } = useUserPermissions();
//   const rolesPermission = permissions.find((p) => p.name === "Roles") || {
//     allowedActions: [],
//   };

//   const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [deleteModalRole, setDeleteModalRole] = useState(null);

//   if (loading) return <UserSkeleton />;

//   // Fetch function for PaginatedList
//   const fetchRoles = async ({ page, limit, search }) => {
//     try {
//       const res = await axios.get("/api/rolepermission", {
//         params: { page, limit, search },
//       });

//       if (res.status !== 200) throw new Error("Failed to fetch roles");

//       const { roles: fetchedRoles = [], totalPages, totalCount } = res.data;

//       return {
//         data: fetchedRoles.map((role) => ({
//           id: role.id,
//           name: role.name,
//           permissions: role.permissions || [],
//         })),
//         totalPages,
//         totalCount,
//       };
//     } catch (err) {
//       console.error(err);
//       return { data: [], totalPages: 1, totalCount: 0 };
//     }
//   };

//   // Columns for table
//   const columns = [
//     { key: "id", label: "ID" },
//     { key: "name", label: "Role Name" },
//     { key: "permissions", label: "Permissions" },
//     { key: "actions", label: "Actions" },
//   ];

//   // Row render function
//   const renderRow = (role, index, styles) => {
//     const numericLimit = styles.limit === "All" ? null : Number(styles.limit);

//     return (
//       <tr key={role.id} className={styles.hover}>
//         <td className={`px-4 py-4 text-sm ${styles.text}`}>
//           {numericLimit
//             ? (styles.page - 1) * numericLimit + index + 1
//             : index + 1}
//         </td>
//         <td className={`px-4 py-4 text-sm font-medium ${styles.text}`}>
//           {role.name}
//         </td>
//         <td className="px-4 py-4 text-center hidden md:table-cell">
//           <div className="flex flex-wrap justify-center gap-1">
//             {role.permissions.map((perm, idx) => (
//               <span
//                 key={idx}
//                 className="text-sm text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full"
//               >
//                 {perm}
//               </span>
//             ))}
//           </div>
//         </td>
//         <td className="px-4 py-4 text-right flex">
//           {rolesPermission.allowedActions.includes("UPDATE") && (
//             <button
//               onClick={() => {
//                 setSelectedRole(role);
//                 setIsRoleModalOpen(true);
//               }}
//               className={`${styles.accentColor} p-1 rounded-full cursor-pointer`}
//             >
//               <Edit className="w-4 h-4" />
//             </button>
//           )}

//           {rolesPermission.allowedActions.includes("DELETE") && (
//             <button
//               onClick={() => setDeleteModalRole(role)}
//               className="text-red-500 cursor-pointer p-1 rounded-full ml-1"
//             >
//               <Trash className="w-4 h-4" />
//             </button>
//           )}
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <>
//       {/* Modals */}
//       {isRoleModalOpen && (
//         <CreateRoleModal
//           isOpen={isRoleModalOpen}
//           onClose={() => {
//             setIsRoleModalOpen(false);
//             setSelectedRole(null);
//           }}
//           roleToEdit={selectedRole}
//           onSuccess={() => {}}
//           themeClasses={themeClasses}
//           usersPermission={rolesPermission}
//         />
//       )}

//       {deleteModalRole && (
//         <DeleteRoleModal
//           role={deleteModalRole}
//           onClose={() => setDeleteModalRole(null)}
//           onSuccess={() => {}}
//         />
//       )}

//       {/* PaginatedList */}
//       <PaginatedList
//         fetchData={fetchRoles}
//         columns={columns}
//         renderRow={renderRow}
//         themeClasses={themeClasses}
//         createButton={
//           rolesPermission.allowedActions.includes("CREATE") && (
//             <button
//               onClick={() => {
//                 setSelectedRole(null);
//                 setIsRoleModalOpen(true);
//               }}
//               className={`flex items-center space-x-2 py-2 px-4 text-white ${accentColor.replace(
//                 "text",
//                 "bg"
//               )} rounded-lg`}
//             >
//               <Plus className="w-5 h-5" />
//               <span>Add New Role</span>
//             </button>
//           )
//         }
//       />
//     </>
//   );
// };

// export default Role;

"use client";
import React, { useState } from "react";
import { CreateRoleModal } from "@/app/(Ui)/components/Modals/roleModal";
import { DeleteRoleModal } from "@/app/(Ui)/components/Modals/DeleteRole";
import { Edit, Plus, Trash } from "lucide-react";
import axios from "axios";
import { useUserPermissions } from "@/hooks/usePermission";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import PaginatedList from "@/app/(Ui)/components/paginatedList/paginatedList";

export const Role = ({ themeClasses = {} }) => {
  const { accentColor = "text-indigo-600" } = themeClasses;

  const { loading, permissions } = useUserPermissions();
  const rolesPermission = permissions.find((p) => p.name === "Roles") || {
    allowedActions: [],
  };

  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [deleteModalRole, setDeleteModalRole] = useState(null);

  if (loading) return <UserSkeleton />;

  // Fetch function
  const fetchRoles = async ({ page, limit, search }) => {
    try {
      const res = await axios.get("/api/rolepermission", {
        params: { page, limit, search },
      });

      return {
        data: res.data.roles || [],
        totalPages: res.data.totalPages,
        totalCount: res.data.totalCount,
      };
    } catch (err) {
      console.error("Error fetching roles:", err);
      return { data: [], totalPages: 1, totalCount: 0 };
    }
  };

  // Columns (You don’t need actions column — reused inside component)
  const columns = [
    { key: "name", label: "Role Name" },
    { key: "permissions", label: "Permissions" },
  ];

  // Row cell renderer (returns only <td> cells, not <tr>)
  const renderRow = (role) => (
    <>
      <td className="px-4 py-4">{role.name}</td>

      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {(role.permissions || []).map((perm, idx) => (
            <span
              key={idx}
              className="text-sm text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded-full"
            >
              {perm}
            </span>
          ))}
        </div>
      </td>
    </>
  );

  // Actions (edit/delete)
  const actions = (role) => (
    <>
      {rolesPermission.allowedActions.includes("UPDATE") && (
        <button
          onClick={() => {
            setSelectedRole(role);
            setIsRoleModalOpen(true);
          }}
          className="text-blue-500 p-1"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {rolesPermission.allowedActions.includes("DELETE") && (
        <button
          onClick={() => setDeleteModalRole(role)}
          className="text-red-500 p-1 ml-1"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Create / Edit Modal */}
      {isRoleModalOpen && (
        <CreateRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setSelectedRole(null);
          }}
          roleToEdit={selectedRole}
          themeClasses={themeClasses}
        />
      )}

      {/* Delete Modal */}
      {deleteModalRole && (
        <DeleteRoleModal
          role={deleteModalRole}
          onClose={() => setDeleteModalRole(null)}
        />
      )}

      {/* Reusable Paginated List */}
      <PaginatedList
        fetchData={fetchRoles}
        columns={columns}
        renderRow={renderRow}
        actions={actions}
        themeClasses={themeClasses}
        createButton={
          rolesPermission.allowedActions.includes("CREATE") && (
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedRole(null);
                setIsRoleModalOpen(true);
              }}
            >
              Add Role
            </button>
          )
        }
      />
    </>
  );
};

export default Role;
