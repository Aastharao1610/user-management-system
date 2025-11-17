import { NextResponse } from "next/server";
import { verifyToken } from "../../verifyToken/verifyToken";
import prisma from "@/config/db";

export async function GET(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedPermissions = currentUser.role.permissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      allowedActions: rp.actions.map((a) => a.type),
    }));

    return NextResponse.json(
      {
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role.name,
          permissions: formattedPermissions,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(" Error fetching user with role permissions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
