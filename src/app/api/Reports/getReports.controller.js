// import prisma from "@/config/db";
// import { NextResponse } from "next/server";
// import { verifyToken } from "../verifyToken/verifyToken";
// import { checkPermission } from "../permissions/CheckPermission";

// export async function GET(request) {
//   try {
//     const { error } = await verifyToken(request);
//     if (error) return NextResponse.json({ error }, { status: 401 });

//     const permissionCheck = await checkPermission(request, "Reports", "READ");
//     if (permissionCheck instanceof NextResponse) return permissionCheck;

//     const { searchParams } = new URL(request.url);

//     const page = Number(searchParams.get("page") || 1);
//     const limitRaw = searchParams.get("limit") || "10";
//     const search = searchParams.get("search") || "";

//     const limit = limitRaw === "All" ? null : Number(limitRaw);
//     const skip = limit ? (page - 1) * limit : undefined;

//     const where =
//       search.trim() === ""
//         ? {}
//         : {
//             OR: [
//               {
//                 description: {
//                   contains: search,
//                 },
//               },
//               {
//                 entityType: {
//                   contains: search,
//                 },
//               },
//               // {
//               //   actionType: {
//               //     contains: search,
//               //     mode: "insensitive",
//               //   },
//               // },
//             ],
//           };

//     console.log("WHERE FILTER:", where);

//     const totalReports = await prisma.report.count({ where });

//     const reports = await prisma.report.findMany({
//       where,
//       orderBy: { date: "desc" },
//       skip: skip ?? 0,
//       take: limit ?? undefined,
//     });
//     console.log(reports, "reports");

//     return NextResponse.json(
//       {
//         success: true,
//         totalReports,
//         totalPages: limit ? Math.ceil(totalReports / limit) : 1,
//         page,
//         Report: reports,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }

// }

import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";

export async function GET(request) {
  try {
    const { error } = await verifyToken(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(request, "Reports", "READ");
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limitRaw = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const dateFilter = searchParams.get("dateFilter") || "ALL";

    const limit = limitRaw === "All" ? null : Number(limitRaw);
    const skip = limit ? (page - 1) * limit : undefined;

    const where = {};

    if (search.trim() !== "") {
      where.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          entityType: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const today = new Date();

    if (dateFilter === "TODAY") {
      where.date = {
        gte: new Date(today.setHours(0, 0, 0, 0)),
      };
    }

    if (dateFilter === "WEEK") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      where.date = {
        gte: weekAgo,
      };
    }

    if (dateFilter === "MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      where.date = {
        gte: firstDay,
      };
    }

    const totalReports = await prisma.report.count({ where });

    const reports = await prisma.report.findMany({
      where,
      orderBy: { date: "desc" },
      skip: skip ?? 0,
      take: limit ?? undefined,
    });

    return NextResponse.json(
      {
        success: true,
        totalReports,
        totalPages: limit ? Math.ceil(totalReports / limit) : 1,
        page,
        Report: reports,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
