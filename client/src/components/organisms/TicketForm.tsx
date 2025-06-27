import { useState } from "react";
import { FiUser, FiFileText } from "react-icons/fi";
import { ticketAPI, aiAPI } from "../../services/api";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Badge from "../atoms/Badge";
import type {
  TicketFormProps,
  CreateTicketForm,
  AIAnalysisResult,
} from "../../types";

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const [formData, setFormData] = useState<CreateTicketForm>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    issue_description: "",
    issue_type: "other",
    ticket_source: "email",
    sla_level: "None",
  });

  const [loading, setLoading] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

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
      setAiAnalysis(null);
    }
  };

  const analyzeWithAI = async (
    description: string
  ): Promise<AIAnalysisResult> => {
    try {
      const result = await aiAPI.analyze(description);
      return result;
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Mock AI analysis for demo
      const lowPriorityKeywords = ["info", "question", "how", "learn"];
      const mediumPriorityKeywords = ["slow", "update", "change"];
      const highPriorityKeywords = [
        "error",
        "problem",
        "not working",
        "access",
      ];
      const criticalKeywords = [
        "server",
        "system",
        "crashed",
        "urgent",
        "down",
      ];
      const passwordKeywords = ["password", "reset", "login", "forgot"];

      const desc = description.toLowerCase();
      let priority = 2;
      let isComplex = false;
      let requiresPasswordReset = false;

      if (criticalKeywords.some((keyword) => desc.includes(keyword))) {
        priority = 5;
        isComplex = true;
      } else if (
        highPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        priority = 4;
        isComplex = true;
      } else if (
        mediumPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        priority = 3;
      } else if (
        lowPriorityKeywords.some((keyword) => desc.includes(keyword))
      ) {
        priority = 1;
      }

      if (passwordKeywords.some((keyword) => desc.includes(keyword))) {
        requiresPasswordReset = true;
        priority = Math.max(priority, 2);
      }

      return {
        priority,
        is_complex: isComplex,
        requires_password_reset: requiresPasswordReset,
        suggested_solution: isComplex
          ? "Escalate to L2 support"
          : "Standard troubleshooting",
        estimated_resolution_time: isComplex ? "2-4 hours" : "30-60 minutes",
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiAnalysisLoading(true);
    setAiAnalysisError(null);

    try {
      // Analyze the issue with AI
      console.log("Starting AI analysis...");
      const analysis = await analyzeWithAI(formData.issue_description);
      setAiAnalysis(analysis);
      setAiAnalysisLoading(false);
      console.log("AI analysis completed:", analysis);

      const ticketData: CreateTicketForm = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        issue_description: formData.issue_description,
        issue_type: formData.issue_type,
        ticket_source: formData.ticket_source,
        sla_level: formData.sla_level,
        assigned_level: analysis.priority >= 4 ? "L2" : "L1",
      };

      console.log("Creating ticket...");
      const response = await ticketAPI.create(ticketData);
      console.log("Ticket created successfully:", response);

      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        issue_description: "",
        issue_type: "other",
        ticket_source: "email",
        sla_level: "None",
      });

      setAiAnalysis(null);
      setAiAnalysisError(null);

      if (onTicketCreated) {
        onTicketCreated(response);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setAiAnalysisError(
        "AI analysis timed out, but ticket will be created with default priority"
      );

      // Try to create ticket without AI analysis as fallback
      try {
        const ticketData: CreateTicketForm = {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          issue_description: formData.issue_description,
          issue_type: formData.issue_type,
          ticket_source: formData.ticket_source,
          sla_level: formData.sla_level,
          assigned_level: "L1", // Default to L1
        };

        const response = await ticketAPI.create(ticketData);
        console.log("Ticket created without AI analysis:", response);

        if (onTicketCreated) {
          onTicketCreated(response);
        }

        // Clear form
        setFormData({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          issue_description: "",
          issue_type: "other",
          ticket_source: "email",
          sla_level: "None",
        });
      } catch (fallbackError) {
        console.error(
          "Failed to create ticket even without AI:",
          fallbackError
        );
        alert("Failed to create ticket. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
      setAiAnalysisLoading(false);
    }
  };

  const getPriorityInfo = (priority: number) => {
    const priorityMap = {
      5: { label: "Critical", variant: "danger" as const, icon: "🔥" },
      4: { label: "High", variant: "warning" as const, icon: "⚠️" },
      3: { label: "Medium", variant: "info" as const, icon: "⚡" },
      2: { label: "Low", variant: "primary" as const, icon: "📋" },
      1: { label: "Very Low", variant: "success" as const, icon: "✅" },
      default: { label: "Unknown", variant: "secondary" as const, icon: "❓" },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || priorityMap.default
    );
  };

  const priorityInfo = getPriorityInfo(aiAnalysis?.priority || 0);

  const issueTypeOptions = [
    { value: "network", label: "🌐 Network Issues" },
    { value: "hardware", label: "🖥️ Hardware" },
    { value: "software", label: "💻 Software" },
    { value: "access", label: "👤 Account/Access" },
    { value: "email", label: "📧 Email" },
    { value: "other", label: "🔧 Other" },
  ];

  const ticketSourceOptions = [
    { value: "email", label: "📧 Email" },
    { value: "phone", label: "📞 Phone" },
    { value: "manual", label: "📝 Manual Entry" },
  ];

  const slaOptions = [
    { value: "Gold", label: "🥇 Gold" },
    { value: "Silver", label: "🥈 Silver" },
    { value: "Bronze", label: "🥉 Bronze" },
    { value: "None", label: "⚪ None" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* AI Analysis Loading State */}
      {aiAnalysisLoading && (
        <div className="mb-6 bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <h4 className="text-yellow-100 font-medium mb-2 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-100 mr-2"></div>
            🤖 AI Analysis in Progress...
          </h4>
          <p className="text-yellow-200 text-sm">
            Analyzing your issue to determine priority and suggested solution.
            This may take up to 60 seconds.
          </p>
        </div>
      )}

      {/* AI Analysis Error */}
      {aiAnalysisError && (
        <div className="mb-6 bg-orange-900 border border-orange-600 rounded-lg p-4">
          <h4 className="text-orange-100 font-medium mb-2">
            ⚠️ AI Analysis Notice
          </h4>
          <p className="text-orange-200 text-sm">{aiAnalysisError}</p>
        </div>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="mb-6 bg-blue-900 border border-blue-600 rounded-lg p-4">
          <h4 className="text-blue-100 font-medium mb-3">
            🤖 AI Analysis Results
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Priority:</span>
              <Badge variant={priorityInfo.variant} size="sm">
                {priorityInfo.icon} {priorityInfo.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Complexity:</span>
              <Badge
                variant={aiAnalysis.is_complex ? "warning" : "success"}
                size="sm"
              >
                {aiAnalysis.is_complex ? "🔄 Complex" : "✅ Simple"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Password Reset:</span>
              <Badge
                variant={
                  aiAnalysis.requires_password_reset ? "info" : "secondary"
                }
                size="sm"
              >
                {aiAnalysis.requires_password_reset
                  ? "🔑 Required"
                  : "❌ Not Required"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Est. Time:</span>
              <span className="text-blue-100 text-sm">
                {aiAnalysis.estimated_resolution_time}
              </span>
            </div>
          </div>
          {aiAnalysis.suggested_solution && (
            <div className="mt-3 pt-3 border-t border-blue-600">
              <span className="text-blue-200 text-sm">Suggested Solution:</span>
              <p className="text-blue-100 text-sm mt-1">
                {aiAnalysis.suggested_solution}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Create Support Ticket
          </h2>
          <p className="text-gray-400">
            Fill out the form below to create a new support request
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <FiUser className="mr-2" />
              Customer Information
            </h3>

            <Input
              type="text"
              name="customer_name"
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              className="bg-gray-900 border-gray-600 text-white"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                name="customer_email"
                placeholder="Email Address"
                value={formData.customer_email || ""}
                onChange={handleInputChange}
                className="bg-gray-900 border-gray-600 text-white"
              />

              <Input
                type="tel"
                name="customer_phone"
                placeholder="Phone Number"
                value={formData.customer_phone || ""}
                onChange={handleInputChange}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <Select
              name="sla_level"
              value={formData.sla_level}
              onChange={handleInputChange}
              options={slaOptions}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          {/* Issue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <FiFileText className="mr-2" />
              Issue Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="issue_type"
                value={formData.issue_type}
                onChange={handleInputChange}
                options={issueTypeOptions}
                required
                className="bg-gray-900 border-gray-600 text-white"
              />

              <Select
                name="ticket_source"
                value={formData.ticket_source}
                onChange={handleInputChange}
                options={ticketSourceOptions}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Issue Description *
              </label>
              <textarea
                name="issue_description"
                rows={4}
                placeholder="Describe the issue in detail..."
                value={formData.issue_description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
                <span className="text-blue-100">Processing...</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating Ticket..." : "Create Ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
