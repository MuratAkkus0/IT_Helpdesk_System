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

// Read SLA policy
let slaPolicy;
try {
  slaPolicy = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../sla/sla-policy.json"), "utf8")
  );
} catch (error) {
  console.warn("SLA policy file not found, using default rules");
  slaPolicy = null;
}

// Enhanced AI analysis for EPK workflow with SLA integration
const getAIAnalysis = async (
  ticketText,
  slaLevel = "None",
  issueType = "other"
) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

    // Get SLA-specific information
    const slaInfo = slaPolicy
      ? slaPolicy.sla_policy.customer_tiers[slaLevel]
      : null;
    const priorityLevels = slaPolicy
      ? slaPolicy.sla_policy.priority_levels
      : null;
    const issueCategories = slaPolicy
      ? slaPolicy.sla_policy.issue_categories
      : null;
    const automationRules = slaPolicy
      ? slaPolicy.sla_policy.automation_rules
      : null;

    // First check if Ollama is available
    try {
      const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: "GET",
        timeout: 5000, // 5 second health check
      });

      if (!healthCheck.ok) {
        throw new Error(`Ollama health check failed: ${healthCheck.status}`);
      }
    } catch (healthError) {
      console.warn(
        "Ollama service not available, using fallback analysis:",
        healthError.message
      );
      return getFallbackAnalysis(
        ticketText,
        slaLevel,
        issueType,
        slaInfo,
        issueCategories,
        automationRules
      );
    }

    const analysisPrompt = `
    Analyze this IT support request according to our SLA policy and provide a JSON response with the following structure:
    {
      "priority": 1-5,
      "is_complex": true/false,
      "requires_password_reset": true/false,
      "suggested_solution": "brief solution suggestion",
      "estimated_resolution_time": "time in minutes",
      "sla_compliance_notes": "SLA specific notes"
    }
    
    CUSTOMER SLA LEVEL: ${slaLevel}
    ${
      slaInfo
        ? `
    SLA Details:
    - Tier: ${slaInfo.tier_name}
    - Description: ${slaInfo.description}
    - Priority Multiplier: ${slaInfo.priority_multiplier}
    - Features: ${slaInfo.features.join(", ")}
    `
        : ""
    }
    
    PRIORITY GUIDELINES (1-5 scale):
    ${
      priorityLevels
        ? Object.entries(priorityLevels)
            .map(
              ([level, info]) =>
                `- Priority ${level} (${info.name}): ${info.description}
        Examples: ${info.examples.join(", ")}
        ${info.escalation_required ? "REQUIRES ESCALATION" : ""}
        ${
          info.requires_immediate_attention ? "IMMEDIATE ATTENTION NEEDED" : ""
        }`
            )
            .join("\n    ")
        : `
    - Priority 5: Critical system failures, security breaches
    - Priority 4: Service outages, major functionality loss
    - Priority 3: Moderate issues affecting work
    - Priority 2: Minor issues with workarounds
    - Priority 1: General questions, simple requests`
    }
    
    ISSUE CATEGORY: ${issueType}
    ${
      issueCategories && issueCategories[issueType]
        ? `
    Category Details:
    - Name: ${issueCategories[issueType].name}
    - Priority Boost: +${issueCategories[issueType].base_priority_boost}
    - Requires L2: ${issueCategories[issueType].requires_l2}
    - Typical Issues: ${issueCategories[issueType].typical_issues.join(", ")}
    `
        : ""
    }
    
    AUTOMATION RULES:
    ${
      automationRules
        ? Object.entries(automationRules)
            .map(
              ([rule, config]) =>
                `- ${rule}: Triggers: ${config.triggers.join(", ")} | Action: ${
                  config.auto_action
                } | Time: ${config.estimated_resolution}`
            )
            .join("\n    ")
        : "Standard automation rules apply"
    }
    
    Complex tickets require Level 2 support and include:
    - Network infrastructure issues
    - Security-related problems  
    - System administration tasks
    - Complex software troubleshooting
    - Hardware issues
    
    Check for password reset triggers: ${
      automationRules
        ? automationRules.password_reset.triggers.join(", ")
        : "şifre, password, login"
    }
    
    Support request: "${ticketText}"
    
    Consider the SLA level when determining priority and response times. Higher SLA levels should receive higher priority treatment.
    `;

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI analysis timeout")), 45000); // 45 seconds
    });

    // Create the actual AI request
    const aiRequest = fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        system: systemPrompt,
        prompt: analysisPrompt,
        stream: false,
      }),
    });

    // Race between timeout and AI response
    const response = await Promise.race([aiRequest, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    try {
      // Try to parse JSON response
      const analysis = JSON.parse(data.response.trim());

      // Apply SLA-based priority adjustments
      let finalPriority = Math.max(
        1,
        Math.min(5, parseInt(analysis.priority) || 3)
      );

      // Apply SLA multiplier
      if (slaInfo && slaInfo.priority_multiplier > 0) {
        finalPriority = Math.min(
          5,
          finalPriority + Math.floor(slaInfo.priority_multiplier / 2)
        );
      }

      // Apply category-based priority boost
      if (issueCategories && issueCategories[issueType]) {
        finalPriority = Math.min(
          5,
          finalPriority + issueCategories[issueType].base_priority_boost
        );
      }

      // Check for automatic password reset
      let requiresPasswordReset = Boolean(analysis.requires_password_reset);
      if (automationRules && automationRules.password_reset) {
        const triggers = automationRules.password_reset.triggers;
        requiresPasswordReset = triggers.some((trigger) =>
          ticketText.toLowerCase().includes(trigger.toLowerCase())
        );
      }

      // Determine if complex based on SLA policy
      let isComplex = Boolean(analysis.is_complex);
      if (issueCategories && issueCategories[issueType]) {
        isComplex = isComplex || issueCategories[issueType].requires_l2;
      }

      // Get estimated resolution time based on SLA
      let estimatedTime = analysis.estimated_resolution_time || "30 minutes";
      if (slaInfo && slaInfo.resolution_times) {
        const priorityName =
          finalPriority >= 5
            ? "critical"
            : finalPriority >= 4
            ? "high"
            : finalPriority >= 3
            ? "medium"
            : "low";
        estimatedTime = slaInfo.resolution_times[priorityName] || estimatedTime;
      }

      // Validate the response
      return {
        priority: finalPriority,
        is_complex: isComplex,
        requires_password_reset: requiresPasswordReset,
        suggested_solution: analysis.suggested_solution || "",
        estimated_resolution_time: estimatedTime,
        sla_compliance_notes:
          analysis.sla_compliance_notes || `${slaLevel} SLA applied`,
      };
    } catch (parseError) {
      console.warn(
        "Failed to parse AI response, using fallback analysis:",
        parseError
      );
      return getFallbackAnalysis(
        ticketText,
        slaLevel,
        issueType,
        slaInfo,
        issueCategories,
        automationRules
      );
    }
  } catch (error) {
    console.error("AI analysis failed:", error);
    return getFallbackAnalysis(
      ticketText,
      slaLevel,
      issueType,
      slaInfo,
      issueCategories,
      automationRules
    );
  }
};

// Fallback analysis when AI is not available
const getFallbackAnalysis = (
  ticketText,
  slaLevel,
  issueType,
  slaInfo,
  issueCategories,
  automationRules
) => {
  // Default values if AI fails, still apply SLA adjustments
  let defaultPriority = 3;
  if (slaPolicy && slaPolicy.sla_policy.customer_tiers[slaLevel]) {
    const multiplier =
      slaPolicy.sla_policy.customer_tiers[slaLevel].priority_multiplier;
    defaultPriority = Math.min(5, defaultPriority + Math.floor(multiplier / 2));
  }

  return {
    priority: defaultPriority,
    is_complex: issueType === "network" || issueType === "hardware",
    requires_password_reset:
      ticketText.toLowerCase().includes("şifre") ||
      ticketText.toLowerCase().includes("password"),
    suggested_solution: "",
    estimated_resolution_time: "30 minutes",
    sla_compliance_notes: `${slaLevel} SLA applied (fallback)`,
  };
};

// Legacy function for backward compatibility
const getAIPriority = async (ticketText) => {
  const analysis = await getAIAnalysis(ticketText);
  return analysis.priority;
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

// Enhanced priority calculation based on EPK workflow
export const calculateFinalPriority = (
  aiPriority,
  slaPriority,
  issueType,
  isComplex
) => {
  let finalPriority = Math.max(aiPriority, slaPriority);

  // Boost priority for complex tickets
  if (isComplex) {
    finalPriority = Math.min(5, finalPriority + 1);
  }

  // Boost priority for critical issue types
  if (issueType === "network" || issueType === "access") {
    finalPriority = Math.min(5, finalPriority + 1);
  }

  return Math.max(1, Math.min(5, finalPriority));
};

export const determineAssignedLevel = (
  aiPriority,
  slaPriority,
  issueType,
  isComplex
) => {
  // L2 assignment logic based on EPK workflow
  if (
    isComplex ||
    aiPriority >= 4 ||
    slaPriority >= 3 ||
    issueType === "network"
  ) {
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

// Process stage management based on EPK workflow
export const getNextProcessStage = (currentStage, ticketData) => {
  const stageFlow = {
    ticket_created: "sla_prioritized",
    sla_prioritized: "ai_categorized",
    ai_categorized: "in_support_queue",
    in_support_queue: "being_processed",
    being_processed: ticketData.customer_waiting_for_response
      ? "awaiting_customer"
      : "solution_provided",
    awaiting_customer: "solution_provided",
    solution_provided: "feedback_requested",
    feedback_requested: "completed",
  };

  return stageFlow[currentStage] || currentStage;
};

// Auto-response generation based on ticket type
export const generateAutoResponse = (ticketData) => {
  const responses = {
    password_reset:
      "We have received your password reset request. An automated password reset email will be sent to your registered email address within 5 minutes.",
    simple_request: `Thank you for contacting IT Support. Your ticket #${
      ticketData._id
    } has been created and assigned priority ${
      ticketData.final_priority
    }. Expected response time: ${
      ticketData.estimated_resolution_time || "30 minutes"
    }.`,
    complex_issue: `Your support request has been received and assigned to our Level 2 specialists. Ticket #${ticketData._id} will be reviewed within 1 hour. We will contact you with updates.`,
  };

  if (ticketData.requires_password_reset) {
    return responses.password_reset;
  } else if (ticketData.is_complex_ticket) {
    return responses.complex_issue;
  } else {
    return responses.simple_request;
  }
};

export { getAIPriority, getAIAnalysis };
