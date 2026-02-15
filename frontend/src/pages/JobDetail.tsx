import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/hooks/useJobs';
import { useAuth } from '@/lib/auth';
import { applicationsApi, aiApi } from '@/lib/api';
import { formatDate, formatBudget } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { job, isLoading, error } = useJob(id);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Link to="/jobs">
              <Button variant="link">Back to jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateCoverLetter = async () => {
    if (!id) return;
    setIsGeneratingCover(true);
    try {
      const result = await aiApi.generateCoverLetter(id);
      setCoverLetter(result.cover_letter);
    } catch (err) {
      console.error('Failed to generate cover letter:', err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await applicationsApi.create({
        job_id: id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseInt(proposedRate) : undefined,
        estimated_completion_days: estimatedDays ? parseInt(estimatedDays) : undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApply = user?.role === 'apprentice' && job.status === 'open';
  const isOwner = user?.id === job.sponsor_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  {job.sponsor && (
                    <p className="text-muted-foreground mt-1">
                      {job.sponsor.company_name || job.sponsor.full_name}
                    </p>
                  )}
                </div>
                <Badge
                  variant={job.status === 'open' ? 'success' : 'secondary'}
                >
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}

              {job.ai_generated_description && (
                <Badge variant="outline">AI-generated description</Badge>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          {canApply && !showApplyForm && (
            <Button onClick={() => setShowApplyForm(true)} className="w-full">
              Apply to this Job
            </Button>
          )}

          {showApplyForm && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Application</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {submitError && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="coverLetter">Cover Letter</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateCoverLetter}
                        disabled={isGeneratingCover}
                      >
                        {isGeneratingCover ? 'Generating...' : 'Generate with AI'}
                      </Button>
                    </div>
                    <Textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Why are you a great fit for this project?"
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposedRate">Proposed Rate ($)</Label>
                      <Input
                        id="proposedRate"
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder="Your rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDays">Est. Completion (days)</Label>
                      <Input
                        id="estimatedDays"
                        type="number"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        placeholder="Days to complete"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Link to={`/dashboard`}>
              <Button variant="outline" className="w-full">
                View Applications in Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  {formatBudget(job.budget_min, job.budget_max, job.budget_type)}
                </p>
              </div>

              {job.estimated_hours && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Hours</p>
                  <p className="font-semibold">~{job.estimated_hours} hours</p>
                </div>
              )}

              {job.deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold">{formatDate(job.deadline)}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="font-semibold">{formatDate(job.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Applicants</p>
                <p className="font-semibold">{job.application_count}</p>
              </div>
            </CardContent>
          </Card>

          {!user && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to apply for this job
                </p>
                <Link to="/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
