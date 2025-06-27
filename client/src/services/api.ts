import axios from "axios";
import type { Ticket, TicketStats } from "../types";

// API base URL - handles both development and production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Enhanced Ticket API functions for EPK workflow
export const ticketAPI = {
  // Get all tickets with enhanced filtering
  getAll: async (filters?: {
    status?: string;
    assigned_level?: string;
    sla_level?: string;
    process_stage?: string;
    priority_min?: number;
    priority_max?: number;
  }): Promise<Ticket[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      const response = await api.get(
        `/tickets${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      throw error;
    }
  },

  // Get tickets by process stage
  getByStage: async (stage: string): Promise<Ticket[]> => {
    try {
      const response = await api.get(`/tickets/stage/${stage}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tickets for stage ${stage}:`, error);
      throw error;
    }
  },

  // Get single ticket
  getById: async (id: string): Promise<Ticket> => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ticket ${id}:`, error);
      throw error;
    }
  },

  // Create new ticket (EPK workflow enhanced)
  create: async (
    ticketData: Partial<Ticket>
  ): Promise<{
    ticket: Ticket;
    auto_response: string;
    ai_analysis: any;
  }> => {
    try {
      const response = await api.post("/tickets", ticketData);
      return response.data;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  },

  // Update ticket with EPK workflow support
  update: async (
    id: string,
    ticketData: {
      status?: string;
      assigned_to?: string;
      solution_step?: string;
      resolution_notes?: string;
    }
  ): Promise<Ticket> => {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update ticket ${id}:`, error);
      throw error;
    }
  },

  // Delete ticket
  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete ticket ${id}:`, error);
      throw error;
    }
  },

  // Submit customer feedback
  submitFeedback: async (
    id: string,
    feedback: {
      rating: number;
      comment?: string;
    }
  ): Promise<Ticket> => {
    try {
      const response = await api.post(`/tickets/${id}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error(`Failed to submit feedback for ticket ${id}:`, error);
      throw error;
    }
  },

  // Get enhanced dashboard statistics
  getStats: async (): Promise<
    TicketStats & {
      processStageDistribution: Array<{ _id: string; count: number }>;
      customerSatisfaction: { avgRating: number; totalFeedback: number };
    }
  > => {
    try {
      const response = await api.get("/tickets/stats/dashboard");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw error;
    }
  },
};

// Enhanced AI API functions for EPK workflow
export const aiAPI = {
  // Enhanced AI analysis for EPK workflow
  analyze: async (
    issueDescription: string
  ): Promise<{
    priority: number;
    is_complex: boolean;
    requires_password_reset: boolean;
    suggested_solution: string;
    estimated_resolution_time: string;
  }> => {
    try {
      // Create a separate axios instance with longer timeout for AI requests
      const aiApi = axios.create({
        baseURL: API_BASE_URL,
        timeout: 60000, // 60 seconds for AI analysis
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await aiApi.post("/ai/analyze", {
        issue_description: issueDescription,
      });
      return response.data.analysis;
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Return a fallback analysis instead of throwing
      return {
        priority: 3,
        is_complex: false,
        requires_password_reset:
          issueDescription.toLowerCase().includes("password") ||
          issueDescription.toLowerCase().includes("şifre"),
        suggested_solution: "Manual analysis required",
        estimated_resolution_time: "30-60 minutes",
      };
    }
  },

  // Generate auto-response
  generateResponse: async (ticketData: any): Promise<string> => {
    try {
      const response = await api.post("/ai/generate-response", ticketData);
      return response.data.response;
    } catch (error) {
      console.error("Auto-response generation failed:", error);
      throw error;
    }
  },

  // Check AI service health with EPK features
  health: async (): Promise<{
    status: string;
    ollama_available: boolean;
    features: {
      ticket_analysis: boolean;
      auto_response: boolean;
      priority_calculation: boolean;
      complexity_detection: boolean;
    };
  }> => {
    try {
      const response = await api.get("/ai/health");
      return response.data;
    } catch (error) {
      console.error("AI health check failed:", error);
      return {
        status: "ERROR",
        ollama_available: false,
        features: {
          ticket_analysis: false,
          auto_response: false,
          priority_calculation: false,
          complexity_detection: false,
        },
      };
    }
  },
};

// EPK Workflow API functions
export const workflowAPI = {
  // Advance workflow stage
  advanceStage: async (
    id: string,
    data: {
      performed_by?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; ticket: Ticket; message: string }> => {
    try {
      const response = await api.post(`/workflow/advance-stage/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to advance workflow for ticket ${id}:`, error);
      throw error;
    }
  },

  // Trigger automation
  triggerAutomation: async (
    id: string,
    action: string
  ): Promise<{
    success: boolean;
    ticket?: Ticket;
    message?: string;
    auto_response?: string;
    password_reset_sent?: boolean;
    escalated?: boolean;
  }> => {
    try {
      const response = await api.post(`/workflow/trigger-automation/${id}`, {
        action,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to trigger automation for ticket ${id}:`, error);
      throw error;
    }
  },

  // Get workflow statistics
  getStats: async (): Promise<{
    workflow_distribution: Array<{
      _id: string;
      count: number;
      avg_priority: number;
      complex_tickets: number;
      password_resets: number;
    }>;
    automation_metrics: {
      total_tickets: number;
      auto_responses_sent: number;
      complex_tickets: number;
      password_resets: number;
      escalated_tickets: number;
    };
  }> => {
    try {
      const response = await api.get("/workflow/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch workflow stats:", error);
      throw error;
    }
  },

  // Get tickets pending automation
  getPendingAutomation: async (): Promise<{
    pending_auto_response: Ticket[];
    pending_password_reset: Ticket[];
    pending_escalation: Ticket[];
  }> => {
    try {
      const response = await api.get("/workflow/pending-automation");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch pending automation:", error);
      throw error;
    }
  },

  // Bulk automation trigger
  bulkAutomation: async (
    action: string,
    ticketIds: string[]
  ): Promise<{
    success: boolean;
    processed: number;
    results: Array<{
      ticket_id: string;
      success: boolean;
      message: string;
    }>;
  }> => {
    try {
      const response = await api.post("/workflow/bulk-automation", {
        action,
        ticket_ids: ticketIds,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to trigger bulk automation:", error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get("/health");
    return response.data.status === "OK";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

export default api;
