import { useState, useEffect } from "react";
import {
  FiFilter,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiMonitor,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEdit,
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

  // Mock data - Production'da API'den gelecek
  const mockTickets: Ticket[] = [
    {
      _id: "1",
      customer_name: "Ahmet Yılmaz",
      issue_description: "Sunucu Hatası - Bağlantı Sorunu",
      status: "open",
      ai_priority: 4,
      priority: 4,
      sla_level: "Gold",
      ticket_source: "email",
      created_at: "2023-05-15T10:30:00Z",
      createdAt: "2023-05-15T10:30:00Z",
      updatedAt: "2023-05-15T10:30:00Z",
      assigned_level: "L2",
    },
    {
      _id: "2",
      customer_name: "Mehmet Kaya",
      issue_description: "Ödeme Sistemi Güncellemesi",
      status: "in_progress",
      ai_priority: 3,
      priority: 3,
      sla_level: "Silver",
      ticket_source: "phone",
      created_at: "2023-05-14T14:20:00Z",
      createdAt: "2023-05-14T14:20:00Z",
      updatedAt: "2023-05-14T14:20:00Z",
      assigned_level: "L1",
    },
    {
      _id: "3",
      customer_name: "Ayşe Türk",
      issue_description: "Kullanıcı Kayıt Formu Hatası",
      status: "pending",
      ai_priority: 2,
      priority: 2,
      sla_level: "Bronze",
      ticket_source: "manual",
      created_at: "2023-05-13T09:15:00Z",
      createdAt: "2023-05-13T09:15:00Z",
      updatedAt: "2023-05-13T09:15:00Z",
      assigned_level: "L1",
    },
    {
      _id: "4",
      customer_name: "Ali Veli",
      issue_description: "Veritabanı Yedekleme Sorunu",
      status: "resolved",
      ai_priority: 3,
      priority: 3,
      sla_level: "None",
      ticket_source: "email",
      created_at: "2023-05-12T16:45:00Z",
      createdAt: "2023-05-12T16:45:00Z",
      updatedAt: "2023-05-12T16:45:00Z",
      assigned_level: "L2",
    },
    {
      _id: "5",
      customer_name: "Zeynep Mavi",
      issue_description: "Arayüz İyileştirmeleri",
      status: "open",
      ai_priority: 5,
      priority: 5,
      sla_level: "Gold",
      ticket_source: "email",
      created_at: "2023-05-11T11:00:00Z",
      createdAt: "2023-05-11T11:00:00Z",
      updatedAt: "2023-05-11T11:00:00Z",
      assigned_level: "L2",
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
          ticket.ai_priority.toString() === priorityFilter) &&
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
      5: { variant: "danger" as const, label: "Kritik" },
      4: { variant: "warning" as const, label: "Yüksek" },
      3: { variant: "info" as const, label: "Orta" },
      2: { variant: "primary" as const, label: "Düşük" },
      1: { variant: "success" as const, label: "Çok Düşük" },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || {
        variant: "secondary" as const,
        label: "Belirsiz",
      }
    );
  };

  const getStatusBadgeProps = (status: string) => {
    const statusMap = {
      open: { variant: "primary" as const, label: "Açık" },
      in_progress: { variant: "warning" as const, label: "Devam Ediyor" },
      pending: { variant: "info" as const, label: "Beklemede" },
      resolved: { variant: "success" as const, label: "Çözüldü" },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        variant: "secondary" as const,
        label: "Belirsiz",
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setPriorityFilter("all");
    setSlaFilter("all");
    setLevelFilter("all");
  };

  const statusTabs = [
    { id: "all", label: "Tümü", count: tickets.length },
    {
      id: "open",
      label: "Açık",
      count: tickets.filter((t) => t.status === "open").length,
    },
    {
      id: "in_progress",
      label: "Devam Ediyor",
      count: tickets.filter((t) => t.status === "in_progress").length,
    },
    {
      id: "pending",
      label: "Beklemede",
      count: tickets.filter((t) => t.status === "pending").length,
    },
    {
      id: "resolved",
      label: "Çözüldü",
      count: tickets.filter((t) => t.status === "resolved").length,
    },
  ];

  const filterOptions = {
    priority: [
      { value: "all", label: "Tüm Öncelikler" },
      { value: "5", label: "Kritik" },
      { value: "4", label: "Yüksek" },
      { value: "3", label: "Orta" },
      { value: "2", label: "Düşük" },
      { value: "1", label: "Çok Düşük" },
    ],
    sla: [
      { value: "all", label: "Tüm SLA Seviyeler" },
      { value: "Gold", label: "Gold" },
      { value: "Silver", label: "Silver" },
      { value: "Bronze", label: "Bronze" },
      { value: "None", label: "Yok" },
    ],
    level: [
      { value: "all", label: "Tüm Seviyeler" },
      { value: "L1", label: "L1" },
      { value: "L2", label: "L2" },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-800 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Ticket Listesi
            </h2>
            <p className="text-gray-400">Sistemdeki tüm destek talepleri</p>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Bilet ara (müşteri adı, açıklama, ID)..."
            />

            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FiFilter className="mr-2" />
              Filtreler
            </Button>

            <Button
              variant="primary"
              onClick={fetchTickets}
              className="flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center"
            >
              {tab.label}
              <Badge variant="secondary" size="sm" className="ml-2">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Öncelik
                </label>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  options={filterOptions.priority}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SLA Seviyesi
                </label>
                <Select
                  value={slaFilter}
                  onChange={(e) => setSlaFilter(e.target.value)}
                  options={filterOptions.sla}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Atanmış Seviye
                </label>
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  options={filterOptions.level}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("_id")}
                  className="flex items-center hover:text-white"
                >
                  ID
                  {sortField === "_id" &&
                    (sortDirection === "asc" ? (
                      <FiArrowUp className="ml-1" />
                    ) : (
                      <FiArrowDown className="ml-1" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("customer_name")}
                  className="flex items-center hover:text-white"
                >
                  Müşteri
                  {sortField === "customer_name" &&
                    (sortDirection === "asc" ? (
                      <FiArrowUp className="ml-1" />
                    ) : (
                      <FiArrowDown className="ml-1" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Öncelik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                SLA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center hover:text-white"
                >
                  Tarih
                  {sortField === "created_at" &&
                    (sortDirection === "asc" ? (
                      <FiArrowUp className="ml-1" />
                    ) : (
                      <FiArrowDown className="ml-1" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAndSortedTickets.map((ticket) => {
              const priorityProps = getPriorityBadgeProps(ticket.ai_priority);
              const statusProps = getStatusBadgeProps(ticket.status);

              return (
                <tr
                  key={ticket._id}
                  className="hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onTicketSelect?.(ticket)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    #{ticket._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-white">
                        {ticket.customer_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-xs truncate">
                      {ticket.issue_description}
                    </div>
                    <div className="flex items-center mt-1">
                      {ticket.ticket_source === "email" && (
                        <FiMail className="mr-1 text-gray-400" />
                      )}
                      {ticket.ticket_source === "phone" && (
                        <FiPhone className="mr-1 text-gray-400" />
                      )}
                      {ticket.ticket_source === "manual" && (
                        <FiMonitor className="mr-1 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {ticket.ticket_source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusProps.variant} size="sm">
                      {statusProps.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={priorityProps.variant} size="sm">
                      {priorityProps.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {ticket.sla_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div
                      className="flex items-center space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onTicketSelect?.(ticket)}
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                        }}
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedTickets.length === 0 && (
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Ticket bulunamadı
          </h3>
          <p className="text-gray-400">
            Arama kriterlerinizi değiştirin veya yeni ticket oluşturun.
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketList;
