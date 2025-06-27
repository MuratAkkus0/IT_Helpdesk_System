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
          closed: 10,
          l1: 12,
          l2: 8,
          complexTickets: 15,
          passwordResets: 8,
        },
        priorityDistribution: [
          { _id: 1, count: 25 },
          { _id: 2, count: 20 },
          { _id: 3, count: 18 },
          { _id: 4, count: 12 },
          { _id: 5, count: 10 },
        ],
        processStageDistribution: [
          { _id: "ticket_created", count: 5 },
          { _id: "sla_prioritized", count: 8 },
          { _id: "ai_categorized", count: 12 },
          { _id: "in_support_queue", count: 15 },
          { _id: "being_processed", count: 20 },
          { _id: "solution_provided", count: 15 },
          { _id: "completed", count: 10 },
        ],
        customerSatisfaction: {
          avgRating: 4.2,
          totalFeedback: 45,
        },
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
        <p className="text-gray-400 text-lg mb-4">
          Statistics could not be loaded
        </p>
        <Button variant="primary" onClick={fetchStats}>
          Try Again
        </Button>
      </div>
    );
  }

  const { overview } = stats;

  const statCards: StatCard[] = [
    {
      title: "Total Tickets",
      value: overview.total || 0,
      icon: FiBarChart2,
      variant: "primary",
      description: "All support tickets",
    },
    {
      title: "Open",
      value: overview.open || 0,
      icon: FiClock,
      variant: "warning",
      description: "Pending requests",
    },
    {
      title: "In Progress",
      value: overview.inProgress || 0,
      icon: FiActivity,
      variant: "info",
      description: "In resolution phase",
    },
    {
      title: "Resolved",
      value: overview.resolved || 0,
      icon: FiCheckCircle,
      variant: "success",
      description: "Completed requests",
    },
  ];

  const resolvedPercentage: number =
    (overview.total || 0) > 0
      ? Math.round(((overview.resolved || 0) / (overview.total || 1)) * 100)
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
            <h1 className="text-2xl font-bold mb-2">Welcome! 👋</h1>
            <p className="text-blue-100 mb-2">
              IT Helpdesk Dashboard - EPK Workflow System
            </p>
            <p className="text-blue-200">
              Today is {new Date().toLocaleDateString("en-US")} and your system
              is active.
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

      {/* EPK Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Complex Tickets
            </h3>
            <Badge variant="warning" size="lg">
              {overview.complexTickets || 0}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">L2 Support Required</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Password Resets
            </h3>
            <Badge variant="info" size="lg">
              {overview.passwordResets || 0}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">Automated Requests</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Customer Rating
            </h3>
            <Badge variant="success" size="lg">
              {stats.customerSatisfaction.avgRating
                ? stats.customerSatisfaction.avgRating.toFixed(1)
                : "0.0"}
              /5
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">
            {stats.customerSatisfaction.totalFeedback || 0} Reviews
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Closed</h3>
            <Badge variant="success" size="lg">
              {overview.closed || 0}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">Completed with Feedback</p>
        </div>
      </div>

      {/* Progress and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Resolution Rate
            </h3>
            <Badge variant="success" size="lg">
              {resolvedPercentage}%
            </Badge>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${resolvedPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm">
            {overview.resolved || 0} out of {overview.total || 0} tickets
            resolved
          </p>
        </div>

        {/* Priority Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Priority Distribution
            </h3>
            <FiTrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-3">
            {stats.priorityDistribution.map((item) => {
              const priorityLabels: PriorityLabels = {
                1: { label: "Low", variant: "info" },
                2: { label: "Normal", variant: "primary" },
                3: { label: "Medium", variant: "warning" },
                4: { label: "High", variant: "danger" },
                5: { label: "Critical", variant: "danger" },
              };

              const priorityInfo = priorityLabels[item._id] || {
                label: "Unknown",
                variant: "secondary" as const,
              };

              const percentage = Math.round(
                (item.count / overview.total) * 100
              );

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant={priorityInfo.variant} size="sm">
                      P{item._id}
                    </Badge>
                    <span className="text-white text-sm">
                      {priorityInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{item.count}</span>
                    <span className="text-gray-500 text-xs">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => handleNavigate("/create-ticket")}
            icon={<FiPlus />}
            className="w-full"
          >
            Create New Ticket
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleNavigate("/tickets")}
            icon={<FiBarChart2 />}
            className="w-full"
          >
            View All Tickets
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleNavigate("/workflow")}
            icon={<FiActivity />}
            className="w-full"
          >
            EPK Workflow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
