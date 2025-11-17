import prisma from "@/config/db";
import { verifyToken } from "../verifyToken/verifyToken";
import { NextResponse } from "next/server";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function DELETE(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(req, "Blog", "DELETE");
    if (!permissionCheck.success)
      return NextResponse.json(
        { error: "You do not have permission to delete blogs" },
        { status: 403 }
      );
    console.log(user.role);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

    const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    if (!blog)
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    if (user.role?.name !== "Admin" && blog.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own blogs" },
        { status: 403 }
      );
    }

    const deletedBlog = await prisma.blog.delete({
      where: { id: parseInt(id) },
    });

    await logAction({
      actionType: "DELETE",
      entityType: "Blog",
      entityId: deletedBlog.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} Deleted a  blog titled "${
        deletedBlog.title
      }"`,
    });
    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 },
      deletedBlog
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
