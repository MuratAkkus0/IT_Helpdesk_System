// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Ticket types - Updated to match backend structure
export interface Ticket {
  _id: string;
  title?: string;
  description?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  category?: string;
  requester?: string;
  assignedTo?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  escalationLevel?: "l1" | "l2" | "l3";

  // Backend specific fields
  customer_name: string;
  issue_description: string;
  ai_priority: number;
  sla_level: string;
  ticket_source: string;
  assigned_level: string;
  created_at: string;

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

// AI Analysis Result
export interface AIAnalysisResult {
  urgency: number;
  category: string;
  confidence: number;
  ai_priority?: number;
  suggestions?: string[];
}

// Stats types
export interface TicketStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed?: number;
    l1: number;
    l2: number;
    l3?: number;
  };
  priorityDistribution: PriorityDistribution[];
  categoryDistribution?: CategoryDistribution[];
  timeMetrics?: {
    averageResolutionTime: number;
    averageResponseTime: number;
  };
}

export interface PriorityDistribution {
  priority: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
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
  onClick?: () => void;
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

// Molecule component props
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

// Organism component props
export interface TicketFormProps {
  onTicketCreated?: (ticket: Ticket) => void;
  ticket?: Ticket;
  onUpdate?: (ticket: Ticket) => void;
}

export interface TicketListProps {
  refreshTrigger?: number;
  searchQuery?: string;
  onTicketSelect?: (ticket: Ticket) => void;
  onRefresh?: () => void;
}

export interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
}

export interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

// Context types
export interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Dashboard specific types
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

// Form types
export interface CreateTicketForm {
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  category: string;
  // Backend specific fields
  customer_name?: string;
  issue_description?: string;
  issue_type?: string;
  ai_priority?: number;
  sla_level?: string;
  ticket_source?: string;
  assigned_level?: string;
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
  createdAt: Date;
}

// Utility types
export type Loading = boolean;
export type ErrorMessage = string | null;
