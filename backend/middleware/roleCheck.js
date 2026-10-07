import User from "../models/User.js";

/**
 * requireRole — gate for future admin-only routes (e.g. re-seeding
 * schemes from an admin dashboard). Reads role off the Clerk public
 * metadata since SarkariSetu doesn't store roles in MongoDB. Must run
 * after requireAuth.
 */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    const role = req.clerkUser?.publicMetadata?.role || "user";

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to do this.",
      });
    }

    next();
  };
}

/**
 * attachMongoUser — convenience middleware that loads the MongoDB
 * profile for the authenticated Clerk user onto req.mongoUser. Used by
 * routes that need saved schemes or eligibility profile fields.
 */
export async function attachMongoUser(req, res, next) {
  if (!req.clerkUserId) return next();
  req.mongoUser = await User.findOne({ clerkUserId: req.clerkUserId });
  next();
}
