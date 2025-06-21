import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    sla_level: {
      type: String,
      enum: ["Gold", "Silver", "Bronze", "None"],
      default: "None",
    },
    issue_description: {
      type: String,
      required: true,
      trim: true,
    },
    issue_type: {
      type: String,
      enum: ["network", "software", "access", "hardware", "email", "other"],
      required: true,
    },
    ticket_source: {
      type: String,
      enum: ["email", "phone", "manual"],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    sla_priority: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    ai_priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    assigned_level: {
      type: String,
      enum: ["L1", "L2"],
      default: "L1",
    },
    resolution_method: {
      type: String,
      enum: ["phone", "email", "portal"],
      default: "email",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    assigned_to: {
      type: String,
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
ticketSchema.index({ status: 1, assigned_level: 1 });
ticketSchema.index({ created_at: -1 });

export default mongoose.model("Ticket", ticketSchema);
