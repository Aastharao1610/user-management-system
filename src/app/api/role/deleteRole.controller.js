import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";

export async function DELETE(req) {
  try {
    const permissionCheck = await checkPermission(req, "Roles", "DELETE");
    if (!permissionCheck.success) return permissionCheck;
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const existingRole = await prisma.role.findUnique({
      where: { name },
      include: { users: true, permissions: true },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const roleId = existingRole.id;

    if (existingRole.users.length > 0) {
      await prisma.user.deleteMany({
        where: { roleId },
      });
    }

    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Finally, delete the role itself
    await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json(
      { message: `Role '${name}' deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
