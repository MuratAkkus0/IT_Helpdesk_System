import express from "express";
import Ticket from "../models/Ticket.js";
import {
  getAIPriority,
  calculateSlaPriority,
  determineAssignedLevel,
  determineResolutionMethod,
} from "../utils/aiService.js";

const router = express.Router();

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const { status, assigned_level, sla_level } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (assigned_level) filter.assigned_level = assigned_level;
    if (sla_level) filter.sla_level = sla_level;

    const tickets = await Ticket.find(filter).sort({ created_at: -1 });
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

// POST new ticket
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
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

    // Get AI priority
    const aiPriority = await getAIPriority(issue_description);

    // Calculate SLA priority
    const slaPriority = calculateSlaPriority(sla_level);

    // Determine assigned level
    const assignedLevel = determineAssignedLevel(
      aiPriority,
      slaPriority,
      issue_type
    );

    // Determine resolution method
    const resolutionMethod = determineResolutionMethod(ticket_source);

    const ticket = new Ticket({
      customer_name,
      sla_level: sla_level || "None",
      issue_description,
      issue_type,
      ticket_source,
      sla_priority: slaPriority,
      ai_priority: aiPriority,
      assigned_level: assignedLevel,
      resolution_method: resolutionMethod,
      status: "open",
    });

    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update ticket
router.put("/:id", async (req, res) => {
  try {
    const { status, assigned_to } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === "resolved") {
        updateData.resolved_at = new Date();
      }
    }

    if (assigned_to) {
      updateData.assigned_to = assigned_to;
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

// GET dashboard statistics
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
          l1: { $sum: { $cond: [{ $eq: ["$assigned_level", "L1"] }, 1, 0] } },
          l2: { $sum: { $cond: [{ $eq: ["$assigned_level", "L2"] }, 1, 0] } },
        },
      },
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$ai_priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        l1: 0,
        l2: 0,
      },
      priorityDistribution: priorityStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
