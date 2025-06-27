import { useState } from "react";
import {
  FiX,
  FiUser,
  FiMessageSquare,
  FiSettings,
  FiClock,
} from "react-icons/fi";
import { ticketAPI } from "@/services/api";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import type { TicketDetailModalProps, TicketStatus } from "@/types";

const TicketDetailModal = ({
  ticket,
  onClose,
  onRefresh,
}: TicketDetailModalProps) => {
  const [assignedLevel, setAssignedLevel] = useState<"L1" | "L2">(
    ticket?.assigned_level || "L1"
  );
  const [status, setStatus] = useState<TicketStatus>(ticket?.status || "open");
  const [loading, setLoading] = useState(false);

  if (!ticket) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await ticketAPI.update(ticket._id, {
        status,
        solution_step: `Status updated to ${status} and assigned to ${assignedLevel}`,
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityText = (priority: number) => {
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

  const formatDate = (dateString: string | Date): string => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeProps = (status: string) => {
    const statusMap = {
      open: { variant: "primary" as const, label: "Open" },
      in_progress: { variant: "warning" as const, label: "In Progress" },
      waiting_customer: { variant: "info" as const, label: "Waiting Customer" },
      escalated: { variant: "warning" as const, label: "Escalated" },
      resolved: { variant: "success" as const, label: "Resolved" },
      closed: { variant: "success" as const, label: "Closed" },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        variant: "secondary" as const,
        label: "Unknown",
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-700">
          <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl leading-6 font-semibold text-white">
                    Ticket #{ticket._id.slice(-6)}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                      <FiUser className="mr-2" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Name
                        </label>
                        <p className="mt-1 text-sm text-white">
                          {ticket.customer_name}
                        </p>
                      </div>
                      {ticket.customer_email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Email
                          </label>
                          <p className="mt-1 text-sm text-white">
                            {ticket.customer_email}
                          </p>
                        </div>
                      )}
                      {ticket.customer_phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Phone
                          </label>
                          <p className="mt-1 text-sm text-white">
                            {ticket.customer_phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          SLA Level
                        </label>
                        <Badge
                          variant={
                            ticket.sla_level === "Gold"
                              ? "warning"
                              : ticket.sla_level === "Silver"
                              ? "info"
                              : ticket.sla_level === "Bronze"
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                          className="mt-1"
                        >
                          {ticket.sla_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                      <FiMessageSquare className="mr-2" />
                      Issue Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Description
                        </label>
                        <p className="mt-1 text-sm text-white p-3 bg-gray-800 rounded-md border border-gray-600">
                          {ticket.issue_description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Type
                          </label>
                          <Badge variant="secondary" size="sm" className="mt-1">
                            {ticket.issue_type}
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Source
                          </label>
                          <Badge variant="info" size="sm" className="mt-1">
                            {ticket.ticket_source}
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Complexity
                          </label>
                          <Badge
                            variant={
                              ticket.is_complex_ticket ? "warning" : "success"
                            }
                            size="sm"
                            className="mt-1"
                          >
                            {ticket.is_complex_ticket ? "Complex" : "Simple"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EPK Workflow Status */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                      <FiSettings className="mr-2" />
                      EPK Workflow Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Process Stage
                        </label>
                        <Badge variant="primary" size="sm" className="mt-1">
                          {ticket.process_stage
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Status
                        </label>
                        <Badge
                          variant={getStatusBadgeProps(ticket.status).variant}
                          size="sm"
                          className="mt-1"
                        >
                          {getStatusBadgeProps(ticket.status).label}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Priority
                        </label>
                        <Badge
                          variant={
                            ticket.final_priority >= 4
                              ? "danger"
                              : ticket.final_priority >= 3
                              ? "warning"
                              : ticket.final_priority >= 2
                              ? "info"
                              : "success"
                          }
                          size="sm"
                          className="mt-1"
                        >
                          {getPriorityText(ticket.final_priority)} (
                          {ticket.final_priority})
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Assigned Level
                        </label>
                        <Badge
                          variant={
                            ticket.assigned_level === "L2"
                              ? "danger"
                              : "primary"
                          }
                          size="sm"
                          className="mt-1"
                        >
                          {ticket.assigned_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Automation Status */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4">
                      Automation Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Auto Response Sent:
                        </span>
                        <Badge
                          variant={
                            ticket.auto_response_sent ? "success" : "secondary"
                          }
                          size="sm"
                        >
                          {ticket.auto_response_sent ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Password Reset Required:
                        </span>
                        <Badge
                          variant={
                            ticket.requires_password_reset
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {ticket.requires_password_reset ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Waiting for Customer:
                        </span>
                        <Badge
                          variant={
                            ticket.customer_waiting_for_response
                              ? "info"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {ticket.customer_waiting_for_response ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                      <FiClock className="mr-2" />
                      Timeline
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Created At
                        </label>
                        <p className="mt-1 text-sm text-white">
                          {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      {ticket.escalated_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Escalated At
                          </label>
                          <p className="mt-1 text-sm text-white">
                            {formatDate(ticket.escalated_at)}
                          </p>
                        </div>
                      )}
                      {ticket.resolved_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Resolved At
                          </label>
                          <p className="mt-1 text-sm text-white">
                            {formatDate(ticket.resolved_at)}
                          </p>
                        </div>
                      )}
                      {ticket.closed_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Closed At
                          </label>
                          <p className="mt-1 text-sm text-white">
                            {formatDate(ticket.closed_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Solution Steps */}
                  {ticket.solution_steps &&
                    ticket.solution_steps.length > 0 && (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-lg font-medium text-white mb-4">
                          Solution Steps
                        </h4>
                        <div className="space-y-3">
                          {ticket.solution_steps.map((step, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-blue-500 pl-4"
                            >
                              <p className="text-sm text-white">{step.step}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatDate(step.timestamp)}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                  by {step.performed_by}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Customer Feedback */}
                  {ticket.customer_feedback && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-lg font-medium text-white mb-4">
                        Customer Feedback
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-300">Rating:</span>
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
                          <span className="text-sm text-white">
                            ({ticket.customer_feedback.rating}/5)
                          </span>
                        </div>
                        {ticket.customer_feedback.comment && (
                          <div>
                            <span className="text-sm text-gray-300">
                              Comment:
                            </span>
                            <p className="text-sm text-white mt-1 p-2 bg-gray-800 rounded border border-gray-600">
                              {ticket.customer_feedback.comment}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-400">
                            Submitted on:{" "}
                            {formatDate(ticket.customer_feedback.feedback_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Update Controls */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4">
                      Update Ticket
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Status
                        </label>
                        <Select
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as TicketStatus)
                          }
                          options={[
                            { value: "open", label: "Open" },
                            { value: "in_progress", label: "In Progress" },
                            {
                              value: "waiting_customer",
                              label: "Waiting Customer",
                            },
                            { value: "escalated", label: "Escalated" },
                            { value: "resolved", label: "Resolved" },
                            { value: "closed", label: "Closed" },
                          ]}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Assigned Level
                        </label>
                        <Select
                          value={assignedLevel}
                          onChange={(e) =>
                            setAssignedLevel(e.target.value as "L1" | "L2")
                          }
                          options={[
                            { value: "L1", label: "Level 1" },
                            { value: "L2", label: "Level 2" },
                          ]}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-600">
            <Button
              variant="primary"
              onClick={handleUpdate}
              disabled={loading}
              className="w-full sm:w-auto sm:ml-3"
            >
              {loading ? "Updating..." : "Update Ticket"}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
