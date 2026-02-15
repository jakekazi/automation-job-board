import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Connect. Automate. Grow.
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
            The community job board where AITB sponsors find talented apprentices
            for AI automation projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=sponsor">
              <Button size="lg" variant="accent" className="w-full sm:w-auto">
                Post a Job
              </Button>
            </Link>
            <Link to="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20"
              >
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Sponsors */}
            <div>
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm">
                  S
                </span>
                For Sponsors
              </h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Post Your Request', desc: 'Describe the automation task you need help with' },
                  { step: '2', title: 'Review Applicants', desc: 'Browse apprentice profiles and applications' },
                  { step: '3', title: 'Collaborate', desc: 'Work with your chosen apprentice to deliver results' },
                ].map((item) => (
                  <Card key={item.step}>
                    <CardContent className="flex gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* For Apprentices */}
            <div>
              <h3 className="text-xl font-semibold text-accent-700 mb-6 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm">
                  A
                </span>
                For Apprentices
              </h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Create Your Profile', desc: 'Showcase your automation skills and experience' },
                  { step: '2', title: 'Apply to Projects', desc: 'Find projects that match your interests' },
                  { step: '3', title: 'Build Your Portfolio', desc: 'Gain real-world experience and grow your skills' },
                ].map((item) => (
                  <Card key={item.step}>
                    <CardContent className="flex gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the AITB community and start connecting with talented automation
            professionals today.
          </p>
          <Link to="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
