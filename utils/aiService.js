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

export const getAIPriority = async (ticketText) => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        system: systemPrompt,
        prompt: `Destek talebi: "${ticketText}"`,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const aiPriority = parseInt(data.response.trim());

    // Validate the response is a number between 1-5
    if (isNaN(aiPriority) || aiPriority < 1 || aiPriority > 5) {
      console.warn(
        `Invalid AI priority response: ${data.response}, defaulting to 3`
      );
      return 3;
    }

    return aiPriority;
  } catch (error) {
    console.error("AI Priority analysis failed:", error);
    // Return default priority if AI service is unavailable
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
