import express from "express";
import { getAIPriority } from "../utils/aiService.js";

const router = express.Router();

// POST analyze ticket description
router.post("/analyze", async (req, res) => {
  try {
    const { issue_description } = req.body;

    if (!issue_description) {
      return res.status(400).json({ message: "issue_description is required" });
    }

    const aiPriority = await getAIPriority(issue_description);

    res.json({
      ai_priority: aiPriority,
      analysis: `AI determined this issue has complexity level ${aiPriority}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET AI service health check
router.get("/health", async (req, res) => {
  try {
    // Test AI service with a simple prompt
    const testPriority = await getAIPriority("Test issue");

    res.json({
      status: "OK",
      ai_service: "Ollama is responding",
      test_priority: testPriority,
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      ai_service: "Ollama is not responding",
      error: error.message,
    });
  }
});

export default router;
