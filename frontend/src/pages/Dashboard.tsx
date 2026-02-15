import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useMyJobs } from '@/hooks/useJobs';
import { useMyApplications, useJobApplications } from '@/hooks/useApplications';
import { jobsApi, applicationsApi, aiApi } from '@/lib/api';
import { formatDate, formatBudget } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function SponsorDashboard() {
  const navigate = useNavigate();
  const { jobs, isLoading, refetch } = useMyJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { applications, refetch: refetchApps } = useJobApplications(selectedJobId || undefined);

  // Create job form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!brief.trim()) return;
    setIsGenerating(true);
    try {
      const result = await aiApi.generateDescription(brief);
      setTitle(result.title);
      setDescription(result.description);
      setRequirements(result.requirements);
    } catch (err) {
      console.error('Failed to generate description:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await jobsApi.create({
        title,
        description,
        requirements,
        budget_min: budgetMin ? parseInt(budgetMin) : undefined,
        budget_max: budgetMax ? parseInt(budgetMax) : undefined,
        ai_generated_description: brief.length > 0,
      });
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      setRequirements('');
      setBudgetMin('');
      setBudgetMax('');
      setBrief('');
      refetch();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    try {
      await applicationsApi.updateStatus(appId, status);
      refetchApps();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Posted Jobs</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Post New Job'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              {/* AI Generation */}
              <div className="p-4 bg-accent/10 rounded-lg space-y-2">
                <Label>Quick Create with AI</Label>
                <div className="flex gap-2">
                  <Input
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Describe your automation need briefly..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="accent"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !brief.trim()}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Budget Min ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Budget Max ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Post Job'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You haven&apos;t posted any jobs yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className={`cursor-pointer transition-colors ${
                  selectedJobId === job.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge variant={job.status === 'open' ? 'success' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.application_count} applicants - {formatDate(job.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Applications panel */}
          {selectedJobId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {app.apprentice?.full_name || 'Applicant'}
                          </span>
                          <Badge
                            variant={
                              app.status === 'accepted'
                                ? 'success'
                                : app.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        {app.cover_letter && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {app.cover_letter}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mb-2">
                          {app.proposed_rate && <span>${app.proposed_rate} </span>}
                          {app.estimated_completion_days && (
                            <span>- {app.estimated_completion_days} days</span>
                          )}
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ApprenticeDashboard() {
  const { applications, isLoading } = useMyApplications();

  const statusColors = {
    pending: 'secondary',
    accepted: 'success',
    rejected: 'destructive',
    withdrawn: 'outline',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Applications</h2>
        <Link to="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t applied to any jobs yet.
            </p>
            <Link to="/jobs">
              <Button>Find Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/jobs/${app.job_id}`}
                    className="font-semibold hover:text-primary"
                  >
                    View Job
                  </Link>
                  <Badge variant={statusColors[app.status]}>{app.status}</Badge>
                </div>
                {app.cover_letter && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {app.cover_letter}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Applied {formatDate(app.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your dashboard</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {user.full_name}!
      </p>

      {user.role === 'sponsor' ? <SponsorDashboard /> : <ApprenticeDashboard />}
    </div>
  );
}
