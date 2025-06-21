import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiClock,
  FiAlertCircle,
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { ticketAPI, aiAPI } from "../services/api";
import type { Ticket } from "../types";

interface TicketDetail extends Ticket {
  customer_email?: string;
  customer_phone?: string;
  resolution_notes?: string;
  last_updated?: string;
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [assignedLevel, setAssignedLevel] = useState<string>("");
  const [priority, setPriority] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [reanalyzing, setReanalyzing] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
    }
  }, [id]);

  const fetchTicketDetail = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await ticketAPI.getById(id!);
      setTicket(data);
      setStatus(data.status);
      setAssignedLevel(data.assigned_level || "L1");
      setPriority(data.ai_priority || 1);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      // Mock data fallback for demo
      const mockTicket: TicketDetail = {
        _id: id!,
        title: "Server Error",
        description:
          "Server Error - Connection Issue. Users cannot access the website.",
        priority: 4,
        status: "open",
        category: "Technical",
        requester: "Ahmet Yilmaz",
        createdAt: new Date("2023-05-15T10:30:00Z"),
        updatedAt: new Date("2023-05-15T10:30:00Z"),
        created_at: "2023-05-15T10:30:00Z",
        customer_name: "Ahmet Yilmaz",
        issue_description:
          "Server Error - Connection Issue. Users cannot access the website. Error message: 'Connection timeout'. The issue started at 09:00 AM and is still ongoing.",
        ai_priority: 4,
        sla_level: "Gold",
        ticket_source: "email",
        assigned_level: "L2",
        customer_email: "ahmet.yilmaz@example.com",
        customer_phone: "+90 555 123 4567",
        resolution_notes: "",
        last_updated: "2023-05-15T10:30:00Z",
      };
      setTicket(mockTicket);
      setStatus(mockTicket.status);
      setAssignedLevel(mockTicket.assigned_level || "L2");
      setPriority(mockTicket.ai_priority || 4);
    } finally {
      setLoading(false);
    }
  };

  const reanalyzeWithAI = async (): Promise<void> => {
    if (!ticket) return;

    setReanalyzing(true);
    try {
      const result = await aiAPI.analyze(
        ticket.issue_description || ticket.description || ""
      );
      const newPriority = result;
      setPriority(newPriority);

      // Auto-update assigned level based on new priority
      const newLevel = newPriority >= 4 ? "L2" : newPriority >= 2 ? "L1" : "L1";
      setAssignedLevel(newLevel);

      // Update ticket state immediately for UI
      setTicket((prev) => ({
        ...prev!,
        ai_priority: newPriority,
        assigned_level: newLevel,
      }));

      // Update ticket immediately
      await ticketAPI.update(ticket._id, {
        priority: newPriority as 1 | 2 | 3 | 4 | 5,
        escalationLevel: newLevel as "l1" | "l2" | "l3",
      });

      await fetchTicketDetail(); // Refresh data
    } catch (error) {
      console.error("AI re-analysis failed:", error);
      // Mock analysis
      const mockPriority = Math.floor(Math.random() * 5) + 1;
      setPriority(mockPriority);
      const newLevel = mockPriority >= 4 ? "L2" : "L1";
      setAssignedLevel(newLevel);

      // Update ticket state immediately for UI (mock case)
      setTicket((prev) => ({
        ...prev!,
        ai_priority: mockPriority,
        assigned_level: newLevel,
      }));
    } finally {
      setReanalyzing(false);
    }
  };

  const handleStatusUpdate = async (): Promise<void> => {
    if (!ticket) return;

    setUpdating(true);
    try {
      await ticketAPI.update(ticket._id, {
        status: status as "open" | "in_progress" | "resolved" | "closed",
        priority: priority as 1 | 2 | 3 | 4 | 5,
        escalationLevel: assignedLevel as "l1" | "l2" | "l3",
      });
      await fetchTicketDetail(); // Refresh data
      setIsEditing(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to update ticket:", error);
      alert("An error occurred while updating the ticket.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "open":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "pending":
        return "bg-purple-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 5:
      case 4:
        return "text-red-400";
      case 3:
        return "text-yellow-400";
      case 2:
      case 1:
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityText = (priority: number): string => {
    switch (priority) {
      case 5:
        return "Critical";
      case 4:
        return "High";
      case 3:
        return "Medium";
      case 2:
        return "Low";
      case 1:
        return "Very Low";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-400 text-lg mb-4">Ticket not found</p>
        <button
          onClick={() => navigate("/tickets")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/tickets")}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Ticket #{ticket._id}
            </h1>
            <p className="text-gray-400">
              {ticket.customer_name || ticket.requester}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={reanalyzeWithAI}
            disabled={reanalyzing}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            {reanalyzing ? (
              <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FiZap className="w-4 h-4 mr-2" />
            )}
            AI Re-analyze
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Issue Description
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {ticket.issue_description || ticket.description}
            </p>
          </div>

          {/* Status Update */}
          {isEditing && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Update Ticket
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assigned Level
                  </label>
                  <select
                    value={assignedLevel}
                    onChange={(e) => setAssignedLevel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L1">L1 Support</option>
                    <option value="L2">L2 Support</option>
                    <option value="L3">L3 Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Very Low</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Update notes..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors"
                >
                  {updating ? (
                    <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4 mr-2" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ticket Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    status
                  )}`}
                >
                  {getStatusText(status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className={`font-medium ${getPriorityColor(priority)}`}>
                  {getPriorityText(priority)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Level:</span>
                <span className="text-white font-medium">{assignedLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">SLA:</span>
                <span className="text-white font-medium">
                  {ticket.sla_level || "Standard"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {ticket.customer_name || ticket.requester}
                </span>
              </div>
              {ticket.customer_email && (
                <div className="flex items-center space-x-3">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{ticket.customer_email}</span>
                </div>
              )}
              {ticket.customer_phone && (
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{ticket.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiClock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-300 text-sm">Created</p>
                  <p className="text-gray-400 text-xs">
                    {formatDate(ticket.createdAt.toString())}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiRefreshCw className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-300 text-sm">Last Updated</p>
                  <p className="text-gray-400 text-xs">
                    {formatDate(
                      ticket.last_updated || ticket.updatedAt.toString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
