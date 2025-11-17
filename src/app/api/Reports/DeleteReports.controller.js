import { NextResponse } from "next/server";
import { checkPermission } from "../permissions/CheckPermission";
import { verifyToken } from "../verifyToken/verifyToken";
import prisma from "@/config/db";
export async function DELETE(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) return NextResponse.json({ error }, { status: 401 });
    console.log(user, "user data");
    console.log(user.role.name);

    if (user.role.name !== "Admin") {
      return NextResponse.json(
        { error: "Only Admins can delete reports" },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    const reportId = parseInt(id);
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    } else {
      const deletedReport = await prisma.report.delete({
        where: { id: reportId },
      });

      return NextResponse.json(
        {
          message: "Report deleted successfully",
          report: deletedReport,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error Deleting Reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
