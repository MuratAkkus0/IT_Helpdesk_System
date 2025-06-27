import express from "express";
import Ticket from "../models/Ticket.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAIPriority,
  getAIAnalysis,
  calculateSlaPriority,
  calculateFinalPriority,
  determineAssignedLevel,
  determineResolutionMethod,
  getNextProcessStage,
  generateAutoResponse,
} from "../utils/aiService.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET SLA policy information (MUST be before /:id route)
router.get("/sla-policy", async (req, res) => {
  try {
    const slaPath = path.join(__dirname, "../sla/sla-policy.json");
    const slaPolicy = JSON.parse(fs.readFileSync(slaPath, "utf8"));
    res.json(slaPolicy);
  } catch (error) {
    console.error("Failed to load SLA policy:", error);
    res.status(500).json({
      message: "SLA policy not available",
      error: error.message,
    });
  }
});

// GET all tickets with enhanced filtering
router.get("/", async (req, res) => {
  try {
    const {
      status,
      assigned_level,
      sla_level,
      process_stage,
      priority_min,
      priority_max,
    } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (assigned_level) filter.assigned_level = assigned_level;
    if (sla_level) filter.sla_level = sla_level;
    if (process_stage) filter.process_stage = process_stage;
    if (priority_min || priority_max) {
      filter.final_priority = {};
      if (priority_min) filter.final_priority.$gte = parseInt(priority_min);
      if (priority_max) filter.final_priority.$lte = parseInt(priority_max);
    }

    const tickets = await Ticket.find(filter).sort({
      final_priority: -1,
      created_at: -1,
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single ticket
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new ticket - Enhanced EPK workflow implementation
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      sla_level,
      issue_description,
      issue_type,
      ticket_source,
    } = req.body;

    // Validate required fields
    if (!customer_name || !issue_description || !issue_type || !ticket_source) {
      return res.status(400).json({
        message:
          "Missing required fields: customer_name, issue_description, issue_type, ticket_source",
      });
    }

    // Step 1: Get AI analysis (EPK: AI Kategorisierung)
    const aiAnalysis = await getAIAnalysis(
      issue_description,
      sla_level,
      issue_type
    );

    // Step 2: Calculate SLA priority (EPK: SLA Priorisierung)
    const slaPriority = calculateSlaPriority(sla_level);

    // Step 3: Calculate final priority (EPK: Prioritätskombination)
    const finalPriority = calculateFinalPriority(
      aiAnalysis.priority,
      slaPriority,
      issue_type,
      aiAnalysis.is_complex
    );

    // Step 4: Determine assigned level (EPK: Support Queue Zuordnung)
    const assignedLevel = determineAssignedLevel(
      aiAnalysis.priority,
      slaPriority,
      issue_type,
      aiAnalysis.is_complex
    );

    // Step 5: Determine resolution method
    const resolutionMethod = determineResolutionMethod(ticket_source);

    // Create ticket with EPK workflow data
    const ticket = new Ticket({
      customer_name,
      customer_email,
      customer_phone,
      sla_level: sla_level || "None",
      issue_description,
      issue_type,
      ticket_source,
      sla_priority: slaPriority,
      ai_priority: aiAnalysis.priority,
      final_priority: finalPriority,
      assigned_level: assignedLevel,
      resolution_method: resolutionMethod,
      is_complex_ticket: aiAnalysis.is_complex,
      requires_password_reset: aiAnalysis.requires_password_reset,
      status: "open",
      process_stage: "ticket_created",
      solution_steps: [
        {
          step: `Ticket created via ${ticket_source}. AI Analysis: Priority ${aiAnalysis.priority}, Complex: ${aiAnalysis.is_complex}`,
          performed_by: "system",
        },
      ],
    });

    const savedTicket = await ticket.save();

    // Step 6: Generate and send auto-response (EPK: Automatische Rückmeldung)
    const autoResponse = generateAutoResponse(savedTicket);

    // Update ticket with auto-response sent
    await Ticket.findByIdAndUpdate(savedTicket._id, {
      auto_response_sent: true,
      process_stage: "sla_prioritized",
      $push: {
        solution_steps: {
          step: `Auto-response sent: ${autoResponse}`,
          performed_by: "system",
        },
      },
    });

    // Step 7: Move to next process stage
    const nextStage = getNextProcessStage("sla_prioritized", savedTicket);
    await Ticket.findByIdAndUpdate(savedTicket._id, {
      process_stage: nextStage,
    });

    res.status(201).json({
      ticket: savedTicket,
      auto_response: autoResponse,
      ai_analysis: aiAnalysis,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update ticket - Enhanced with process stage management
router.put("/:id", async (req, res) => {
  try {
    const { status, assigned_to, solution_step, resolution_notes } = req.body;
    const updateData = {};
    const solutionSteps = [];

    // Handle status changes with EPK workflow
    if (status) {
      updateData.status = status;

      if (status === "in_progress") {
        updateData.process_stage = "being_processed";
        solutionSteps.push({
          step: `Ticket assigned and work started`,
          performed_by: assigned_to || "support_agent",
        });
      } else if (status === "waiting_customer") {
        updateData.customer_waiting_for_response = true;
        updateData.process_stage = "awaiting_customer";
        solutionSteps.push({
          step: `Waiting for customer response`,
          performed_by: assigned_to || "support_agent",
        });
      } else if (status === "resolved") {
        updateData.resolved_at = new Date();
        updateData.customer_waiting_for_response = false;
        updateData.process_stage = "solution_provided";
        solutionSteps.push({
          step: `Ticket resolved`,
          performed_by: assigned_to || "support_agent",
        });
      } else if (status === "escalated") {
        updateData.escalated_at = new Date();
        updateData.assigned_level = "L2";
        solutionSteps.push({
          step: `Ticket escalated to Level 2`,
          performed_by: assigned_to || "support_agent",
        });
      }
    }

    if (assigned_to) {
      updateData.assigned_to = assigned_to;
      if (!status || status !== "in_progress") {
        solutionSteps.push({
          step: `Assigned to ${assigned_to}`,
          performed_by: "system",
        });
      }
    }

    if (solution_step) {
      solutionSteps.push({
        step: solution_step,
        performed_by: assigned_to || "support_agent",
      });
    }

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    // Add solution steps if any
    if (solutionSteps.length > 0) {
      updateData.$push = { solution_steps: { $each: solutionSteps } };
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST customer feedback (EPK: Kundenfeedback)
router.post("/:id/feedback", async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        customer_feedback: {
          rating,
          comment: comment || "",
          feedback_date: new Date(),
        },
        process_stage: "completed",
        status: "closed",
        closed_at: new Date(),
        $push: {
          solution_steps: {
            step: `Customer feedback received: ${rating}/5 stars. ${
              comment || "No comment"
            }`,
            performed_by: "customer",
          },
        },
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ticket
router.delete("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if ticket can be deleted (optional - you might want to prevent deletion of resolved tickets)
    // if (ticket.status === "resolved" || ticket.status === "closed") {
    //   return res.status(400).json({ message: "Cannot delete resolved or closed tickets" });
    // }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tickets by process stage (EPK workflow monitoring)
router.get("/stage/:stage", async (req, res) => {
  try {
    const { stage } = req.params;
    const tickets = await Ticket.find({ process_stage: stage }).sort({
      final_priority: -1,
      created_at: -1,
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET dashboard statistics - Enhanced with EPK metrics
router.get("/stats/dashboard", async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
          },
          l1: { $sum: { $cond: [{ $eq: ["$assigned_level", "L1"] }, 1, 0] } },
          l2: { $sum: { $cond: [{ $eq: ["$assigned_level", "L2"] }, 1, 0] } },
          complexTickets: { $sum: { $cond: ["$is_complex_ticket", 1, 0] } },
          passwordResets: {
            $sum: { $cond: ["$requires_password_reset", 1, 0] },
          },
        },
      },
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$final_priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const processStageStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$process_stage",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const feedbackStats = await Ticket.aggregate([
      {
        $match: { "customer_feedback.rating": { $exists: true } },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$customer_feedback.rating" },
          totalFeedback: { $sum: 1 },
        },
      },
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        l1: 0,
        l2: 0,
        complexTickets: 0,
        passwordResets: 0,
      },
      priorityDistribution: priorityStats,
      processStageDistribution: processStageStats,
      customerSatisfaction: feedbackStats[0] || {
        avgRating: 0,
        totalFeedback: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
