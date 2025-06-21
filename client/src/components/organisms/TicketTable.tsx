import { FiEye, FiEdit } from "react-icons/fi";
import Button from "../atoms/Button";
import Badge from "../atoms/Badge";
import type { TicketTableProps } from "../../types";

const TicketTable = ({
  tickets = [],
  onViewTicket,
  onEditTicket,
}: TicketTableProps) => {
  const getStatusText = (status: string) => {
    const statusMap = {
      open: "Open",
      "in-progress": "In Progress",
      pending: "Pending",
      resolved: "Resolved",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const PriorityIndicator = ({ priority }: { priority: number }) => (
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full mr-2 ${
          priority >= 4
            ? "bg-red-500"
            : priority >= 3
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      />
      <span className="text-sm font-medium">{priority}</span>
    </div>
  );

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Priority
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Assigned
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{ticket._id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {ticket.customer_name || ticket.title || "Untitled"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant={ticket.status === "open" ? "primary" : "success"}
                  size="sm"
                >
                  {getStatusText(ticket.status)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityIndicator
                  priority={ticket.priority || ticket.ai_priority}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {ticket.assignedTo || ticket.assigned_level || "Unassigned"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(
                  ticket.createdAt || ticket.created_at
                ).toLocaleDateString("en-US")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTicket(ticket)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FiEye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditTicket(ticket)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FiEdit className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No tickets found yet</p>
            <p className="text-sm">
              Use the form above to create a new ticket.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
