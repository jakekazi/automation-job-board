import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { JobList } from '@/components/jobs/JobList';
import { Input } from '@/components/ui/input';

export function Jobs() {
  const [search, setSearch] = useState('');
  const { jobs, total, isLoading, error } = useJobs({ search });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Automation Jobs</h1>
        <p className="text-muted-foreground">
          Find your next project from our community of sponsors
        </p>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        {total} job{total !== 1 ? 's' : ''} available
      </div>

      <JobList
        jobs={jobs}
        isLoading={isLoading}
        emptyMessage="No jobs match your search. Try different keywords."
      />
    </div>
  );
}
