import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Basic Customer Information
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    customer_email: {
      type: String,
      required: false,
      trim: true,
    },
    customer_phone: {
      type: String,
      required: false,
      trim: true,
    },
    sla_level: {
      type: String,
      enum: ["Gold", "Silver", "Bronze", "None"],
      default: "None",
    },

    // Issue Details
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

    // EPK Process Fields
    is_complex_ticket: {
      type: Boolean,
      default: false,
    },
    requires_password_reset: {
      type: Boolean,
      default: false,
    },
    auto_response_sent: {
      type: Boolean,
      default: false,
    },
    customer_waiting_for_response: {
      type: Boolean,
      default: true,
    },

    // Priorities and Assignment
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
    final_priority: {
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

    // Resolution Details
    resolution_method: {
      type: String,
      enum: ["phone", "email", "portal"],
      default: "email",
    },
    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "waiting_customer",
        "escalated",
        "resolved",
        "closed",
      ],
      default: "open",
    },
    assigned_to: {
      type: String,
      default: null,
    },

    // Solution and Follow-up
    solution_steps: [
      {
        step: String,
        timestamp: { type: Date, default: Date.now },
        performed_by: String,
      },
    ],
    resolution_notes: {
      type: String,
      default: "",
    },
    customer_feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        default: "",
      },
      feedback_date: {
        type: Date,
        default: null,
      },
    },

    // Timestamps
    escalated_at: {
      type: Date,
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    closed_at: {
      type: Date,
      default: null,
    },

    // Process tracking (based on EPK)
    process_stage: {
      type: String,
      enum: [
        "ticket_created",
        "sla_prioritized",
        "ai_categorized",
        "in_support_queue",
        "being_processed",
        "awaiting_customer",
        "solution_provided",
        "feedback_requested",
        "completed",
      ],
      default: "ticket_created",
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
