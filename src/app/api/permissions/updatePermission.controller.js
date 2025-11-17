import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { logAction } from "../helper/logAction";

export async function PUT(req) {
  try {
    const { error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { id, description } = await req.json();
    if (!id || (!module && !description)) {
      return NextResponse.json(
        {
          error: "Permission ID and at least one field to update  are required",
        },
        { status: 400 }
      );
    }

    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!existingPermission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }
    const updateData = {
      description: description?.trim(),
    };

    const conflictingPermission = await prisma.permission.findFirst({
      where: {
        name: updateData.name,
        id: { not: id },
      },
    });

    if (conflictingPermission) {
      return NextResponse.json(
        {
          error: `The combination '${updateData.name}' already exists in another permission.`,
        },
        { status: 409 }
      );
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: updateData,
    });
    await logAction({
      actionType: "UPDATE",
      entityType: "Permission",
      entityId: updatedPermission.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new blog titled "${
        updatedPermission.name
      }"`,
    });

    return NextResponse.json(
      {
        message: "Permission updated successfully",
        permission: updatedPermission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
