import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { logAction } from "../helper/logAction";
export async function POST(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });
    console.log(user, user.role);
    console.log(role);
    if (user.role.name !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin can create permission" },
        { status: 403 }
      );
    }

    const { name, description } = await req.json();

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json({ error: "name idrequired" }, { status: 400 });
    }

    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: `Permission "${name}" already exists` },
        { status: 409 }
      );
    }

    // Create new permission
    const newPermission = await prisma.permission.create({
      data: {
        name,
        description: description || null,
      },
    });
    await logAction({
      actionType: "CREATE",
      entityType: "Permission",
      entityId: newPermission.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new blog titled "${
        newPermission.name
      }"`,
    });

    return NextResponse.json(
      { message: "Permission created successfully", newPermission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Issue in creating permission", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
