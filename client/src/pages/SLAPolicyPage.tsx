import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiAward,
} from "react-icons/fi";
import { ticketAPI } from "../services/api";
import Badge from "../components/atoms/Badge";

interface SLAPolicy {
  sla_policy: {
    version: string;
    effective_date: string;
    description: string;
    customer_tiers: {
      [key: string]: {
        tier_name: string;
        description: string;
        priority_multiplier: number;
        features: string[];
        response_times: {
          [key: string]: string;
        };
        resolution_times: {
          [key: string]: string;
        };
      };
    };
    priority_levels: {
      [key: string]: {
        name: string;
        description: string;
        examples: string[];
        escalation_required: boolean;
        requires_immediate_attention: boolean;
      };
    };
    issue_categories: {
      [key: string]: {
        name: string;
        base_priority_boost: number;
        requires_l2: boolean;
        typical_issues: string[];
      };
    };
    metrics_and_kpis: {
      [key: string]: {
        target: string;
        measurement: string;
      };
    };
  };
}

const SLAPolicyPage: React.FC = () => {
  const [slaPolicy, setSlaPolicy] = useState<SLAPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSLAPolicy();
  }, []);

  const fetchSLAPolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/tickets/sla-policy"
      );
      if (!response.ok) {
        throw new Error("SLA Policy yüklenemedi");
      }
      const data = await response.json();
      setSlaPolicy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "Gold":
        return "warning" as const;
      case "Silver":
        return "info" as const;
      case "Bronze":
        return "primary" as const;
      default:
        return "secondary" as const;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "5":
        return "danger" as const;
      case "4":
        return "warning" as const;
      case "3":
        return "info" as const;
      case "2":
        return "primary" as const;
      default:
        return "success" as const;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <FiAlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-red-400 font-semibold">Hata</h3>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!slaPolicy) {
    return (
      <div className="text-center text-gray-400">
        <FiInfo className="w-12 h-12 mx-auto mb-4" />
        <p>SLA Politikası bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <FiShield className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">SLA Politikası</h1>
            <p className="text-blue-100">Service Level Agreement</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-200">Versiyon:</span>
            <span className="ml-2 font-medium">
              {slaPolicy.sla_policy.version}
            </span>
          </div>
          <div>
            <span className="text-blue-200">Yürürlük:</span>
            <span className="ml-2 font-medium">
              {slaPolicy.sla_policy.effective_date}
            </span>
          </div>
          <div>
            <span className="text-blue-200">Açıklama:</span>
            <span className="ml-2 font-medium">
              {slaPolicy.sla_policy.description}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Tiers */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FiAward className="w-6 h-6 mr-3" />
          Müşteri Seviyeleri
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(slaPolicy.sla_policy.customer_tiers).map(
            ([tier, info]) => (
              <div
                key={tier}
                className="bg-gray-900 rounded-lg p-6 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getTierBadgeVariant(tier)} size="lg">
                      {tier}
                    </Badge>
                    <div>
                      <h3 className="text-white font-semibold">
                        {info.tier_name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">
                      x{info.priority_multiplier}
                    </div>
                    <div className="text-xs text-gray-400">Öncelik</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Özellikler:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {info.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        Yanıt Süreleri
                      </h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(info.response_times).map(
                          ([level, time]) => (
                            <div key={level} className="flex justify-between">
                              <span className="text-gray-400 capitalize">
                                {level}:
                              </span>
                              <span className="text-white">{time}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FiTarget className="w-4 h-4 mr-1" />
                        Çözüm Süreleri
                      </h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(info.resolution_times).map(
                          ([level, time]) => (
                            <div key={level} className="flex justify-between">
                              <span className="text-gray-400 capitalize">
                                {level}:
                              </span>
                              <span className="text-white">{time}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Priority Levels */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FiTrendingUp className="w-6 h-6 mr-3" />
          Öncelik Seviyeleri
        </h2>
        <div className="space-y-4">
          {Object.entries(slaPolicy.sla_policy.priority_levels).map(
            ([level, info]) => (
              <div
                key={level}
                className="bg-gray-900 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getPriorityBadgeVariant(level)} size="lg">
                      {level}
                    </Badge>
                    <div>
                      <h3 className="text-white font-semibold">{info.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {info.escalation_required && (
                      <Badge variant="warning" size="sm">
                        Yükseltme Gerekli
                      </Badge>
                    )}
                    {info.requires_immediate_attention && (
                      <Badge variant="danger" size="sm">
                        Acil Dikkat
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Örnekler:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {info.examples.map((example, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Issue Categories */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FiInfo className="w-6 h-6 mr-3" />
          Sorun Kategorileri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(slaPolicy.sla_policy.issue_categories).map(
            ([category, info]) => (
              <div
                key={category}
                className="bg-gray-900 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{info.name}</h3>
                  <div className="flex items-center space-x-2">
                    {info.base_priority_boost > 0 && (
                      <Badge variant="warning" size="sm">
                        +{info.base_priority_boost}
                      </Badge>
                    )}
                    {info.requires_l2 && (
                      <Badge variant="danger" size="sm">
                        L2
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase">
                    Tipik Sorunlar:
                  </h4>
                  <div className="space-y-1">
                    {info.typical_issues.map((issue, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-300 flex items-center"
                      >
                        <FiCheckCircle className="w-3 h-3 mr-2 text-green-400" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FiTarget className="w-6 h-6 mr-3" />
          Performans Hedefleri (KPI)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(slaPolicy.sla_policy.metrics_and_kpis).map(
            ([metric, info]) => (
              <div
                key={metric}
                className="bg-gray-900 rounded-lg p-4 border border-gray-600"
              >
                <h3 className="text-white font-semibold mb-2 capitalize">
                  {metric.replace(/_/g, " ")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hedef:</span>
                    <span className="text-green-400 font-medium">
                      {info.target}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ölçüm:</span>
                    <span className="text-white">{info.measurement}</span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SLAPolicyPage;
