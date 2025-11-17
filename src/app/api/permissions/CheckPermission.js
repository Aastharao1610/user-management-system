import prisma from "@/config/db.js";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";

export async function checkPermission(req, moduleName, actionType) {
  try {
    // 🔹 Step 1: Verify token
    const verified = await verifyToken(req);
    if (!verified.success) return NextResponse.json(verified, { status: 401 });

    const user = verified.user;

    // 🔹 Step 2: Admins have full access
    if (user.role === "Admin" || user.roleName === "Admin") {
      console.log("Admin bypass permission check");
      return { success: true, message: "Admin has full access" };
    }

    // 🔹 Step 3: Fetch role-permission-action mapping by role name (since you have role: "Editor")
    const role = await prisma.role.findUnique({
      where: { name: user.role },
      include: {
        permissions: {
          include: {
            permission: true,
            actions: true,
          },
        },
      },
    });

    if (!role) {
      console.warn(` Role '${user.role}' not found in database`);
      return { success: false, message: "Role not found" };
    }

    // 🔹 Step 4: Check if user has permission for the given module
    const rolePerm = role.permissions.find(
      (rp) => rp.permission.name.toLowerCase() === moduleName.toLowerCase()
    );

    if (!rolePerm) {
      return { success: false, message: "No permission for this module" };
    }

    // 🔹 Step 5: Check if action (CREATE/READ/UPDATE/DELETE) is allowed
    const hasAction = rolePerm.actions.some(
      (a) => a.type.toLowerCase() === actionType.toLowerCase()
    );

    return hasAction
      ? { success: true }
      : { success: false, message: "Action not allowed" };
  } catch (err) {
    console.error("Permission check failed:", err);
    return { success: false, message: "Permission check failed" };
  }
}
