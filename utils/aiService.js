import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read system prompt from file
const systemPrompt = fs.readFileSync(
  path.join(__dirname, "../prompt/system.txt"),
  "utf8"
);

// Get AI Priority from Ollama
const getAIPriority = async (ticketText) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        system: systemPrompt,
        prompt: `Support request: "${ticketText}"`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const priority = parseInt(data.response.trim());

    // Validation
    if (isNaN(priority) || priority < 1 || priority > 5) {
      console.warn("Invalid AI priority response, defaulting to 3");
      return 3;
    }

    return priority;
  } catch (error) {
    console.error("AI Priority analysis failed:", error);
    // Default to medium priority if AI fails
    return 3;
  }
};

export const calculateSlaPriority = (slaLevel) => {
  const slaMap = {
    Gold: 4,
    Silver: 2,
    Bronze: 1,
    None: 0,
  };

  return slaMap[slaLevel] || 0;
};

export const determineAssignedLevel = (aiPriority, slaPriority, issueType) => {
  // L2 assignment logic
  if (aiPriority >= 4 || slaPriority >= 3 || issueType === "network") {
    return "L2";
  }
  return "L1";
};

export const determineResolutionMethod = (ticketSource) => {
  const methodMap = {
    phone: "phone",
    email: "email",
    manual: "portal",
  };

  return methodMap[ticketSource] || "email";
};
