// import prisma from "@/config/db";
// import { verifyToken } from "../verifyToken/verifyToken";
// import { checkPermission } from "../permissions/CheckPermission";
// import { NextResponse } from "next/server";
// import { getPaginationParams } from "@/utils/paginationHelper";

// export async function GET(req) {
//   try {
//     const { user, error } = await verifyToken(req);
//     if (error) return NextResponse.json({ error }, { status: 401 });

//     const permissionCheck = await checkPermission(req, "Blog", "READ");
//     if (!permissionCheck.success) {
//       return NextResponse.json(
//         { error: "You do not have permission to read blogs" },
//         { status: 403 }
//       );
//     }

//     const { page, limit, skip } = getPaginationParams(req);
//     const { searchParams } = new URL(req.url);
//     const statusParam = searchParams.get("status"); // PUBLISHED, DRAFT, ARCHIVED
//     const search = searchParams.get("search") || "";

//     // Build where condition
//     let whereCondition = {};

//     if (statusParam === "PUBLISHED") {
//       // All published blogs visible to everyone
//       whereCondition = {
//         status: "PUBLISHED",
//         ...(search ? { title: { contains: search } } : {}),
//       };
//     } else {
//       // DRAFT or ARCHIVED → only creator can see
//       whereCondition = {
//         status: statusParam,
//         authorId: user.id,
//         ...(search ? { title: { contains: search } } : {}),
//       };
//     }

//     const totalCount = await prisma.blog.count({ where: whereCondition });
//     console.log(totalCount, "totalCount");
//     const blogs = await prisma.blog.findMany({
//       where: whereCondition,
//       include: { author: { select: { id: true, name: true, email: true } } },
//       orderBy: { createdAt: "desc" },
//       skip: skip || 0,
//       take: limit || undefined,
//     });

//     return NextResponse.json(
//       {
//         data: blogs,
//         page,
//         limit: limit || totalCount,
//         totalCount,
//         totalPages: limit ? Math.ceil(totalCount / limit) : 1,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching blogs:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import prisma from "@/config/db";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { NextResponse } from "next/server";
import { getPaginationParams } from "@/utils/paginationHelper";

export async function GET(req) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    // Check permission (non-admins)
    const isAdmin = user.roleName === "Admin";
    if (!isAdmin) {
      const permissionCheck = await checkPermission(req, "Blog", "READ");
      if (!permissionCheck.success) {
        return NextResponse.json(
          { error: "You do not have permission to read blogs" },
          { status: 403 }
        );
      }
    }

    // Pagination
    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status"); // PUBLISHED, DRAFT, ARCHIVED
    const search = searchParams.get("search") || "";

    // Build where condition
    let whereCondition = {};

    if (statusParam) {
      // Only include status if defined
      whereCondition.status = statusParam;
    }

    if (!isAdmin) {
      // Non-admin users: restrict DRAFT/ARCHIVED to their own blogs
      if (statusParam !== "PUBLISHED") {
        whereCondition.authorId = user.id;
      }
    }

    if (search) {
      whereCondition.title = { contains: search };
    }

    // Fetch total count
    const totalCount = await prisma.blog.count({ where: whereCondition });

    // Fetch blogs with pagination
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
