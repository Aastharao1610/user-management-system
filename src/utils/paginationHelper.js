export const getPaginationParams = (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limitParam = searchParams.get("limit") || "10";

  const limit =
    limitParam.toLowerCase() === "all" ? null : parseInt(limitParam);
  const skip = limit ? (page - 1) * limit : 0;

  return { page, limit, skip };
};
