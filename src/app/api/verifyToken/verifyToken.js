import jwt from "jsonwebtoken";
import prisma from "@/config/db";

export async function verifyToken(req) {
  try {
    const authHeader =
      req.headers.get?.("authorization") || req.headers.get?.("Authorization");

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.get?.("token")?.value;

    if (!token) {
      return { success: false, error: "Access denied, no token provided" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const formattedPermissions = user.role.permissions.map((rp) => ({
      name: rp.permission.name,
      allowedActions: rp.actions.map((a) => a.type),
    }));

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: formattedPermissions,
      },
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    if (error.name === "TokenExpiredError") {
      return { success: false, error: "Token expired" };
    }
    return { success: false, error: "Invalid token" };
  }
}
