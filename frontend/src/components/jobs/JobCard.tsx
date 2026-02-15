import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatBudget } from '@/lib/utils';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
}

export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  const statusColors = {
    open: 'success',
    in_progress: 'warning',
    completed: 'secondary',
    cancelled: 'destructive',
  } as const;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Link
              to={`/jobs/${job.id}`}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {job.title}
            </Link>
            {job.sponsor && (
              <p className="text-sm text-muted-foreground">
                {job.sponsor.company_name || job.sponsor.full_name}
              </p>
            )}
          </div>
          <Badge variant={statusColors[job.status]}>{job.status}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatBudget(job.budget_min, job.budget_max, job.budget_type)}
            </span>
          </span>
          {job.estimated_hours && (
            <span className="text-muted-foreground">
              ~{job.estimated_hours} hours
            </span>
          )}
          {job.deadline && (
            <span className="text-muted-foreground">
              Due: {formatDate(job.deadline)}
            </span>
          )}
        </div>

        {job.ai_generated_description && (
          <Badge variant="outline" className="mt-2 text-xs">
            AI-generated
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t">
        <span className="text-sm text-muted-foreground">
          {job.application_count} applicant{job.application_count !== 1 ? 's' : ''}{' '}
          - Posted {formatDate(job.created_at)}
        </span>
        {showApplyButton && job.status === 'open' && (
          <Link to={`/jobs/${job.id}`}>
            <Button size="sm" variant="accent">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
