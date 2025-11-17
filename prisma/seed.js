// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// const prisma = new PrismaClient();

// export async function main() {
//   try {
//     // 1️⃣ Define default permissions and roles
//     const defaultPermissions = ["Blog", "Reports", "Users", "Roles"];
//     const defaultRoles = ["Admin", "Developer", "Editor", "User"];

//     // 2️⃣ Create permissions dynamically
//     const permissions = [];
//     for (const permName of defaultPermissions) {
//       let permission = await prisma.permission.upsert({
//         where: { name: permName },
//         update: {},
//         create: { name: permName },
//       });
//       permissions.push(permission);
//       console.log(`Permission ensured: ${permName}`);
//     }

//     // 3️⃣ Create roles dynamically
//     const roles = {};
//     for (const roleName of defaultRoles) {
//       let role = await prisma.role.upsert({
//         where: { name: roleName },
//         update: {},
//         create: { name: roleName },
//       });
//       roles[roleName] = role;
//       console.log(`Role ensured: ${roleName}`);
//     }

//     // 4️⃣ Assign **all permissions** to Admin role
//     const adminRole = roles["Admin"];
//     for (const perm of permissions) {
//       await prisma.rolePermission.upsert({
//         where: {
//           roleId_permissionId: {
//             roleId: adminRole.id,
//             permissionId: perm.id,
//           },
//         },
//         update: {},
//         create: { roleId: adminRole.id, permissionId: perm.id },
//       });
//       console.log(`Permission "${perm.name}" assigned to Admin`);
//     }

//     // 5️⃣ Create Admin user from environment variables
//     const adminEmail = process.env.ADMIN_EMAIL;
//     const adminPassword = process.env.ADMIN_PASSWORD;
//     if (!adminEmail || !adminPassword) {
//       throw new Error(
//         "ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables"
//       );
//     }

//     const existingAdmin = await prisma.user.findUnique({
//       where: { email: adminEmail },
//     });

//     if (!existingAdmin) {
//       const hashedPassword = await bcrypt.hash(adminPassword, 10);
//       await prisma.user.create({
//         data: {
//           name: "Admin",
//           email: adminEmail,
//           password: hashedPassword,
//           isFirstLogin: false,
//           roleId: adminRole.id,
//         },
//       });
//       console.log(`Admin user created with email: ${adminEmail}`);
//     } else {
//       console.log("Admin user already exists");
//     }

//     console.log("Seeding completed successfully ✅");
//   } catch (error) {
//     console.error("Seeding failed:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();

import { PrismaClient, ActionType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function main() {
  try {
    console.log("🚀 Starting Admin Seeder...");

    // 1️⃣ Define default permission modules
    const defaultPermissions = ["Users", "Roles", "Blog", "Reports"];

    // 2️⃣ Define roles
    const defaultRoles = ["Admin", "Developer", "Editor", "User"];

    // 3️⃣ Get all action types from Prisma ENUM
    const actionTypes = Object.values(ActionType);
    // ["CREATE", "READ", "UPDATE", "DELETE"]

    // --------------------------------------------------------
    // 📌 Create Permissions
    // --------------------------------------------------------

    const permissions = [];
    for (const permName of defaultPermissions) {
      const perm = await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: { name: permName },
      });

      permissions.push(perm);
      console.log(`✔ Permission ensured: ${permName}`);
    }

    // --------------------------------------------------------
    // 📌 Create Roles
    // --------------------------------------------------------

    const roles = {};
    for (const roleName of defaultRoles) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });

      roles[roleName] = role;
      console.log(`✔ Role ensured: ${roleName}`);
    }

    // --------------------------------------------------------
    // 📌 Assign All Permissions + All Actions to Admin
    // --------------------------------------------------------

    const adminRole = roles["Admin"];

    for (const perm of permissions) {
      // Ensure RolePermission exists
      const rp = await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });

      console.log(`➡ Assigned module "${perm.name}" to Admin`);

      // 🔥 Create missing actions inside rolePermission
      for (const action of actionTypes) {
        await prisma.action.upsert({
          where: {
            rolePermissionId_type: {
              rolePermissionId: rp.id,
              type: action,
            },
          },
          update: {},
          create: {
            type: action,
            rolePermissionId: rp.id,
          },
        });

        console.log(`   ✔ Action ${action} added for ${perm.name}`);
      }
    }

    // --------------------------------------------------------
    // 📌 Create Admin User
    // --------------------------------------------------------

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          isFirstLogin: false,
          roleId: adminRole.id,
        },
      });

      console.log(`👑 Admin user created: ${adminEmail}`);
    } else {
      console.log("ℹ Admin user already exists, skipping creation.");
    }

    console.log("🎉 Admin Seeding Completed Successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
