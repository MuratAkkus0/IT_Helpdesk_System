import { useState } from "react";
import { FiX, FiUser, FiCalendar, FiMessageSquare } from "react-icons/fi";
import { ticketAPI } from "@/services/api";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import type { TicketDetailModalProps } from "@/types";

const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onRefresh,
}: TicketDetailModalProps) => {
  const [assignedLevel, setAssignedLevel] = useState(
    ticket?.assigned_level || "L1"
  );
  const [status, setStatus] = useState(ticket?.status || "open");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await ticketAPI.update(ticket._id, {
        status,
        assigned_level: assignedLevel,
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return "bg-red-100 text-red-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 1:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 5:
        return "Kritik";
      case 4:
        return "Yüksek";
      case 3:
        return "Orta";
      case 2:
        return "Düşük";
      case 1:
        return "Çok Düşük";
      default:
        return "Belirsiz";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Ticket Detayları #{ticket._id}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FiUser className="inline mr-1" />
                        Müşteri
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {ticket.customer_name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FiCalendar className="inline mr-1" />
                        Oluşturulma Tarihi
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(ticket.created_at)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FiMessageSquare className="inline mr-1" />
                      Açıklama
                    </label>
                    <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {ticket.issue_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durum
                      </label>
                      <Select
                        value={status}
                        onChange={(e) =>
                          setStatus(
                            e.target.value as
                              | "open"
                              | "in_progress"
                              | "pending"
                              | "resolved"
                              | "closed"
                          )
                        }
                        options={[
                          { value: "open", label: "Açık" },
                          { value: "in_progress", label: "Devam Ediyor" },
                          { value: "pending", label: "Beklemede" },
                          { value: "resolved", label: "Çözüldü" },
                          { value: "closed", label: "Kapalı" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Öncelik
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          ticket.ai_priority
                        )}`}
                      >
                        {getPriorityText(ticket.ai_priority)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Atanan Seviye
                      </label>
                      <Select
                        value={assignedLevel}
                        onChange={(e) => setAssignedLevel(e.target.value)}
                        options={[
                          { value: "L1", label: "Level 1" },
                          { value: "L2", label: "Level 2" },
                          { value: "L3", label: "Level 3" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SLA Seviyesi
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {ticket.sla_level}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kaynak
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {ticket.ticket_source}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              variant="primary"
              onClick={handleUpdate}
              disabled={loading}
              className="w-full sm:w-auto sm:ml-3"
            >
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              İptal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
