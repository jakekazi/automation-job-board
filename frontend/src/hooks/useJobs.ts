import { useState, useEffect } from 'react';
import { jobsApi } from '@/lib/api';
import type { Job } from '@/types';

export function useJobs(params?: { search?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobsApi.list(params);
      setJobs(response.jobs);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [params?.search]);

  return { jobs, total, isLoading, error, refetch: fetchJobs };
}

export function useJob(id: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const data = await jobsApi.get(id);
        setJob(data);
        setError(null);
      } catch (err) {
        setError('Failed to load job');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  return { job, isLoading, error };
}

export function useMyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobsApi.getMyJobs();
      setJobs(response.jobs);
      setError(null);
    } catch (err) {
      setError('Failed to load your jobs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return { jobs, isLoading, error, refetch: fetchJobs };
}
