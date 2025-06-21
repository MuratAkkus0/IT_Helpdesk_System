import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiAlertCircle,
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { ticketAPI } from "@/services/api";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import type { TicketStats, StatCard, PriorityLabels, Loading } from "@/types";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState<Loading>(true);

  const fetchStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await ticketAPI.getStats();
      setStats(data);
    } catch (error) {
      // Fallback to mock data when API is not available
      setStats({
        overview: {
          total: 85,
          open: 23,
          inProgress: 15,
          resolved: 47,
          l1: 12,
          l2: 8,
        },
        priorityDistribution: [
          { priority: 1, count: 25 },
          { priority: 2, count: 20 },
          { priority: 3, count: 18 },
          { priority: 4, count: 12 },
          { priority: 5, count: 10 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-800 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gray-800 rounded-xl border border-gray-700">
        <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-400 text-lg mb-4">İstatistikler yüklenemedi</p>
        <Button variant="primary" onClick={fetchStats}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const { overview } = stats;

  const statCards: StatCard[] = [
    {
      title: "Toplam Ticket",
      value: overview.total,
      icon: FiBarChart2,
      variant: "primary",
      description: "Tüm destek talepleri",
    },
    {
      title: "Açık",
      value: overview.open,
      icon: FiClock,
      variant: "warning",
      description: "Bekleyen talepler",
    },
    {
      title: "İşlemde",
      value: overview.inProgress,
      icon: FiActivity,
      variant: "info",
      description: "Çözüm aşamasında",
    },
    {
      title: "Çözüldü",
      value: overview.resolved,
      icon: FiCheckCircle,
      variant: "success",
      description: "Tamamlanan talepler",
    },
  ];

  const resolvedPercentage: number =
    overview.total > 0
      ? Math.round((overview.resolved / overview.total) * 100)
      : 0;

  const handleNavigate = (path: string): void => {
    window.location.href = path;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl p-6 text-white border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hoş Geldiniz! 👋</h1>
            <p className="text-blue-100 mb-2">
              IT Helpdesk Dashboard - Sistem Durumu Özeti
            </p>
            <p className="text-blue-200">
              Bugün {new Date().toLocaleDateString("tr-TR")} tarihinde
              sisteminiz aktif.
            </p>
          </div>
          <div className="hidden md:flex items-center">
            <FiActivity className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-opacity-20 ${
                    card.variant === "primary"
                      ? "bg-blue-600"
                      : card.variant === "warning"
                      ? "bg-orange-600"
                      : card.variant === "info"
                      ? "bg-yellow-600"
                      : card.variant === "success"
                      ? "bg-green-600"
                      : "bg-gray-600"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      card.variant === "primary"
                        ? "text-blue-400"
                        : card.variant === "warning"
                        ? "text-orange-400"
                        : card.variant === "info"
                        ? "text-yellow-400"
                        : card.variant === "success"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Çözüm Oranı</h3>
            <Badge variant="success" size="lg">
              {resolvedPercentage}%
            </Badge>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${resolvedPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm">
            Toplam {overview.total} ticket'tan {overview.resolved} tanesi
            başarıyla çözüldü.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Hızlı İşlemler
          </h3>
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleNavigate("/create-ticket")}
            >
              <FiPlus className="mr-3 text-blue-400" />
              <div className="text-left">
                <p className="text-white font-medium">Yeni Ticket Oluştur</p>
                <p className="text-gray-400 text-sm">
                  Hızlı destek talebi açın
                </p>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleNavigate("/tickets")}
            >
              <FiActivity className="mr-3 text-green-400" />
              <div className="text-left">
                <p className="text-white font-medium">Ticket Listesi</p>
                <p className="text-gray-400 text-sm">Tüm talepleri görüntüle</p>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={fetchStats}
            >
              <FiTrendingUp className="mr-3 text-purple-400" />
              <div className="text-left">
                <p className="text-white font-medium">İstatistikleri Yenile</p>
                <p className="text-gray-400 text-sm">Güncel verileri getir</p>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      {stats.priorityDistribution && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Öncelik Dağılımı
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.priorityDistribution.map((item, index) => {
              const priorityLabels: PriorityLabels = {
                1: { label: "Çok Düşük", variant: "success" },
                2: { label: "Düşük", variant: "primary" },
                3: { label: "Orta", variant: "info" },
                4: { label: "Yüksek", variant: "warning" },
                5: { label: "Kritik", variant: "danger" },
              };
              const priorityInfo = priorityLabels[item.priority] || {
                label: "Bilinmeyen",
                variant: "secondary",
              };

              return (
                <div
                  key={`priority-${item.priority}-${index}`}
                  className="text-center"
                >
                  <Badge
                    variant={priorityInfo.variant}
                    size="lg"
                    className="mb-2"
                  >
                    {item.count}
                  </Badge>
                  <p className="text-gray-300 text-sm">{priorityInfo.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
