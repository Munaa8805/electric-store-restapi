export function parsePagination(query, defaults = { page: 1, limit: 5, maxLimit: 100 }) {
  const page = Math.max(1, Number.parseInt(String(query.page), 10) || defaults.page);
  const rawLimit = Number.parseInt(String(query.limit), 10) || defaults.limit;
  const limit = Math.min(defaults.maxLimit, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginationMeta({ total, page, limit }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}
