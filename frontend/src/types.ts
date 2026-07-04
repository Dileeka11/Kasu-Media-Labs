export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  created_at?: string;
}

export interface Client {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  projects_count?: number;
  created_at?: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';

export interface Project {
  id: number;
  client_id: number;
  client?: Client;
  name: string;
  type: string;
  status: ProjectStatus;
  budget: number;
  deadline: string | null;
  description: string | null;
  created_at?: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  active: boolean;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: number;
  client_id: number;
  client?: Client;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  total: number;
  items?: InvoiceItem[];
  created_at?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  service_interest: string | null;
  status: LeadStatus;
  message: string | null;
  created_at?: string;
}

export interface DashboardStats {
  revenue: number;
  outstanding: number;
  active_projects: number;
  total_clients: number;
  new_leads: number;
  monthly_revenue: { month: string; revenue: number }[];
  recent_projects: Project[];
  recent_leads: Lead[];
}
