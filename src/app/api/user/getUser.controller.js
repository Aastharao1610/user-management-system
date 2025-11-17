import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";

export async function GET(req) {
  try {
    // 1️⃣ Verify user token
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    // 2️⃣ Permission check
    const permissionCheck = await checkPermission(req, "Users", "READ");
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    // 3️⃣ Extract query params
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit") || "10";
    const search = searchParams.get("search")?.trim() || "";

    // Convert limit → numeric
    const limit = limitParam === "All" ? null : Number(limitParam);
    const skip = limit ? (page - 1) * limit : 0;

    // 4️⃣ Build where condition
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    // 5️⃣ Fetch total count (for pagination UI)
    const totalUsers = await prisma.user.count({ where });

    // 6️⃣ Fetch paginated users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      skip: limit ? skip : undefined,
      take: limit ? limit : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
        pagination: {
          totalUsers,
          page,
          limit: limit || totalUsers,
          totalPages: limit ? Math.ceil(totalUsers / limit) : 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
