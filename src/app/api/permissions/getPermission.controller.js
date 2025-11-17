import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";

export async function GET(req) {
  try {
    const { error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Fetched all permissions successfully", permissions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
