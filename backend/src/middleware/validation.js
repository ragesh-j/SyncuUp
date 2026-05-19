
const validateFeedPost = (req, res, next) => {
  const { title, content, author } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string");
  } else if (title.trim().length > 200) {
    errors.push("title must not exceed 200 characters");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("content is required and must be a non-empty string");
  } else if (content.trim().length > 2000) {
    errors.push("content must not exceed 2000 characters");
  }

  if (!author || typeof author !== "string" || author.trim().length === 0) {
    errors.push("author is required and must be a non-empty string");
  } else if (author.trim().length > 100) {
    errors.push("author must not exceed 100 characters");
  }

  const validCategories = ["mindset", "technique", "nutrition", "recovery", "strategy", "general"];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push(`category must be one of: ${validCategories.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Sanitize
  req.body.title = title.trim();
  req.body.content = content.trim();
  req.body.author = author.trim();

  next();
};

/**
 * Validate GET /feed query params
 */
const validateFeedQuery = (req, res, next) => {
  let { page = 1, limit = 20, category } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

  req.query.page = page;
  req.query.limit = limit;

  const validCategories = ["mindset", "technique", "nutrition", "recovery", "strategy", "general"];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `category must be one of: ${validCategories.join(", ")}`,
    });
  }

  next();
};

module.exports = { validateFeedPost, validateFeedQuery };