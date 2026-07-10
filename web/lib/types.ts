export type Role = 'owner' | 'editor' | 'producer' | 'viewer';

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
  logo?: string | null;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

// The payload returned by GET /api/public/site — the single source of content
// for the whole public website, driven by the admin panel.
export interface SiteData {
  studio_name: string;
  contact_email: string;
  font: string;
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
  ticker_items: string[] | null;
  ticker_font: string | null;
  about_image_url: string | null;
  about_kicker: string | null;
  about_heading: string | null;
  about_body1: string | null;
  about_body2: string | null;
  about_features: string[] | null;
  gear_image_url: string | null;
  gear_kicker: string | null;
  gear_heading: string | null;
  gear_body: string | null;
  gear_items: string[] | null;
  projects: Project[];
  categories: Category[];
}
