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

// import prisma from "@/config/db";
// import { NextResponse } from "next/server";
// import { verifyToken } from "../verifyToken/verifyToken";

// // Utility function for pagination
// function getPaginationParams(searchParams) {
//   const page = parseInt(searchParams.get("page")) || 1;
//   const limit = parseInt(searchParams.get("limit")) || 10;
//   const skip = (page - 1) * limit;
//   return { page, limit, skip };
// }

// export async function GET(request) {
//   const { user, error } = await verifyToken(request);
//   if (error) return NextResponse.json({ error }, { status: 401 });

//   try {
//     const { searchParams } = new URL(request.url);
//     const { page, limit, skip } = getPaginationParams(searchParams);

//     // Optional search filter by role name
//     const search = searchParams.get("search") || "";

//     const whereCondition = search
//       ? { name: { contains: search, mode: "insensitive" } }
//       : {};

//     // Count total roles
//     const totalCount = await prisma.role.count({ where: whereCondition });

//     // Fetch paginated roles
//     const roles = await prisma.role.findMany({
//       where: whereCondition,
//       orderBy: { createdAt: "desc" },
//       skip,
//       take: limit,
//       include: {
//         permissions: {
//           include: { permission: true },
//         },
//       },
//     });

//     // Format roles
//     const formattedRoles = roles.map((role) => ({
//       id: role.id,
//       name: role.name,
//       createdAt: role.createdAt,
//       updatedAt: role.updatedAt,
//       permissions: role.permissions.map((rp) => ({
//         id: rp.permission.id,
//         name: rp.permission.name,
//         description: rp.permission.description,
//       })),
//     }));

//     return NextResponse.json(
//       {
//         message: "Roles fetched successfully",
//         roles: formattedRoles,
//         page,
//         limit,
//         totalCount,
//         totalPages: Math.ceil(totalCount / limit),
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching roles with permissions:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
