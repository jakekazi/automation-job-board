import axios from 'axios';
import type { 
  User, 
  RegisterData, 
  Token, 
  Job, 
  JobListResponse, 
  Application, 
  GeneratedDescription,
  ApplicationStatus 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (auto-logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('auth_token');
      // Optional: Could dispatch a logout event or redirect here
    }
    return Promise.reject(error);
  }
);

// Auth API functions

/**
 * Login with email and password
 * Note: Backend uses OAuth2PasswordRequestForm which expects form data
 */
export async function apiLogin(email: string, password: string): Promise<Token> {
  try {
    // OAuth2PasswordRequestForm expects 'username' field (not 'email')
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await apiClient.post<Token>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Login failed. Please try again.';
    throw new Error(message);
  }
}

/**
 * Register a new user
 * Returns User object but no token (must login after)
 */
export async function apiRegister(data: RegisterData): Promise<User> {
  try {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Registration failed. Please try again.';
    throw new Error(message);
  }
}

/**
 * Get current authenticated user
 * Requires valid token in localStorage
 */
export async function apiGetCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Failed to fetch user data.';
    throw new Error(message);
  }
}

// Jobs API

export const jobsApi = {
  /**
   * List all jobs with optional search
   */
  async list(params?: { search?: string }): Promise<JobListResponse> {
    try {
      const response = await apiClient.get<JobListResponse>('/jobs', { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch jobs.';
      throw new Error(message);
    }
  },

  /**
   * Get a specific job by ID
   */
  async get(id: string): Promise<Job> {
    try {
      const response = await apiClient.get<Job>(`/jobs/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch job details.';
      throw new Error(message);
    }
  },

  /**
   * Get current user's jobs (sponsor only)
   */
  async getMyJobs(): Promise<JobListResponse> {
    try {
      const response = await apiClient.get<JobListResponse>('/jobs/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch your jobs.';
      throw new Error(message);
    }
  },

  /**
   * Create a new job (sponsor only)
   */
  async create(data: {
    title: string;
    description: string;
    requirements?: string;
    budget_min?: number;
    budget_max?: number;
    budget_type?: 'fixed' | 'hourly';
    estimated_hours?: number;
    deadline?: string;
    ai_generated_description?: boolean;
  }): Promise<Job> {
    try {
      const response = await apiClient.post<Job>('/jobs', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create job.';
      throw new Error(message);
    }
  },
};

// Applications API

export const applicationsApi = {
  /**
   * Create a new application (apprentice only)
   */
  async create(data: {
    job_id: string;
    cover_letter?: string;
    proposed_rate?: number;
    estimated_completion_days?: number;
  }): Promise<Application> {
    try {
      const response = await apiClient.post<Application>('/applications', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to submit application.';
      throw new Error(message);
    }
  },

  /**
   * Get current user's applications (apprentice only)
   */
  async getMyApplications(): Promise<Application[]> {
    try {
      const response = await apiClient.get<Application[]>('/applications');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch applications.';
      throw new Error(message);
    }
  },

  /**
   * Get applications for a specific job (sponsor only)
   */
  async getForJob(jobId: string): Promise<Application[]> {
    try {
      const response = await apiClient.get<Application[]>(`/applications/job/${jobId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch job applications.';
      throw new Error(message);
    }
  },

  /**
   * Update application status (sponsor only)
   */
  async updateStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
    try {
      const response = await apiClient.patch<Application>(
        `/applications/${applicationId}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update application status.';
      throw new Error(message);
    }
  },
};

// AI API

export const aiApi = {
  /**
   * Generate job description from a brief (sponsor only)
   */
  async generateDescription(brief: string): Promise<GeneratedDescription> {
    try {
      const response = await apiClient.post<GeneratedDescription>('/ai/generate-description', {
        brief,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to generate description.';
      throw new Error(message);
    }
  },

  /**
   * Generate cover letter for a job (apprentice only)
   */
  async generateCoverLetter(jobId: string): Promise<{ cover_letter: string }> {
    try {
      const response = await apiClient.post<{ cover_letter: string }>(
        '/ai/generate-cover-letter',
        { job_id: jobId }
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to generate cover letter.';
      throw new Error(message);
    }
  },
};
