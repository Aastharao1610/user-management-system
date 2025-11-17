import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";

export async function GET(request) {
  const { user, error } = await verifyToken(request);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
      })),
    }));

    return NextResponse.json(
      {
        message: "All roles with permissions fetched successfully",
        roles: formattedRoles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching roles with permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
