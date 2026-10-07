import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import chatRoutes from "./routes/chat.js";
import schemesRoutes from "./routes/schemes.js";
import eligibilityRoutes from "./routes/eligibility.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://sarkari-setu-six.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean).map((url) => url.replace(/\/$/, ""));

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// --- Rate limiting on the AI-backed routes ---
// Chat and eligibility both call Gemini's free tier, which has a real
// but finite daily quota shared across the whole project — this limit
// protects that quota from a single client (or a bug, or abuse) from
// exhausting it for everyone else testing the project the same day.
// Schemes browsing (mostly cache hits after the first translation) is
// left unlimited by this middleware — MongoDB read load is cheap.
const aiRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests — please wait a few minutes and try again.",
  },
});

app.use("/api/chat", aiRouteLimiter, chatRoutes);
app.use("/api/eligibility", aiRouteLimiter, eligibilityRoutes);
app.use("/api/schemes", schemesRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SarkariSetu API is running." });
});

// --- 404 + error handling ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Something went wrong on our end." });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`SarkariSetu API listening on port ${PORT}`);
  });
}

start();
