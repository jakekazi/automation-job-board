import { useState, useEffect } from 'react';
import { applicationsApi } from '@/lib/api';
import type { Application } from '@/types';

export function useMyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await applicationsApi.getMyApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return { applications, isLoading, error, refetch: fetchApplications };
}

export function useJobApplications(jobId: string | undefined) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!jobId) return;
    try {
      setIsLoading(true);
      const data = await applicationsApi.getForJob(jobId);
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  return { applications, isLoading, error, refetch: fetchApplications };
}
