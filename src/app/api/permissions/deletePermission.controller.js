import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { logAction } from "../helper/logAction";
export async function DELETE(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    if (user.role.name !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden : Only admin can Delete permission" },
        { status: 403 }
      );
    }
    const { id } = await req.json();

    const existingPermission = await prisma.permission.findUnique({
      where: {
        id,
      },
    });
    if (!existingPermission) {
      return NextResponse.json(
        { error: "permission does not exist" },
        { status: 404 }
      );
    }
    const deletePermission = await prisma.permission.delete({
      where: {
        id,
      },
    });
    await logAction({
      actionType: "DELETE",
      entityType: "Permission",
      entityId: deletePermission.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new blog titled "${
        deletePermission.name
      }"`,
    });
    return NextResponse.json(
      { message: "permission Deleted Successfully", deletePermission },
      { status: 200 }
    );
  } catch (error) {
    console.error("Issue in deleting permission", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
