export const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit as string) || 20),
  );
  return { page, limit, skip: (page - 1) * limit };
};
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
