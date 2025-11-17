import prisma from "@/config/db.js";

export async function checkPermission(user, moduleName, action) {
  try {
    const roleWithPerms = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!roleWithPerms) return false;

    const targetPermission = roleWithPerms.rolePermissions.find(
      (rp) => rp.permission.name.toLowerCase() === moduleName.toLowerCase()
    );

    if (!targetPermission) return false;

    if (!targetPermission.permission.actions) return true;

    return targetPermission.permission.actions.includes(action);
  } catch (err) {
    console.error("Permission check failed:", err);
    return false;
  }
}
