import { NextResponse } from "next/server";
import prisma from "@/config/db";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function DELETE(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Users", "DELETE");
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedUser = await prisma.user.delete({
      where: { email },
    });
    await logAction({
      actionType: "CREATE",
      entityType: "User",
      entityId: deletedUser.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} Deleted a user "${
        deletedUser.name
      }" with email "${deletedUser.email}" and role "${deletedUser.role.name}"`,
    });

    return NextResponse.json(
      {
        message: "User deleted successfully",
        user: deletedUser,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
