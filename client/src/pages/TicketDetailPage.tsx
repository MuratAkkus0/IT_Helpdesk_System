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
  FiZap,
} from "react-icons/fi";
import { ticketAPI, aiAPI } from "../services/api";
import type { Ticket } from "../types";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
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
      setPriority(data.final_priority || 1);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      // Mock data fallback for demo
      const mockTicket: Ticket = {
        _id: id!,
        customer_name: "Ahmet Yilmaz",
        customer_email: "ahmet.yilmaz@example.com",
        customer_phone: "+90 555 123 4567",
        sla_level: "Gold",
        issue_description:
          "Server Error - Connection Issue. Users cannot access the website. Error message: 'Connection timeout'. The issue started at 09:00 AM and is still ongoing.",
        issue_type: "network",
        ticket_source: "email",
        is_complex_ticket: true,
        requires_password_reset: false,
        auto_response_sent: true,
        customer_waiting_for_response: false,
        created_at: "2023-05-15T10:30:00Z",
        sla_priority: 3,
        ai_priority: 4,
        final_priority: 4,
        assigned_level: "L2",
        resolution_method: "email",
        status: "open",
        solution_steps: [
          {
            step: "Ticket created via email. AI Analysis: Priority 4, Complex: true",
            timestamp: "2023-05-15T10:30:00Z",
            performed_by: "system",
          },
        ],
        resolution_notes: "",
        process_stage: "in_support_queue",
        // Legacy fields for compatibility
        title: "Server Error",
        description:
          "Server Error - Connection Issue. Users cannot access the website.",
        priority: 4,
        category: "Technical",
        requester: "Ahmet Yilmaz",
        createdAt: new Date("2023-05-15T10:30:00Z"),
        updatedAt: new Date("2023-05-15T10:30:00Z"),
      };
      setTicket(mockTicket);
      setStatus(mockTicket.status);
      setAssignedLevel(mockTicket.assigned_level);
      setPriority(mockTicket.final_priority);
    } finally {
      setLoading(false);
    }
  };

  const reanalyzeWithAI = async (): Promise<void> => {
    if (!ticket) return;

    setReanalyzing(true);
    try {
      const result = await aiAPI.analyze(ticket.issue_description);

      // Calculate final priority using the same logic as backend
      const slaPriority = ticket.sla_priority;
      let finalPriority = Math.max(result.priority, slaPriority);

      // Boost priority for complex tickets
      if (result.is_complex) {
        finalPriority = Math.min(5, finalPriority + 1);
      }

      // Boost priority for critical issue types
      if (ticket.issue_type === "network" || ticket.issue_type === "access") {
        finalPriority = Math.min(5, finalPriority + 1);
      }

      finalPriority = Math.max(1, Math.min(5, finalPriority));

      setPriority(finalPriority);

      // Auto-update assigned level based on new analysis
      const newLevel =
        result.is_complex ||
        result.priority >= 4 ||
        slaPriority >= 3 ||
        ticket.issue_type === "network"
          ? "L2"
          : "L1";
      setAssignedLevel(newLevel);

      // Update ticket state immediately for UI
      setTicket((prev) => ({
        ...prev!,
        ai_priority: result.priority,
        final_priority: finalPriority,
        assigned_level: newLevel,
        is_complex_ticket: result.is_complex,
        requires_password_reset: result.requires_password_reset,
      }));

      // Update ticket immediately
      await ticketAPI.update(ticket._id, {
        status: ticket.status,
        solution_step: `AI re-analysis completed. AI Priority: ${result.priority}, Final Priority: ${finalPriority}, Complex: ${result.is_complex}, Suggested: ${result.suggested_solution}`,
      });

      await fetchTicketDetail(); // Refresh data
    } catch (error) {
      console.error("AI re-analysis failed:", error);
      // Mock analysis for fallback
      const mockResult = {
        priority: Math.floor(Math.random() * 5) + 1,
        is_complex: Math.random() > 0.7,
        requires_password_reset: Math.random() > 0.8,
        suggested_solution:
          "Please check logs and restart the service if needed.",
        estimated_resolution_time: "30 minutes",
      };

      const slaPriority = ticket.sla_priority;
      let finalPriority = Math.max(mockResult.priority, slaPriority);

      if (mockResult.is_complex) {
        finalPriority = Math.min(5, finalPriority + 1);
      }

      finalPriority = Math.max(1, Math.min(5, finalPriority));

      setPriority(finalPriority);
      const newLevel =
        mockResult.is_complex || mockResult.priority >= 4 ? "L2" : "L1";
      setAssignedLevel(newLevel);

      // Update ticket state immediately for UI (mock case)
      setTicket((prev) => ({
        ...prev!,
        ai_priority: mockResult.priority,
        final_priority: finalPriority,
        assigned_level: newLevel,
        is_complex_ticket: mockResult.is_complex,
        requires_password_reset: mockResult.requires_password_reset,
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
        status: status as any,
        solution_step: notes || `Status updated to ${status}`,
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
      case "waiting_customer":
        return "bg-purple-500 text-white";
      case "escalated":
        return "bg-orange-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      case "closed":
        return "bg-gray-500 text-white";
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
      case "waiting_customer":
        return "Waiting Customer";
      case "escalated":
        return "Escalated";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
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

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Ticket Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The ticket you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/tickets")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="inline mr-2" />
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/tickets")}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-white">
                Ticket #{ticket._id.slice(-6)}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  ticket.status
                )}`}
              >
                {getStatusText(ticket.status)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={reanalyzeWithAI}
                disabled={reanalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <FiZap className="w-4 h-4 mr-2" />
                {reanalyzing ? "Analyzing..." : "Reanalyze with AI"}
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiUser className="mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <p className="text-lg text-white">{ticket.customer_name}</p>
                </div>
                {ticket.customer_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <div className="flex items-center text-white">
                      <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${ticket.customer_email}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {ticket.customer_email}
                      </a>
                    </div>
                  </div>
                )}
                {ticket.customer_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center text-white">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={`tel:${ticket.customer_phone}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {ticket.customer_phone}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    SLA Level
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      ticket.sla_level === "Gold"
                        ? "bg-yellow-100 text-yellow-800"
                        : ticket.sla_level === "Silver"
                        ? "bg-gray-100 text-gray-800"
                        : ticket.sla_level === "Bronze"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.sla_level}
                  </span>
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Issue Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <p className="text-white leading-relaxed">
                      {ticket.issue_description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Type
                    </label>
                    <p className="text-white capitalize">{ticket.issue_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Source
                    </label>
                    <p className="text-white capitalize">
                      {ticket.ticket_source}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Complexity
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.is_complex_ticket
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.is_complex_ticket ? "Complex" : "Simple"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Password Reset
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.requires_password_reset
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.requires_password_reset
                        ? "Required"
                        : "Not Required"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Results */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiZap className="mr-2 text-purple-400" />
                AI Analysis Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    AI Priority
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${getPriorityColor(
                        ticket.ai_priority
                      )}`}
                    >
                      {getPriorityText(ticket.ai_priority)}
                    </span>
                    <span className="text-gray-400">
                      ({ticket.ai_priority}/5)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    SLA Priority
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${getPriorityColor(
                        ticket.sla_priority
                      )}`}
                    >
                      {getPriorityText(ticket.sla_priority)}
                    </span>
                    <span className="text-gray-400">
                      ({ticket.sla_priority}/5)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-400">
                    Final Priority Calculation:
                  </span>
                  <span className="text-white font-semibold">
                    {getPriorityText(ticket.final_priority)} (
                    {ticket.final_priority}/5)
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Max(AI: {ticket.ai_priority}, SLA: {ticket.sla_priority})
                  {ticket.is_complex_ticket ? " + Complex Boost" : ""}
                  {ticket.issue_type === "network" ||
                  ticket.issue_type === "access"
                    ? " + Critical Type Boost"
                    : ""}
                </p>
              </div>
            </div>

            {/* Solution Steps */}
            {ticket.solution_steps && ticket.solution_steps.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Solution Steps
                </h2>
                <div className="space-y-4">
                  {ticket.solution_steps.map((step, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <p className="text-white">{step.step}</p>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                        <FiClock className="w-3 h-3" />
                        <span>{formatDate(step.timestamp)}</span>
                        <span>•</span>
                        <span>by {step.performed_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Feedback */}
            {ticket.customer_feedback && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Customer Feedback
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < (ticket.customer_feedback?.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-white">
                      ({ticket.customer_feedback.rating}/5)
                    </span>
                  </div>
                  {ticket.customer_feedback.comment && (
                    <div>
                      <span className="text-gray-400">Comment:</span>
                      <p className="text-white mt-1 p-3 bg-gray-900 rounded border border-gray-600">
                        {ticket.customer_feedback.comment}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-gray-400">
                    Submitted on:{" "}
                    {formatDate(ticket.customer_feedback.feedback_date)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ticket Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Final Priority
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${getPriorityColor(priority)}`}
                    >
                      {getPriorityText(priority)}
                    </span>
                    <span className="text-gray-400">({priority}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Assigned Level
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      assignedLevel === "L2"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {assignedLevel}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Process Stage
                  </label>
                  <span className="text-white capitalize">
                    {ticket.process_stage.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Auto Response
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.auto_response_sent
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.auto_response_sent ? "Sent" : "Not Sent"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Analysis Details */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiZap className="mr-2 text-purple-400" />
                AI Analysis Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Complexity Assessment
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.is_complex_ticket
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ticket.is_complex_ticket ? "Complex" : "Simple"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Password Reset Required
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.requires_password_reset
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.requires_password_reset ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Resolution Method
                  </label>
                  <span className="text-white capitalize">
                    {ticket.resolution_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiClock className="mr-2" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Created
                  </label>
                  <p className="text-white text-sm">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
                {ticket.escalated_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Escalated
                    </label>
                    <p className="text-white text-sm">
                      {formatDate(ticket.escalated_at)}
                    </p>
                  </div>
                )}
                {ticket.resolved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Resolved
                    </label>
                    <p className="text-white text-sm">
                      {formatDate(ticket.resolved_at)}
                    </p>
                  </div>
                )}
                {ticket.closed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Closed
                    </label>
                    <p className="text-white text-sm">
                      {formatDate(ticket.closed_at)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Last Updated
                  </label>
                  <p className="text-white text-sm">
                    {ticket.updatedAt ? formatDate(ticket.updatedAt) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Controls */}
            {isEditing && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Update Ticket
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting Customer</option>
                      <option value="escalated">Escalated</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add update notes..."
                    />
                  </div>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
