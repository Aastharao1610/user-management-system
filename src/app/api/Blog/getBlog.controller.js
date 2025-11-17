import prisma from "@/config/db";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { NextResponse } from "next/server";
import { getPaginationParams } from "@/utils/paginationHelper";

export async function GET(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Blog", "READ");
    if (!permissionCheck.success) {
      return NextResponse.json(
        { error: "You do not have permission to read blogs" },
        { status: 403 }
      );
    }

    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status"); // PUBLISHED, DRAFT, ARCHIVED
    const search = searchParams.get("search") || "";

    // Build where condition
    let whereCondition = {};

    if (statusParam === "PUBLISHED") {
      // All published blogs visible to everyone
      whereCondition = {
        status: "PUBLISHED",
        ...(search ? { title: { contains: search } } : {}),
      };
    } else {
      // DRAFT or ARCHIVED → only creator can see
      whereCondition = {
        status: statusParam,
        authorId: user.id,
        ...(search ? { title: { contains: search } } : {}),
      };
    }

    const totalCount = await prisma.blog.count({ where: whereCondition });

    const blogs = await prisma.blog.findMany({
      where: whereCondition,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: skip || 0,
      take: limit || undefined,
    });

    return NextResponse.json(
      {
        data: blogs,
        page,
        limit: limit || totalCount,
        totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
