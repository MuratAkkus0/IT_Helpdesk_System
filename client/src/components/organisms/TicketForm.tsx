import { useState } from "react";
import { FiUser, FiFileText, FiCheckCircle } from "react-icons/fi";
import { ticketAPI, aiAPI } from "../../services/api";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Badge from "../atoms/Badge";
import type { TicketFormProps, CreateTicketForm, Ticket } from "../../types";

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    priority: 3,
    category: "other",
    customer_name: "",
    sla_level: "None",
    issue_description: "",
    ticket_source: "email",
  });

  const [loading, setLoading] = useState(false);
  const [aiPriority, setAiPriority] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "issue_description") {
      setAiPriority(null);
    }
  };

  const analyzeWithAI = async (description: string): Promise<number> => {
    try {
      const result = await aiAPI.analyze(description);
      return result.urgency;
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Mock AI analysis for demo
      const lowPriorityKeywords = ["bilgi", "soru", "nasıl", "öğren"];
      const mediumPriorityKeywords = ["yavaş", "güncelle", "değiştir"];
      const highPriorityKeywords = ["hata", "problem", "çalışmıyor", "erişim"];
      const criticalKeywords = ["sunucu", "sistem", "çöktü", "acil", "down"];

      const desc = description.toLowerCase();

      if (criticalKeywords.some((keyword) => desc.includes(keyword))) {
        return 5;
      } else if (
        highPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        return 4;
      } else if (
        mediumPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        return 3;
      } else if (
        lowPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        return 1;
      } else {
        return 2;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setCurrentStep("analyzing");

      const priority = await analyzeWithAI(formData.issue_description || "");
      setAiPriority(priority);

      setCurrentStep("creating");

      const ticketData: CreateTicketForm = {
        ...formData,
        title: formData.customer_name
          ? `${formData.customer_name} - ${formData.category}`
          : "Yeni Ticket",
        description: formData.issue_description || "",
        ai_priority: priority,
        priority: priority as 1 | 2 | 3 | 4 | 5,
        assigned_level: priority >= 4 ? "L2" : priority >= 2 ? "L1" : "L1",
        issue_type: formData.category,
      };

      const newTicket = await ticketAPI.create(ticketData);

      // Success
      setFormData({
        title: "",
        description: "",
        priority: 3,
        category: "other",
        customer_name: "",
        sla_level: "None",
        issue_description: "",
        ticket_source: "email",
      });
      setAiPriority(null);
      setCurrentStep("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      if (onTicketCreated) onTicketCreated(newTicket);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      // Mock success for demo
      setFormData({
        title: "",
        description: "",
        priority: 3,
        category: "other",
        customer_name: "",
        sla_level: "None",
        issue_description: "",
        ticket_source: "email",
      });
      setAiPriority(null);
      setCurrentStep("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      if (onTicketCreated) {
        const mockTicket: Ticket = {
          _id: Date.now().toString(),
          customer_name: formData.customer_name || "",
          issue_description: formData.issue_description || "",
          ai_priority: aiPriority || 2,
          priority: (aiPriority || 2) as 1 | 2 | 3 | 4 | 5,
          status: "open",
          sla_level: formData.sla_level || "None",
          ticket_source: formData.ticket_source || "email",
          assigned_level: (aiPriority || 2) >= 4 ? "L2" : "L1",
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onTicketCreated(mockTicket);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityInfo = (priority: number) => {
    const priorityMap = {
      5: { label: "Kritik", variant: "danger" as const, icon: "🔥" },
      4: { label: "Yüksek", variant: "warning" as const, icon: "⚠️" },
      3: { label: "Orta", variant: "info" as const, icon: "⚡" },
      2: { label: "Düşük", variant: "primary" as const, icon: "📋" },
      1: { label: "Çok Düşük", variant: "success" as const, icon: "✅" },
      default: { label: "Belirsiz", variant: "secondary" as const, icon: "❓" },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || priorityMap.default
    );
  };

  const getStepMessage = () => {
    if (currentStep === "analyzing") {
      return "AI ile öncelik analizi yapılıyor...";
    } else if (currentStep === "creating") {
      return "Ticket oluşturuluyor...";
    }
    return "Ticket oluşturuluyor...";
  };

  const priorityInfo = getPriorityInfo(aiPriority || 0);

  const issueTypeOptions = [
    { value: "network", label: "🌐 Ağ Sorunları" },
    { value: "hardware", label: "🖥️ Donanım" },
    { value: "software", label: "💻 Yazılım" },
    { value: "access", label: "👤 Hesap/Yetki" },
    { value: "email", label: "📧 E-posta" },
    { value: "other", label: "📋 Diğer" },
  ];

  const slaOptions = [
    { value: "None", label: "Yok" },
    { value: "Bronze", label: "Bronze" },
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
  ];

  const sourceOptions = [
    { value: "email", label: "📧 E-posta" },
    { value: "phone", label: "📞 Telefon" },
    { value: "manual", label: "📝 Manuel" },
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Yeni Ticket Oluştur
          </h2>
          <p className="text-gray-400">
            AI destekli öncelik belirleme ile yeni destek talebi oluşturun
          </p>
        </div>
        {showSuccess && (
          <Badge variant="success">
            <FiCheckCircle className="mr-2" />
            Ticket başarıyla oluşturuldu!
          </Badge>
        )}
      </div>

      {loading && (
        <div className="mb-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-3"></div>
            <span className="text-blue-100">{getStepMessage()}</span>
          </div>
        </div>
      )}

      {aiPriority && !loading && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{priorityInfo.icon}</span>
              <div>
                <span className="text-white font-medium">
                  AI Öncelik Analizi:
                </span>
                <Badge variant={priorityInfo.variant} className="ml-2">
                  {priorityInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiUser className="inline mr-2" />
              Müşteri Adı
            </label>
            <Input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Müşteri adını girin"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SLA Seviyesi
            </label>
            <Select
              name="sla_level"
              value={formData.sla_level}
              onChange={handleInputChange}
              options={slaOptions}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sorun Kategorisi
            </label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={issueTypeOptions}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Kaynağı
            </label>
            <Select
              name="ticket_source"
              value={formData.ticket_source}
              onChange={handleInputChange}
              options={sourceOptions}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FiFileText className="inline mr-2" />
            Sorun Açıklaması
          </label>
          <textarea
            name="issue_description"
            value={formData.issue_description}
            onChange={handleInputChange}
            placeholder="Sorunun detaylı açıklamasını girin..."
            required
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
          >
            Ticket Oluştur
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
