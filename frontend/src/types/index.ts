export type UserRole = 'sponsor' | 'apprentice';
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  bio?: string;
  company_name?: string;
  company_website?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  created_at: string;
}

export interface Job {
  id: string;
  sponsor_id: string;
  sponsor?: User;
  title: string;
  description: string;
  requirements?: string;
  budget_min?: number;
  budget_max?: number;
  budget_type: 'fixed' | 'hourly';
  estimated_hours?: number;
  deadline?: string;
  status: JobStatus;
  ai_generated_description: boolean;
  application_count: number;
  created_at: string;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
}

export interface Application {
  id: string;
  job_id: string;
  apprentice_id: string;
  apprentice?: User;
  cover_letter?: string;
  proposed_rate?: number;
  estimated_completion_days?: number;
  status: ApplicationStatus;
  ai_match_score?: number;
  ai_generated_cover_letter: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
  bio?: string;
  company_name?: string;
  portfolio_url?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface GeneratedDescription {
  title: string;
  description: string;
  requirements: string;
}
