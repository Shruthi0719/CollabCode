import mongoose from "mongoose";
import { env } from "./env.js";

let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;

  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("[db] MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  listenersRegistered = true;
};

export const connectDB = async () => {
  registerConnectionListeners();
  await mongoose.connect(env.MONGO_URI);
};
