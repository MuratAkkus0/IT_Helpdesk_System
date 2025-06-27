import React, { useState, useEffect } from "react";
import { workflowAPI, ticketAPI } from "../services/api";
import type {
  WorkflowStats,
  PendingAutomation,
  Ticket,
  ProcessStage,
} from "../types";

const WorkflowPage: React.FC = () => {
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(
    null
  );
  const [pendingAutomation, setPendingAutomation] =
    useState<PendingAutomation | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const [stageTickets, setStageTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const processStages: { key: ProcessStage; label: string; color: string }[] = [
    { key: "ticket_created", label: "Ticket erstellt", color: "bg-gray-100" },
    { key: "sla_prioritized", label: "SLA priorisiert", color: "bg-blue-100" },
    {
      key: "ai_categorized",
      label: "AI kategorisiert",
      color: "bg-purple-100",
    },
    {
      key: "in_support_queue",
      label: "In Support Queue",
      color: "bg-yellow-100",
    },
    {
      key: "being_processed",
      label: "Wird bearbeitet",
      color: "bg-orange-100",
    },
    {
      key: "awaiting_customer",
      label: "Wartet auf Kunde",
      color: "bg-amber-100",
    },
    {
      key: "solution_provided",
      label: "Lösung bereitgestellt",
      color: "bg-green-100",
    },
    {
      key: "feedback_requested",
      label: "Feedback angefordert",
      color: "bg-teal-100",
    },
    { key: "completed", label: "Abgeschlossen", color: "bg-emerald-100" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, pendingResponse] = await Promise.all([
        workflowAPI.getStats(),
        workflowAPI.getPendingAutomation(),
      ]);
      setWorkflowStats(statsResponse);
      setPendingAutomation(pendingResponse);
    } catch (error) {
      console.error("Failed to load workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = async (stage: ProcessStage) => {
    try {
      setSelectedStage(stage);
      const tickets = await ticketAPI.getByStage(stage);
      setStageTickets(tickets);
    } catch (error) {
      console.error(`Failed to load tickets for stage ${stage}:`, error);
    }
  };

  const handleBulkAutomation = async (action: string, ticketIds: string[]) => {
    try {
      setBulkActionLoading(true);
      const result = await workflowAPI.bulkAutomation(action, ticketIds);
      console.log("Bulk automation result:", result);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Bulk automation failed:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading EPK Workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            EPK Workflow Management
          </h1>
          <p className="text-gray-600 mt-2">
            Ereignisgesteuerte Prozesskette für IT-Helpdesk System
          </p>
        </div>

        {/* Workflow Statistics */}
        {workflowStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gesamte Tickets
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {workflowStats.automation_metrics.total_tickets}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Auto-Antworten
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {workflowStats.automation_metrics.auto_responses_sent}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Komplexe Tickets
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {workflowStats.automation_metrics.complex_tickets}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eskaliert
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {workflowStats.automation_metrics.escalated_tickets}
              </p>
            </div>
          </div>
        )}

        {/* EPK Process Flow */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            EPK Prozessfluss
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {processStages.map((stage, index) => {
              const stageStats = workflowStats?.workflow_distribution.find(
                (s) => s._id === stage.key
              );
              const ticketCount = stageStats?.count || 0;

              return (
                <div key={stage.key} className="relative">
                  <div
                    className={`${stage.color} rounded-lg p-4 border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors`}
                    onClick={() => handleStageClick(stage.key)}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-800 text-sm mb-2">
                        {stage.label}
                      </h3>
                      <div className="text-2xl font-bold text-gray-900">
                        {ticketCount}
                      </div>
                      {stageStats && (
                        <div className="text-xs text-gray-600 mt-1">
                          Ø Priorität: {stageStats.avg_priority.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < processStages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                      <div className="w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-3 -mt-1"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Automation Actions */}
        {pendingAutomation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pending Auto Responses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ausstehende Auto-Antworten (
                {pendingAutomation.pending_auto_response.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingAutomation.pending_auto_response
                  .slice(0, 5)
                  .map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-gray-600 truncate">
                        {ticket.issue_description}
                      </div>
                    </div>
                  ))}
              </div>
              {pendingAutomation.pending_auto_response.length > 0 && (
                <button
                  onClick={() =>
                    handleBulkAutomation(
                      "send_auto_responses",
                      pendingAutomation.pending_auto_response.map((t) => t._id)
                    )
                  }
                  disabled={bulkActionLoading}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {bulkActionLoading
                    ? "Processing..."
                    : "Alle Auto-Antworten senden"}
                </button>
              )}
            </div>

            {/* Pending Password Resets */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Passwort-Resets (
                {pendingAutomation.pending_password_reset.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingAutomation.pending_password_reset
                  .slice(0, 5)
                  .map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-gray-600 truncate">
                        {ticket.issue_description}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pending Escalations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ausstehende Eskalationen (
                {pendingAutomation.pending_escalation.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingAutomation.pending_escalation
                  .slice(0, 5)
                  .map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-gray-600 truncate">
                        {ticket.issue_description}
                      </div>
                      <div className="text-xs text-orange-600">
                        Komplex: {ticket.is_complex_ticket ? "Ja" : "Nein"}
                      </div>
                    </div>
                  ))}
              </div>
              {pendingAutomation.pending_escalation.length > 0 && (
                <button
                  onClick={() =>
                    handleBulkAutomation(
                      "escalate_complex",
                      pendingAutomation.pending_escalation.map((t) => t._id)
                    )
                  }
                  disabled={bulkActionLoading}
                  className="mt-4 w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {bulkActionLoading
                    ? "Processing..."
                    : "Alle zu L2 eskalieren"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stage Detail Modal */}
        {selectedStage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {processStages.find((s) => s.key === selectedStage)?.label} -
                  Tickets
                </h3>
                <button
                  onClick={() => {
                    setSelectedStage(null);
                    setStageTickets([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {stageTickets.map((ticket) => (
                  <div key={ticket._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {ticket.customer_name}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {ticket.issue_description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Priorität: {ticket.final_priority}</span>
                          <span>SLA: {ticket.sla_level}</span>
                          <span>Level: {ticket.assigned_level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            ticket.is_complex_ticket
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.is_complex_ticket ? "Komplex" : "Standard"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPage;
