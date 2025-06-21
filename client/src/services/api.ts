import axios, { AxiosResponse } from "axios";
import type { Ticket, TicketStats, CreateTicketForm } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Filter types
interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
}

interface AIAnalysisResult {
  urgency: number;
  category: string;
  confidence: number;
  suggestions?: string[];
}

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime?: number;
}

// Ticket API calls
export const ticketAPI = {
  // Get all tickets
  getAll: async (filters: TicketFilters = {}): Promise<Ticket[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response: AxiosResponse<Ticket[]> = await api.get(
      `/tickets?${params}`
    );
    return response.data;
  },

  // Get single ticket
  getById: async (id: string): Promise<Ticket> => {
    const response: AxiosResponse<Ticket> = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  create: async (ticketData: CreateTicketForm): Promise<Ticket> => {
    const response: AxiosResponse<Ticket> = await api.post(
      "/tickets",
      ticketData
    );
    return response.data;
  },

  // Update ticket
  update: async (id: string, updateData: Partial<Ticket>): Promise<Ticket> => {
    const response: AxiosResponse<Ticket> = await api.put(
      `/tickets/${id}`,
      updateData
    );
    return response.data;
  },

  // Get dashboard stats
  getStats: async (): Promise<TicketStats> => {
    const response: AxiosResponse<TicketStats> = await api.get(
      "/tickets/stats/dashboard"
    );
    return response.data;
  },
};

// AI API calls
export const aiAPI = {
  // Analyze ticket description
  analyze: async (description: string): Promise<AIAnalysisResult> => {
    const response: AxiosResponse<AIAnalysisResult> = await api.post(
      "/ai/analyze",
      {
        issue_description: description,
      }
    );
    return response.data;
  },

  // Check AI service health
  health: async (): Promise<HealthStatus> => {
    const response: AxiosResponse<HealthStatus> = await api.get("/ai/health");
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<HealthStatus> => {
  const response: AxiosResponse<HealthStatus> = await api.get("/health");
  return response.data;
};

export default api;
