export function buildReportFilters(params) {
  const { actionType, entityType, userId, startDate, endDate, search } = params;

  return {
    AND: [
      actionType ? { actionType } : {},
      entityType ? { entityType } : {},
      userId ? { userId: Number(userId) } : {},

      search
        ? {
            description: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},

      // Date range
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {},
    ],
  };
}
