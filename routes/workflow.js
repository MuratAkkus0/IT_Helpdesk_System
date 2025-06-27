import express from "express";
import Ticket from "../models/Ticket.js";
import {
  getNextProcessStage,
  generateAutoResponse,
} from "../utils/aiService.js";

const router = express.Router();

// POST advance workflow stage
router.post("/advance-stage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { performed_by, notes } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const nextStage = getNextProcessStage(ticket.process_stage, ticket);
    const solutionSteps = [
      {
        step: `Workflow advanced from ${ticket.process_stage} to ${nextStage}${
          notes ? `: ${notes}` : ""
        }`,
        performed_by: performed_by || "system",
      },
    ];

    // Handle special stage transitions
    let updateData = {
      process_stage: nextStage,
      $push: { solution_steps: { $each: solutionSteps } },
    };

    if (nextStage === "being_processed" && ticket.status === "open") {
      updateData.status = "in_progress";
    } else if (
      nextStage === "solution_provided" &&
      ticket.status !== "resolved"
    ) {
      updateData.status = "resolved";
      updateData.resolved_at = new Date();
    } else if (nextStage === "completed") {
      updateData.status = "closed";
      updateData.closed_at = new Date();
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({
      success: true,
      ticket: updatedTicket,
      message: `Workflow advanced to ${nextStage}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST trigger automated processes (EPK: Automatische Rückmeldungen)
router.post("/trigger-automation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    let updateData = {};
    let response = {};

    switch (action) {
      case "send_auto_response":
        if (!ticket.auto_response_sent) {
          const autoResponse = generateAutoResponse(ticket);
          updateData = {
            auto_response_sent: true,
            $push: {
              solution_steps: {
                step: `Auto-response sent: ${autoResponse}`,
                performed_by: "system",
              },
            },
          };
          response.auto_response = autoResponse;
        }
        break;

      case "password_reset":
        if (ticket.requires_password_reset) {
          updateData = {
            $push: {
              solution_steps: {
                step: "Automated password reset email sent",
                performed_by: "system",
              },
            },
            status: "resolved",
            resolved_at: new Date(),
            process_stage: "solution_provided",
          };
          response.password_reset_sent = true;
        }
        break;

      case "escalate_complex":
        if (ticket.is_complex_ticket && ticket.assigned_level === "L1") {
          updateData = {
            assigned_level: "L2",
            status: "escalated",
            escalated_at: new Date(),
            $push: {
              solution_steps: {
                step: "Automatically escalated to L2 - Complex ticket detected",
                performed_by: "system",
              },
            },
          };
          response.escalated = true;
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid automation action" });
    }

    if (Object.keys(updateData).length > 0) {
      const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      response.ticket = updatedTicket;
      response.success = true;
    } else {
      response.success = false;
      response.message = "No automation needed or already performed";
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET workflow statistics
router.get("/stats", async (req, res) => {
  try {
    const workflowStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$process_stage",
          count: { $sum: 1 },
          avg_priority: { $avg: "$final_priority" },
          complex_tickets: { $sum: { $cond: ["$is_complex_ticket", 1, 0] } },
          password_resets: {
            $sum: { $cond: ["$requires_password_reset", 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const automationStats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total_tickets: { $sum: 1 },
          auto_responses_sent: {
            $sum: { $cond: ["$auto_response_sent", 1, 0] },
          },
          complex_tickets: { $sum: { $cond: ["$is_complex_ticket", 1, 0] } },
          password_resets: {
            $sum: { $cond: ["$requires_password_reset", 1, 0] },
          },
          escalated_tickets: {
            $sum: { $cond: [{ $ne: ["$escalated_at", null] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      workflow_distribution: workflowStats,
      automation_metrics: automationStats[0] || {
        total_tickets: 0,
        auto_responses_sent: 0,
        complex_tickets: 0,
        password_resets: 0,
        escalated_tickets: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tickets pending automation
router.get("/pending-automation", async (req, res) => {
  try {
    const pendingAutoResponse = await Ticket.find({
      auto_response_sent: false,
      status: "open",
    }).sort({ created_at: 1 });

    const pendingPasswordReset = await Ticket.find({
      requires_password_reset: true,
      status: { $in: ["open", "in_progress"] },
    }).sort({ created_at: 1 });

    const pendingEscalation = await Ticket.find({
      is_complex_ticket: true,
      assigned_level: "L1",
      status: { $in: ["open", "in_progress"] },
    }).sort({ created_at: 1 });

    res.json({
      pending_auto_response: pendingAutoResponse,
      pending_password_reset: pendingPasswordReset,
      pending_escalation: pendingEscalation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST bulk automation trigger
router.post("/bulk-automation", async (req, res) => {
  try {
    const { action, ticket_ids } = req.body;

    if (!action || !ticket_ids || !Array.isArray(ticket_ids)) {
      return res
        .status(400)
        .json({ message: "Action and ticket_ids array are required" });
    }

    const results = [];

    for (const ticketId of ticket_ids) {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          results.push({
            ticket_id: ticketId,
            success: false,
            message: "Ticket not found",
          });
          continue;
        }

        let updateData = {};
        let message = "";

        switch (action) {
          case "send_auto_responses":
            if (!ticket.auto_response_sent) {
              const autoResponse = generateAutoResponse(ticket);
              updateData = {
                auto_response_sent: true,
                $push: {
                  solution_steps: {
                    step: `Auto-response sent: ${autoResponse}`,
                    performed_by: "system",
                  },
                },
              };
              message = "Auto-response sent";
            } else {
              message = "Auto-response already sent";
            }
            break;

          case "escalate_complex":
            if (ticket.is_complex_ticket && ticket.assigned_level === "L1") {
              updateData = {
                assigned_level: "L2",
                status: "escalated",
                escalated_at: new Date(),
                $push: {
                  solution_steps: {
                    step: "Bulk escalated to L2 - Complex ticket",
                    performed_by: "system",
                  },
                },
              };
              message = "Escalated to L2";
            } else {
              message = "No escalation needed";
            }
            break;

          default:
            results.push({
              ticket_id: ticketId,
              success: false,
              message: "Invalid action",
            });
            continue;
        }

        if (Object.keys(updateData).length > 0) {
          await Ticket.findByIdAndUpdate(ticketId, updateData);
          results.push({ ticket_id: ticketId, success: true, message });
        } else {
          results.push({ ticket_id: ticketId, success: false, message });
        }
      } catch (error) {
        results.push({
          ticket_id: ticketId,
          success: false,
          message: error.message,
        });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
