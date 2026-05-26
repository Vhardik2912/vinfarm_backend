/**
 * Pagination Helper
 * Usage in any controller:
 *   const { skip, limit, buildMeta } = getPagination(req.query);
 *   const total = await Model.countDocuments(filter);
 *   const data  = await Model.find(filter).skip(skip).limit(limit);
 *   successResponse({ res, data, other: buildMeta(total) });
 */

/**
 * Extracts and validates pagination params from query string.
 * @param {Object} query - req.query
 * @param {number} defaultLimit - default page size (default: 10)
 * @returns {{ page, limit, skip, buildMeta }}
 */
const getPagination = (query = {}, defaultLimit = 10) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip  = (page - 1) * limit;

  /**
   * Builds pagination metadata to attach to the response.
   * @param {number} total - total matching documents
   */
  const buildMeta = (total) => ({
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });

  return { page, limit, skip, buildMeta };
};

module.exports = { getPagination };
