import { NextResponse } from "next/server";
import prisma from "@/config/db";
import { checkPermission } from "../permissions/CheckPermission";
import { verifyToken } from "../verifyToken/verifyToken";
import { logAction } from "../helper/logAction";

export async function POST(req) {
  try {
    console.log("Called /api/rolepermission POST");
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Roles", "CREATE");
    if (!permissionCheck.success) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: 403 }
      );
    }

    // ✅ Step 2: Parse request body
    const { roleName, permissions } = await req.json();
    if (!roleName || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // ✅ Step 3: Find or create role
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }

    // ✅ Step 4: Loop through new permissions
    for (const p of permissions) {
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: role.id,
          permissionId: p.permissionId,
        },
        include: { actions: true },
      });

      if (existingRolePermission) {
        console.log(
          `⚠️ Permission ID ${p.permissionId} already assigned to role ${roleName}, skipping.`
        );

        // ✅ Optionally: Update actions if new ones are missing
        const existingActions = existingRolePermission.actions.map(
          (a) => a.type
        );

        const newActions = (p.allowedActions || []).filter(
          (action) => !existingActions.includes(action)
        );

        if (newActions.length > 0) {
          await prisma.action.createMany({
            data: newActions.map((actionType) => ({
              type: actionType,
              rolePermissionId: existingRolePermission.id,
            })),
          });
          console.log(
            `✅ Added new actions [${newActions.join(", ")}] for permission ${
              p.permissionId
            }.`
          );
        }
      } else {
        // ✅ Step 5: Create new permission + actions
        const newRolePermission = await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: p.permissionId,
          },
        });

        const actionsToCreate = (p.allowedActions || []).map((actionType) => ({
          type: actionType,
          rolePermissionId: newRolePermission.id,
        }));

        if (actionsToCreate.length > 0) {
          await prisma.action.createMany({ data: actionsToCreate });
        }

        console.log(
          `✅ Added permission ${p.permissionId} with actions [${(
            p.allowedActions || []
          ).join(", ")}]`
        );
      }
    }

    await logAction({
      actionType: "CREATE",
      entityType: "Role",
      entityId: role.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new role "${
        role.name
      }" with permissions: ${permissions
        .map((p) => `${p.name} [${(p.allowedActions || []).join(", ")}]`)
        .join("; ")}`,
    });

    return NextResponse.json(
      { message: "Role permissions updated successfully", role },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating/updating role permissions:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
