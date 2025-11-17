import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";

export async function POST(request) {
  try {
    const { user, error } = await verifyToken(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }
    const existingRole = await prisma.role.findUnique({
      where: {
        name,
      },
    });
    if (existingRole) {
      return NextResponse.json(
        { error: "Role already exist" },
        { status: 409 }
      );
    }
    const newRole = await prisma.role.create({
      data: {
        name,
      },
    });
    return NextResponse.json(
      { message: "Role created successfully ", role: newRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in Creating role", error);
    return NextResponse.json(
      { error: "Internal server error " },
      { status: 500 }
    );
  }
}
