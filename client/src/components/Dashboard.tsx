import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Star, Upload, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ResourceCard from "@/components/ResourceCard";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Fetch recent resources (limit to 6 for dashboard)
  const { data: recentResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/resources', { limit: 6, sortBy: 'newest' }],
  });

  // Transform stats data for display
  const dashboardStats = stats ? [
    { 
      title: "Total Resources", 
      value: stats.totalResources?.toString() || "0", 
      icon: BookOpen, 
      change: "+12%" // TODO: Calculate actual change
    },
    { 
      title: "Total Downloads", 
      value: stats.totalDownloads?.toString() || "0", 
      icon: Download, 
      change: "+23%" // TODO: Calculate actual change
    },
    { 
      title: "Average Rating", 
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "0.0", 
      icon: Star, 
      change: "+0.2" // TODO: Calculate actual change
    },
    { 
      title: "Active Contributors", 
      value: stats.activeUsers?.toString() || "0", 
      icon: Users, 
      change: "+8%" // TODO: Calculate actual change
    },
  ] : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening in your study hub today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          // Loading skeleton for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          dashboardStats.map((stat, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.change} from last week
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Jump into the most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button data-testid="button-upload-resource" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
            <Button variant="outline" data-testid="button-browse-resources" className="flex-1">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Resources
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Resources</h2>
          <Button variant="ghost" size="sm" data-testid="link-view-all">
            View all
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resourcesLoading ? (
            // Loading skeleton for resources
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : recentResources && recentResources.length > 0 ? (
            recentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 mb-2" />
              <p>No resources available yet. Be the first to upload!</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Subjects This Week</CardTitle>
          <CardDescription>Most active subjects in your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Psychology", "History"].map((subject) => (
              <Badge 
                key={subject} 
                variant="secondary" 
                className="hover-elevate cursor-pointer" 
                data-testid={`subject-${subject.toLowerCase().replace(' ', '-')}`}
              >
                {subject}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}