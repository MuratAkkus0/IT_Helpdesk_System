// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// EPK Workflow Types
export type ProcessStage =
  | "ticket_created"
  | "sla_prioritized"
  | "ai_categorized"
  | "in_support_queue"
  | "being_processed"
  | "awaiting_customer"
  | "solution_provided"
  | "feedback_requested"
  | "completed";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "escalated"
  | "resolved"
  | "closed";

export interface SolutionStep {
  step: string;
  timestamp: Date | string;
  performed_by: string;
}

export interface CustomerFeedback {
  rating: number;
  comment: string;
  feedback_date: Date | string;
}

// Enhanced Ticket interface for EPK workflow
export interface Ticket {
  _id: string;

  // Basic Customer Information
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  sla_level: "Gold" | "Silver" | "Bronze" | "None";

  // Issue Details
  issue_description: string;
  issue_type:
    | "network"
    | "software"
    | "access"
    | "hardware"
    | "email"
    | "other";
  ticket_source: "email" | "phone" | "manual";

  // EPK Process Fields
  is_complex_ticket: boolean;
  requires_password_reset: boolean;
  auto_response_sent: boolean;
  customer_waiting_for_response: boolean;

  // Priorities and Assignment
  created_at: Date | string;
  sla_priority: number;
  ai_priority: number;
  final_priority: number;
  assigned_level: "L1" | "L2";

  // Resolution Details
  resolution_method: "phone" | "email" | "portal";
  status: TicketStatus;
  assigned_to?: string;

  // Solution and Follow-up
  solution_steps: SolutionStep[];
  resolution_notes: string;
  customer_feedback?: CustomerFeedback;

  // Timestamps
  escalated_at?: Date | string;
  resolved_at?: Date | string;
  closed_at?: Date | string;

  // Process tracking
  process_stage: ProcessStage;

  // Legacy fields for backward compatibility
  title?: string;
  description?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  category?: string;
  requester?: string;
  assignedTo?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  escalationLevel?: "l1" | "l2" | "l3";

  aiPredictions?: {
    urgency: number;
    category: string;
    confidence: number;
  };
}

// Component specific interfaces
export interface FilterOption {
  value: string;
  label: string;
}

export interface TabOption {
  key: string;
  label: string;
}

// Enhanced AI Analysis Result for EPK
export interface AIAnalysisResult {
  priority: number;
  is_complex: boolean;
  requires_password_reset: boolean;
  suggested_solution: string;
  estimated_resolution_time: string;

  // Legacy fields
  urgency?: number;
  category?: string;
  confidence?: number;
  ai_priority?: number;
  suggestions?: string[];
}

// Enhanced Stats types for EPK workflow
export interface TicketStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    l1: number;
    l2: number;
    l3?: number;
    complexTickets: number;
    passwordResets: number;
  };
  priorityDistribution: PriorityDistribution[];
  processStageDistribution: Array<{ _id: string; count: number }>;
  customerSatisfaction: { avgRating: number; totalFeedback: number };
  categoryDistribution?: CategoryDistribution[];
  timeMetrics?: {
    averageResolutionTime: number;
    averageResponseTime: number;
  };
}

export interface PriorityDistribution {
  _id: number;
  count: number;
  priority?: 1 | 2 | 3 | 4 | 5; // Legacy
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

// EPK Workflow API Types
export interface WorkflowStats {
  workflow_distribution: Array<{
    _id: string;
    count: number;
    avg_priority: number;
    complex_tickets: number;
    password_resets: number;
  }>;
  automation_metrics: {
    total_tickets: number;
    auto_responses_sent: number;
    complex_tickets: number;
    password_resets: number;
    escalated_tickets: number;
  };
}

export interface PendingAutomation {
  pending_auto_response: Ticket[];
  pending_password_reset: Ticket[];
  pending_escalation: Ticket[];
}

export interface BulkAutomationResult {
  success: boolean;
  processed: number;
  results: Array<{
    ticket_id: string;
    success: boolean;
    message: string;
  }>;
}

// Enhanced Create Ticket Response for EPK
export interface CreateTicketResponse {
  ticket: Ticket;
  auto_response: string;
  ai_analysis: AIAnalysisResult;
}

// Component props types
export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

export interface SelectProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

// Enhanced Molecule component props for EPK
export interface FilterGroupProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export interface TabFiltersProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (key: string) => void;
  filters?: FilterOption[];
  onFilterClick?: () => void;
}

// Layout types
export interface HeaderProps {
  title: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

// Enhanced Organism component props for EPK
export interface TicketFormProps {
  onTicketCreated?: (response: CreateTicketResponse) => void;
  ticket?: Ticket;
  onUpdate?: (ticket: Ticket) => void;
}

export interface TicketListProps {
  refreshTrigger?: number;
  searchQuery?: string;
  onTicketSelect?: (ticket: Ticket) => void;
  onRefresh?: () => void;
  processStageFilter?: ProcessStage;
}

export interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  showWorkflowControls?: boolean;
}

export interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onRefresh: () => void;
  showWorkflowActions?: boolean;
}

// EPK Workflow Component Props
export interface WorkflowControlsProps {
  ticket: Ticket;
  onAdvanceStage: (ticket: Ticket) => void;
  onTriggerAutomation: (ticket: Ticket, action: string) => void;
}

export interface FeedbackFormProps {
  ticketId: string;
  onFeedbackSubmitted: (feedback: CustomerFeedback) => void;
}

export interface AutomationPanelProps {
  pendingAutomation: PendingAutomation;
  onBulkAction: (action: string, ticketIds: string[]) => void;
}

export interface WorkflowStatsProps {
  stats: WorkflowStats;
}

export interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "warning" | "info" | "success";
  description: string;
}

export interface PriorityInfo {
  label: string;
  variant: "primary" | "secondary" | "warning" | "info" | "success" | "danger";
}

export interface PriorityLabels {
  [key: number]: PriorityInfo;
}

export interface CreateTicketForm {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  issue_description: string;
  issue_type:
    | "email"
    | "other"
    | "network"
    | "hardware"
    | "software"
    | "access";
  ticket_source: "email" | "phone" | "manual";
  sla_level?: "Gold" | "Silver" | "Bronze" | "None";
  assigned_level?: "L1" | "L2";
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
  createdAt: Date;
}

export type Loading = boolean;
export type ErrorMessage = string | null;
