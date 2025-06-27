import express from "express";
import { getAIAnalysis, generateAutoResponse } from "../utils/aiService.js";

const router = express.Router();

// POST analyze ticket - Enhanced for EPK workflow
router.post("/analyze", async (req, res) => {
  try {
    const { issue_description } = req.body;

    if (!issue_description) {
      return res.status(400).json({ message: "issue_description is required" });
    }

    const analysis = await getAIAnalysis(issue_description);

    res.json({
      success: true,
      analysis: analysis,
      message: "Ticket analysis completed",
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze ticket",
      error: error.message,
    });
  }
});

// POST generate response - For EPK auto-response workflow
router.post("/generate-response", async (req, res) => {
  try {
    const ticketData = req.body;

    if (!ticketData) {
      return res.status(400).json({ message: "Ticket data is required" });
    }

    const autoResponse = generateAutoResponse(ticketData);

    res.json({
      success: true,
      response: autoResponse,
      message: "Auto-response generated successfully",
    });
  } catch (error) {
    console.error("Auto-response generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate auto-response",
      error: error.message,
    });
  }
});

// GET health check for AI service
router.get("/health", async (req, res) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

    // Test AI connection
    const testResponse = await fetch(`${OLLAMA_URL}/api/tags`);
    const isOllamaAvailable = testResponse.ok;

    res.json({
      status: "OK",
      ollama_available: isOllamaAvailable,
      ollama_url: OLLAMA_URL,
      features: {
        ticket_analysis: true,
        auto_response: true,
        priority_calculation: true,
        complexity_detection: true,
      },
    });
  } catch (error) {
    res.json({
      status: "DEGRADED",
      ollama_available: false,
      ollama_url: process.env.OLLAMA_URL || "http://localhost:11434",
      error: error.message,
      features: {
        ticket_analysis: false,
        auto_response: true, // This still works without AI
        priority_calculation: true, // Basic calculation works
        complexity_detection: false,
      },
    });
  }
});

export default router;
