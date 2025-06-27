import { useState, useEffect } from "react";
import {
  FiFilter,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { ticketAPI } from "../../services/api";
import Button from "../atoms/Button";
import Select from "../atoms/Select";
import Badge from "../atoms/Badge";
import SearchBar from "../molecules/SearchBar";
import type { TicketListProps, Ticket } from "../../types";

const TicketList = ({
  refreshTrigger,
  searchQuery: externalSearchQuery,
  onTicketSelect,
}: TicketListProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchQuery || "");
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    ticketId: string;
    ticketName: string;
  }>({
    show: false,
    ticketId: "",
    ticketName: "",
  });
  const [deleting, setDeleting] = useState(false);

  // Mock data - Production'da API'den gelecek
  const mockTickets: Ticket[] = [
    {
      _id: "1",
      customer_name: "Ahmet Yılmaz",
      customer_email: "ahmet.yilmaz@example.com",
      customer_phone: "+90 532 123 4567",
      sla_level: "Gold",
      issue_description: "Server Error - Connection Issue",
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
      // Legacy fields
      priority: 4,
      createdAt: "2023-05-15T10:30:00Z",
      updatedAt: "2023-05-15T10:30:00Z",
    },
    {
      _id: "2",
      customer_name: "Mehmet Kaya",
      customer_email: "mehmet.kaya@example.com",
      sla_level: "Silver",
      issue_description: "Payment System Update",
      issue_type: "software",
      ticket_source: "phone",
      is_complex_ticket: false,
      requires_password_reset: false,
      auto_response_sent: true,
      customer_waiting_for_response: false,
      created_at: "2023-05-14T14:20:00Z",
      sla_priority: 2,
      ai_priority: 3,
      final_priority: 3,
      assigned_level: "L1",
      resolution_method: "phone",
      status: "in_progress",
      solution_steps: [],
      resolution_notes: "",
      process_stage: "being_processed",
      // Legacy fields
      priority: 3,
      createdAt: "2023-05-14T14:20:00Z",
      updatedAt: "2023-05-14T14:20:00Z",
    },
    {
      _id: "3",
      customer_name: "Ayşe Türk",
      customer_email: "ayse.turk@example.com",
      sla_level: "Bronze",
      issue_description: "User Registration Form Error",
      issue_type: "software",
      ticket_source: "manual",
      is_complex_ticket: false,
      requires_password_reset: false,
      auto_response_sent: true,
      customer_waiting_for_response: true,
      created_at: "2023-05-13T09:15:00Z",
      sla_priority: 1,
      ai_priority: 2,
      final_priority: 2,
      assigned_level: "L1",
      resolution_method: "email",
      status: "waiting_customer",
      solution_steps: [],
      resolution_notes: "",
      process_stage: "awaiting_customer",
      // Legacy fields
      priority: 2,
      createdAt: "2023-05-13T09:15:00Z",
      updatedAt: "2023-05-13T09:15:00Z",
    },
    {
      _id: "4",
      customer_name: "Ali Veli",
      sla_level: "None",
      issue_description: "Database Backup Issue",
      issue_type: "hardware",
      ticket_source: "email",
      is_complex_ticket: true,
      requires_password_reset: false,
      auto_response_sent: true,
      customer_waiting_for_response: false,
      created_at: "2023-05-12T16:45:00Z",
      sla_priority: 0,
      ai_priority: 3,
      final_priority: 3,
      assigned_level: "L2",
      resolution_method: "email",
      status: "resolved",
      resolved_at: "2023-05-12T18:00:00Z",
      solution_steps: [],
      resolution_notes: "Database backup configured successfully",
      process_stage: "solution_provided",
      // Legacy fields
      priority: 3,
      createdAt: "2023-05-12T16:45:00Z",
      updatedAt: "2023-05-12T16:45:00Z",
    },
    {
      _id: "5",
      customer_name: "Zeynep Mavi",
      customer_email: "zeynep.mavi@example.com",
      sla_level: "Gold",
      issue_description:
        "Critical System Outage - Immediate Attention Required",
      issue_type: "network",
      ticket_source: "email",
      is_complex_ticket: true,
      requires_password_reset: false,
      auto_response_sent: true,
      customer_waiting_for_response: false,
      created_at: "2023-05-11T11:00:00Z",
      sla_priority: 3,
      ai_priority: 5,
      final_priority: 5,
      assigned_level: "L2",
      resolution_method: "email",
      status: "open",
      solution_steps: [],
      resolution_notes: "",
      process_stage: "being_processed",
      // Legacy fields
      priority: 5,
      createdAt: "2023-05-11T11:00:00Z",
      updatedAt: "2023-05-11T11:00:00Z",
    },
  ];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketAPI.getAll();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger]);

  useEffect(() => {
    setSearchTerm(externalSearchQuery || "");
  }, [externalSearchQuery]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedTickets = tickets
    .filter(
      (ticket) =>
        (ticket.customer_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          ticket.issue_description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket._id.toString().includes(searchTerm)) &&
        (activeTab === "all" || ticket.status === activeTab) &&
        (priorityFilter === "all" ||
          ticket.final_priority.toString() === priorityFilter) &&
        (slaFilter === "all" || ticket.sla_level === slaFilter) &&
        (levelFilter === "all" || ticket.assigned_level === levelFilter)
    )
    .sort((a, b) => {
      let aValue: string | number | Date = (a as any)[sortField];
      let bValue: string | number | Date = (b as any)[sortField];

      if (sortField === "created_at") {
        aValue = new Date(aValue as string);
        bValue = new Date(bValue as string);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getPriorityBadgeProps = (priority: number) => {
    const priorityMap = {
      5: { variant: "danger" as const, label: "Critical" },
      4: { variant: "warning" as const, label: "High" },
      3: { variant: "info" as const, label: "Medium" },
      2: { variant: "primary" as const, label: "Low" },
      1: { variant: "success" as const, label: "Very Low" },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || {
        variant: "secondary" as const,
        label: "Unknown",
      }
    );
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

  const formatDate = (dateString: string | Date): string => {
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

  const clearFilters = () => {
    setPriorityFilter("all");
    setSlaFilter("all");
    setLevelFilter("all");
    setSearchTerm("");
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setDeleteConfirm({
      show: true,
      ticketId: ticket._id,
      ticketName: ticket.customer_name || `Ticket #${ticket._id.slice(-6)}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.ticketId) return;

    setDeleting(true);
    try {
      await ticketAPI.delete(deleteConfirm.ticketId);

      // Remove the ticket from local state
      setTickets(
        tickets.filter((ticket) => ticket._id !== deleteConfirm.ticketId)
      );

      // Close confirmation dialog
      setDeleteConfirm({ show: false, ticketId: "", ticketName: "" });

      // Show success message (you can implement toast notifications later)
      console.log("Ticket deleted successfully");
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      // Show error message (you can implement toast notifications later)
      alert("Failed to delete ticket. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, ticketId: "", ticketName: "" });
  };

  const tabs = [
    { key: "all", label: "All", count: tickets.length },
    {
      key: "open",
      label: "Open",
      count: tickets.filter((t) => t.status === "open").length,
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: tickets.filter((t) => t.status === "in_progress").length,
    },
    {
      key: "waiting_customer",
      label: "Waiting",
      count: tickets.filter((t) => t.status === "waiting_customer").length,
    },
    {
      key: "resolved",
      label: "Resolved",
      count: tickets.filter((t) => t.status === "resolved").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-800 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Support Tickets</h2>
          <p className="text-gray-400">Manage and track all support requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FiFilter />}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            onClick={fetchTickets}
            icon={<FiRefreshCw />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by customer name, description, or ticket ID..."
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "all", label: "All Priorities" },
                { value: "5", label: "Critical" },
                { value: "4", label: "High" },
                { value: "3", label: "Medium" },
                { value: "2", label: "Low" },
                { value: "1", label: "Very Low" },
              ]}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              options={[
                { value: "all", label: "All SLA Levels" },
                { value: "Gold", label: "Gold" },
                { value: "Silver", label: "Silver" },
                { value: "Bronze", label: "Bronze" },
                { value: "None", label: "None" },
              ]}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              options={[
                { value: "all", label: "All Levels" },
                { value: "L1", label: "Level 1" },
                { value: "L2", label: "Level 2" },
              ]}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : filteredAndSortedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiAlertCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("_id")}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>ID</span>
                      {sortField === "_id" && (
                        <span>
                          {sortDirection === "asc" ? (
                            <FiArrowUp />
                          ) : (
                            <FiArrowDown />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("customer_name")}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Customer</span>
                      {sortField === "customer_name" && (
                        <span>
                          {sortDirection === "asc" ? (
                            <FiArrowUp />
                          ) : (
                            <FiArrowDown />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Issue</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("final_priority")}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Priority</span>
                      {sortField === "final_priority" && (
                        <span>
                          {sortDirection === "asc" ? (
                            <FiArrowUp />
                          ) : (
                            <FiArrowDown />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">SLA</th>
                  <th className="px-6 py-4 text-left">Level</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Created</span>
                      {sortField === "created_at" && (
                        <span>
                          {sortDirection === "asc" ? (
                            <FiArrowUp />
                          ) : (
                            <FiArrowDown />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAndSortedTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => onTicketSelect?.(ticket)}
                    className="hover:bg-gray-750 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-300">
                        #{ticket._id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {ticket.customer_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            {ticket.customer_email && (
                              <span className="flex items-center">
                                <FiMail className="w-3 h-3 mr-1" />
                                Email
                              </span>
                            )}
                            {ticket.customer_phone && (
                              <span className="flex items-center">
                                <FiPhone className="w-3 h-3 mr-1" />
                                Phone
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-white truncate">
                          {ticket.issue_description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" size="sm">
                            {ticket.issue_type}
                          </Badge>
                          {ticket.is_complex_ticket && (
                            <Badge variant="warning" size="sm">
                              Complex
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          getPriorityBadgeProps(ticket.final_priority).variant
                        }
                      >
                        {getPriorityBadgeProps(ticket.final_priority).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={getStatusBadgeProps(ticket.status).variant}
                      >
                        {getStatusBadgeProps(ticket.status).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
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
                      >
                        {ticket.sla_level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          ticket.assigned_level === "L2" ? "danger" : "primary"
                        }
                        size="sm"
                      >
                        {ticket.assigned_level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {formatDate(ticket.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e?.stopPropagation();
                            onTicketSelect?.(ticket);
                          }}
                          icon={<FiEye />}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e?.stopPropagation();
                            onTicketSelect?.(ticket);
                          }}
                          icon={<FiEdit />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleDeleteClick(ticket);
                          }}
                          icon={<FiTrash2 />}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Ticket
                </h3>
                <p className="text-gray-400 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the ticket for{" "}
              <span className="font-medium text-white">
                {deleteConfirm.ticketName}
              </span>
              ?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={deleting}
                icon={<FiTrash2 />}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>
            Showing {filteredAndSortedTickets.length} of {tickets.length}{" "}
            tickets
          </span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
