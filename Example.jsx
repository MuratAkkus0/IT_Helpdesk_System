import React, { useState } from "react";
import {
  FiHome,
  FiTrello,
  FiUsers,
  FiSettings,
  FiPlus,
  FiSearch,
  FiBell,
  FiUser,
  FiFilter,
  FiChevronDown,
  FiMenu,
  FiX,
} from "react-icons/fi";

const TicketSystemDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Örnek ticket verileri
  const tickets = [
    {
      id: 1,
      title: "Sunucu Hatası",
      status: "open",
      priority: "high",
      assigned: "Ahmet Y.",
      date: "2023-05-15",
    },
    {
      id: 2,
      title: "Ödeme Sistemi Güncellemesi",
      status: "in-progress",
      priority: "medium",
      assigned: "Mehmet K.",
      date: "2023-05-14",
    },
    {
      id: 3,
      title: "Kullanıcı Kayıt Formu Hatası",
      status: "pending",
      priority: "low",
      assigned: "Ayşe T.",
      date: "2023-05-13",
    },
    {
      id: 4,
      title: "Veritabanı Yedekleme",
      status: "resolved",
      priority: "medium",
      assigned: "Ali V.",
      date: "2023-05-12",
    },
    {
      id: 5,
      title: "Arayüz İyileştirmeleri",
      status: "open",
      priority: "high",
      assigned: "Zeynep M.",
      date: "2023-05-11",
    },
  ];

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTab === "all" || ticket.status === activeTab)
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-blue-400";
      case "in-progress":
        return "text-yellow-400";
      case "pending":
        return "text-purple-400";
      case "resolved":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 focus:outline-none"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transform transition-transform duration-200 ease-in-out 
        fixed md:static inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-40`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            Ticket<span className="text-blue-400">Sys</span>
          </h1>
          <p className="text-xs text-gray-400">v2.1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <a
            href="#"
            className="flex items-center p-2 rounded-lg bg-gray-700 text-white"
          >
            <FiHome className="mr-3" />
            <span>Ana Sayfa</span>
          </a>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <FiTrello className="mr-3" />
            <span>Ticket'lar</span>
          </a>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <FiUsers className="mr-3" />
            <span>Müşteriler</span>
          </a>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <FiSettings className="mr-3" />
            <span>Ayarlar</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin Kullanıcı</p>
              <p className="text-xs text-gray-400">Yönetici</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Ticket Yönetimi</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ticket ara..."
                className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 relative">
              <FiBell />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Ticket'lar</h1>
              <p className="text-gray-400">
                Sistemdeki tüm ticket'ları görüntüleyebilir ve yönetebilirsiniz
              </p>
            </div>

            <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
              <FiPlus className="mr-2" />
              Yeni Ticket
            </button>
          </div>

          {/* Filters and Tabs */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setActiveTab("open")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "open"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Açık
              </button>
              <button
                onClick={() => setActiveTab("in-progress")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "in-progress"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Devam Eden
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Beklemede
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "resolved"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Çözülenler
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300">
                <FiFilter className="mr-2" />
                Filtrele
                <FiChevronDown className="ml-2" />
              </button>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Başlık
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Durum
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Öncelik
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Atanan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Tarih
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                          #{ticket.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status === "open" && "Açık"}
                            {ticket.status === "in-progress" && "Devam Ediyor"}
                            {ticket.status === "pending" && "Beklemede"}
                            {ticket.status === "resolved" && "Çözüldü"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <span
                              className={`w-3 h-3 rounded-full ${getPriorityColor(
                                ticket.priority
                              )} mr-2`}
                            ></span>
                            {ticket.priority === "high" && "Yüksek"}
                            {ticket.priority === "medium" && "Orta"}
                            {ticket.priority === "low" && "Düşük"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {ticket.assigned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {ticket.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-400 hover:text-blue-300 mr-3">
                            Görüntüle
                          </button>
                          <button className="text-gray-400 hover:text-gray-300">
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-sm text-gray-400"
                      >
                        {searchQuery
                          ? "Aramanızla eşleşen ticket bulunamadı."
                          : "Gösterilecek ticket bulunamadı."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Toplam <span className="font-medium text-white">5</span> ticket
              gösteriliyor
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                disabled
              >
                Önceki
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">
                1
              </button>
              <button className="px-3 py-1 rounded-md bg-blue-600 text-white">
                2
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">
                3
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">
                Sonraki
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketSystemDashboard;
