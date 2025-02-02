import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User performing the action
  action: { type: String, required: true }, // Example: "Posted a Job"
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }, // Extra details (job title, category, etc.)
});

export const Log = mongoose.model("Log", logSchema);
