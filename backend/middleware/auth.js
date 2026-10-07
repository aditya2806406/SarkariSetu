import { clerkClient, verifyToken } from "@clerk/clerk-sdk-node";

async function resolveClerkUserId(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload.sub || null;
  } catch {
    return null;
  }
}

/**
 * requireAuth — blocks the request with 401 if there's no valid Clerk
 * session. Attaches req.clerkUserId and req.clerkUser on success.
 */
export async function requireAuth(req, res, next) {
  const clerkUserId = await resolveClerkUserId(req);

  if (!clerkUserId) {
    return res.status(401).json({
      success: false,
      message: "Sign in required for this action.",
    });
  }

  req.clerkUserId = clerkUserId;
  try {
    req.clerkUser = await clerkClient.users.getUser(clerkUserId);
  } catch {
    // Non-fatal — downstream routes only need the ID in most cases.
  }
  next();
}

/**
 * optionalAuth — attaches req.clerkUserId when a valid session is
 * present, but never blocks the request. Used on routes like /api/chat
 * and /api/schemes/:schemeId where signed-out users still get a full
 * response, just without personalization.
 */
export async function optionalAuth(req, res, next) {
  req.clerkUserId = await resolveClerkUserId(req);
  next();
}
