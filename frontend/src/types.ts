export type Role = 'owner' | 'editor' | 'producer' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  last_active_at: string | null;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  projects_count?: number;
}

export type ProjectStatus = 'published' | 'draft' | 'review';

export interface Project {
  id: number;
  category_id: number;
  category?: Category;
  title: string;
  client: string | null;
  video_url: string | null;
  duration: string | null;
  thumbnail: string | null;
  thumbnail_url: string | null;
  status: ProjectStatus;
  views: number;
  published_at: string | null;
  created_at?: string;
}

export interface Inquiry {
  id: number;
  name: string;
  company: string | null;
  email: string;
  type: string | null;
  budget: string | null;
  message: string | null;
  unread: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  title: string;
  meta: string | null;
  created_at: string;
}

export interface Socials {
  instagram?: string;
  youtube?: string;
  vimeo?: string;
  linkedin?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ClientItem {
  name: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface Settings {
  studio_name: string;
  contact_email: string;
  font: string;
  email_on_inquiries: boolean;
  auto_publish: boolean;
  show_drafts: boolean;
  logo_url: string | null;
  hero_video_url: string | null;
  showreel_url: string | null;
  hero_kicker: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  phone: string | null;
  address: string | null;
  socials: Socials | null;
  stats: Stat[] | null;
  clients: ClientItem[] | null;
  testimonials: Testimonial[] | null;
}

export interface DashboardData {
  total_projects: number;
  projects_this_month: number;
  total_views: number;
  views_delta: number;
  new_inquiries: number;
  unread_inquiries: number;
  published: number;
  drafts: number;
  chart_bars: number[];
  activity: Activity[];
}
