import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { checkPermission } from "../permissions/CheckPermission";
import { verifyToken } from "../verifyToken/verifyToken";
import { logAction } from "../helper/logAction";

export async function PUT(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Roles", "UPDATE");
    if (!permissionCheck.success) return permissionCheck;

    const { roleId, roleName, permissions } = await req.json();
    if (!roleId || !roleName || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Invalid input: roleId, roleName, and permissions required." },
        { status: 400 }
      );
    }

    const roleIdInt = parseInt(roleId, 10);
    if (isNaN(roleIdInt)) {
      return NextResponse.json(
        { error: "Invalid Role ID format." },
        { status: 400 }
      );
    }

    const validPermissions = (permissions || []).filter(
      (p) => p.permissionId && Array.isArray(p.allowedActions)
    );

    await prisma.role.update({
      where: { id: roleIdInt },
      data: { name: roleName.trim() },
    });

    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: roleIdInt },
      include: { actions: true },
    });

    const incomingPermissionIds = validPermissions.map((p) => p.permissionId);

    // 3️⃣ Delete permissions that were removed
    const toDelete = existingRolePermissions.filter(
      (erp) => !incomingPermissionIds.includes(erp.permissionId)
    );
    for (const del of toDelete) {
      await prisma.action.deleteMany({ where: { rolePermissionId: del.id } });
      await prisma.rolePermission.delete({ where: { id: del.id } });
    }

    // 4️⃣ Add new permissions or update existing ones
    for (const p of validPermissions) {
      const existing = existingRolePermissions.find(
        (erp) => erp.permissionId === p.permissionId
      );

      if (existing) {
        // Update actions: delete old actions and create new ones
        await prisma.action.deleteMany({
          where: { rolePermissionId: existing.id },
        });
        const actionsToCreate = (p.allowedActions || []).map((type) => ({
          type,
          rolePermissionId: existing.id,
        }));
        await prisma.action.createMany({ data: actionsToCreate });
      } else {
        // Create new rolePermission
        const newRolePermission = await prisma.rolePermission.create({
          data: { roleId: roleIdInt, permissionId: p.permissionId },
        });
        const actionsToCreate = (p.allowedActions || []).map((type) => ({
          type,
          rolePermissionId: newRolePermission.id,
        }));
        await prisma.action.createMany({ data: actionsToCreate });
      }
    }

    // 5️⃣ Fetch updated role with permissions & actions
    const updatedRole = await prisma.role.findUnique({
      where: { id: roleIdInt },
      include: {
        permissions: {
          include: { permission: true, actions: true },
        },
      },
    });
    console.log(updatedRole, "updateRole");

    // 6️⃣ Log action

    // 6️⃣ Prepare permission names for logging
    const permissionDetails = await Promise.all(
      validPermissions.map(async (p) => {
        const perm = await prisma.permission.findUnique({
          where: { id: p.permissionId },
          select: { name: true },
        });
        return `${perm?.name || `ID:${p.permissionId}`} [${(
          p.allowedActions || []
        ).join(", ")}]`;
      })
    );

    // 7️⃣ Log action
    await logAction({
      actionType: "UPDATE",
      entityType: "Role",
      entityId: user.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} updated role "${
        updatedRole.name
      }" with permissions: ${permissionDetails.join("; ")}`,
    });

    return NextResponse.json(
      { message: "Role and permissions updated successfully", updatedRole },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
