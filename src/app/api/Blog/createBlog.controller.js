import prisma from "@/config/db";
import { verifyToken } from "../verifyToken/verifyToken";
import { NextResponse } from "next/server";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function POST(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Blog", "CREATE");
    if (!permissionCheck.success)
      return NextResponse.json(
        { error: "You do not have permission to create blogs" },
        { status: 403 }
      );

    const { title, content, status } = await req.json();

    if (!title || !content)
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );

    const validStatus = ["DRAFT", "PUBLISHED"];
    const blogStatus = validStatus.includes(status) ? status : "DRAFT";

    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        status: blogStatus,
        authorId: user.id,
      },
    });

    await logAction({
      actionType: "CREATE",
      entityType: "Blog",
      entityId: newBlog.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${
        user.name || user.email
      } created a new blog titled "${title}"`,
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog: newBlog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
