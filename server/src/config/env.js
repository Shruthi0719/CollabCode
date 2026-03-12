import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["PORT", "MONGO_URI", "JWT_SECRET", "CLIENT_ORIGIN"];
const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVars.join(", ")}`
  );
}

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 5000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  MONGO_URI: process.env.MONGO_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX: parseNumber(process.env.RATE_LIMIT_MAX, 100),
});
