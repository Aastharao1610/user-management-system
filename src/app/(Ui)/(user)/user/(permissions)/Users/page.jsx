// "use client";
// import React, { useState } from "react";
// import { CreateUserModal } from "@/app/(Ui)/components/Modals/userModal";
// import DeleteUserModal from "@/app/(Ui)/components/Modals/DeleteUser";
// import { Edit, Trash, Plus } from "lucide-react";
// import axios from "axios";
// import { useUserPermissions } from "@/hooks/usePermission";
// import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
// import PaginatedList from "@/app/(Ui)/components/paginatedList/paginatedList";

// export const User = ({ themeClasses = {} }) => {
//   const {
//     accentColor = "text-indigo-600",
//     inactiveText = "text-gray-500",
//     hover = "cursor-pointer",
//     text = "text-black",
//     bg = "bg-white",
//     border = "border-gray-200",
//   } = themeClasses;

//   const { loading, permissions } = useUserPermissions();
//   const usersPermission = permissions.find((p) => p.name === "Users") || {
//     allowedActions: [],
//   };
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [editUser, setEditUser] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [deleteModalRole, setDeleteModalRole] = useState(null);

//   const handleEdit = (user) => {
//     setEditUser(user);
//     setIsModalOpen(true);
//   };
//   const fetchUsers = async ({ page, limit, search }) => {
//     try {
//       const res = await axios.get("/api/user", {
//         params: { page, limit, search },
//       });

//       if (res.status !== 200) throw new Error(res.data.error || "Failed");

//       return {
//         data: res.data.users || [],
//         totalPages: res.data.totalPages,
//         totalCount: res.data.totalCount,
//       };
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       return { data: [], totalPages: 1, totalCount: 0 };
//     }
//   };
//   if (loading) return <UserSkeleton />;

//   return (
//     <>
//       <CreateUserModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         existingUser={editUser}
//         themeClasses={themeClasses}
//         onSuccess={() => {}}
//       />

//       {selectedUser && (
//         <DeleteUserModal
//           user={selectedUser}
//           onClose={() => setDeleteModalRole(null)}
//           onSuccess={() => {}}
//         />
//       )}
//       <PaginatedList
//         fetchData={fetchUsers}
//         columns={[
//           { key: "name", label: "Name" },
//           { key: "email", label: "Email" },
//           { key: "role", label: "Role" },
//         ]}
//         renderRow={(user) => (
//           <>
//             <td>{user.name}</td>
//             <td>{user.email}</td>
//             <td>{user.role?.name}</td>
//           </>
//         )}
//         actions={(user) => (
//           <>
//             <button
//               onClick={() => handleEdit(user)}
//               className="text-blue-500 cursor-pointer"
//             >
//               <Edit className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => setDeleteModalRole(user)}
//               className="text-red-500 cursor-pointer"
//             >
//               <Trash className="w-4 h-4" />
//             </button>
//           </>
//         )}
//         createButton={
//           <button className="btn-primary" onClick={() => openCreateModal(true)}>
//             Add User
//           </button>
//         }
//       />
//     </>
//   );
// };

// export default User;

"use client";
import React, { useState } from "react";
import { CreateUserModal } from "@/app/(Ui)/components/Modals/userModal";
import DeleteUserModal from "@/app/(Ui)/components/Modals/DeleteUser";
import { Edit, Trash } from "lucide-react";
import axios from "axios";
import { useUserPermissions } from "@/hooks/usePermission";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import PaginatedList from "@/app/(Ui)/components/paginatedList/paginatedList";

export const User = ({ themeClasses = {} }) => {
  const { loading, permissions } = useUserPermissions();

  const usersPermission = permissions.find((p) => p.name === "Users") || {
    allowedActions: [],
  };

  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalRole, setDeleteModalRole] = useState(null);

  const handleEdit = (user) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const fetchUsers = async ({ page, limit, search }) => {
    try {
      const res = await axios.get("/api/user", {
        params: { page, limit, search },
      });

      if (res.status !== 200) throw new Error(res.data.error || "Failed");

      return {
        data: res.data.users || [],
        totalPages: res.data.totalPages,
        totalCount: res.data.totalCount,
      };
    } catch (err) {
      console.error("Error fetching users:", err);
      return { data: [], totalPages: 1, totalCount: 0 };
    }
  };

  if (loading) return <UserSkeleton />;

  return (
    <>
      {/* Create / Edit Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingUser={editUser}
        themeClasses={themeClasses}
        onSuccess={() => {}}
      />

      {/* Delete Modal */}
      {deleteModalRole && (
        <DeleteUserModal
          user={deleteModalRole}
          onClose={() => setDeleteModalRole(null)}
          onSuccess={() => {}}
        />
      )}

      <PaginatedList
        fetchData={fetchUsers}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
        ]}
        renderRow={(user) => (
          <>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role?.name}</td>
          </>
        )}
        createButton={
          <button
            className="btn-primary"
            onClick={() => {
              setEditUser(null);
              setIsModalOpen(true);
            }}
          >
            Add User
          </button>
        }
        actions={(user) => (
          <>
            <button
              onClick={() => handleEdit(user)}
              className="text-blue-500 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDeleteModalRole(user)}
              className="text-red-500 cursor-pointer"
            >
              <Trash className="w-4 h-4" />
            </button>
          </>
        )}
      />
    </>
  );
};

export default User;
