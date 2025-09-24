import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Upload, Download, Star, Users, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">College Resource Hub</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <div className="container mx-auto text-center relative">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Share Knowledge,<br />Excel Together
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access thousands of study materials, share your knowledge, and collaborate with fellow students. 
            Join the largest student resource community.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Everything you need to succeed</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Upload & Share</CardTitle>
                <CardDescription>
                  Share your notes, assignments, and study materials with the community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Download Resources</CardTitle>
                <CardDescription>
                  Access thousands of high-quality study materials from your peers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Rate & Review</CardTitle>
                <CardDescription>
                  Help others find the best resources with ratings and reviews
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-lg text-muted-foreground">Study Resources</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-lg text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-lg text-muted-foreground">Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start learning?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students sharing knowledge and excelling together.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-join-now"
          >
            Join Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 College Resource Hub. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}