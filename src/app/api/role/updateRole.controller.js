import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";

export async function PUT(request) {
  try {
    const { user, error } = await verifyToken(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { id, name } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Role Id is required" },
        { status: 404 }
      );
    }
    const existingRole = await prisma.role.findUnique({
      where: {
        id,
      },
    });
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const UpdateRole = await prisma.role.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(
      { message: "Role updated successfully", role: UpdateRole },
      { status: 200 }
    );
  } catch (error) {
    console.error("You got some issue in updating role", error);
    return NextResponse.json(
      { error: "Internal server Error" },
      { status: 500 }
    );
  }
}
