import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { checkPermission } from "../permissions/CheckPermission";
import { verifyToken } from "../verifyToken/verifyToken";

export async function GET(req) {
  try {
    // 1 Verify JWT
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    // 2 Check permissions
    const permissionCheck = await checkPermission(req, "Roles", "READ");
    if (!permissionCheck.success) return permissionCheck;

    // 3 Extract query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limitParam = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";

    // 4 Handle "All" option for limit
    const limit = limitParam === "All" ? undefined : parseInt(limitParam);
    const skip = limit ? (page - 1) * limit : undefined;

    const totalCount = await prisma.role.count({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : {},
    });

    const roles = await prisma.role.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : {},
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        permissions: {
          include: {
            permission: true,
            actions: true,
          },
        },
      },
    });

    // 7️⃣ Format roles for frontend
    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((rp) => rp.permission.name),
    }));

    // 8️⃣ Return JSON
    return NextResponse.json(
      {
        message: "Roles fetched successfully",
        roles: formattedRoles,
        totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
