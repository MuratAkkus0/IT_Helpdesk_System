import axios from "axios";
import type { Ticket, TicketStats } from "../types";

// API base URL - handles both development and production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "/api");

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Ticket API functions
export const ticketAPI = {
  // Get all tickets
  getAll: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get("/tickets");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
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

  // Create new ticket
  create: async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    try {
      const response = await api.post("/tickets", ticketData);
      return response.data;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  },

  // Update ticket
  update: async (id: string, ticketData: Partial<Ticket>): Promise<Ticket> => {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update ticket ${id}:`, error);
      throw error;
    }
  },

  // Get dashboard statistics
  getStats: async (): Promise<TicketStats> => {
    try {
      const response = await api.get("/tickets/stats/dashboard");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw error;
    }
  },
};

// AI API functions
export const aiAPI = {
  // Analyze ticket with AI
  analyze: async (ticketText: string): Promise<number> => {
    try {
      const response = await api.post("/ai/analyze", { text: ticketText });
      return response.data.priority;
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw error;
    }
  },

  // Check AI service health
  health: async (): Promise<boolean> => {
    try {
      const response = await api.get("/ai/health");
      return response.data.status === "OK";
    } catch (error) {
      console.error("AI health check failed:", error);
      return false;
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
