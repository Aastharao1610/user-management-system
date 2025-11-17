import prisma from "@/config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: {
        permission: true,
        actions: true,
      },
    });

    const formattedPermissions = rolePermissions.map((rp) => ({
      permissionName: rp.permission.name,
      allowedActions: rp.actions.map((a) => a.type),
    }));

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        roleName: user.role?.name,
        permissions: formattedPermissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const response = NextResponse.json(
      {
        message: "Login Successful",
        role: user.role?.name,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name,
          permissions: formattedPermissions,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(" Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
