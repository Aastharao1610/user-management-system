import prisma from "@/config/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function PUT(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Blog", "UPDATE");
    if (!permissionCheck.success)
      return NextResponse.json(
        { error: "You do not have permission to update blogs" },
        { status: 403 }
      );

    const body = await req.json();
    const { id, title, content, status } = body;
    if (!id)
      return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

    const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    if (!blog)
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    // Ownership check
    if (user.role !== "Admin" && blog.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own blogs" },
        { status: 403 }
      );
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title: title ?? blog.title,
        content: content ?? blog.content,
        status: status ?? blog.status,
      },
    });
    await logAction({
      actionType: "UPDATE",
      entityType: "Blog",
      entityId: updatedBlog.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${
        user.name || user.email
      } updated a  blog titled "${title}"`,
    });
    return NextResponse.json(
      { message: "Blog updated successfully", blog: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
