import prisma from "@/config/db";

export async function logAction({
  actionType,
  entityType,
  entityId = null,
  performedById,
  description,
}) {
  try {
    const report = await prisma.report.create({
      data: {
        actionType,
        entityType,
        entityId,
        performedById,
        description,
        date: new Date(),
      },
    });
    console.log("Report logged successfully:", report);
  } catch (error) {
    console.error("Error Logging action:", error);
  }
}
