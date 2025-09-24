import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Award, Upload, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ContributorStats {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  resourceCount: number;
  totalDownloads: number;
  averageRating: number;
  joinedAt: string;
}

export default function TopContributors() {
  // Mock data for now - in a real app this would fetch from API
  const mockContributors: ContributorStats[] = [
    {
      id: "1",
      username: "study_master",
      firstName: "Alex",
      lastName: "Chen",
      email: "alex@example.com",
      resourceCount: 47,
      totalDownloads: 1250,
      averageRating: 4.8,
      joinedAt: "2024-01-15"
    },
    {
      id: "2", 
      username: "math_wizard",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      resourceCount: 32,
      totalDownloads: 890,
      averageRating: 4.6,
      joinedAt: "2024-02-20"
    },
    {
      id: "3",
      username: "cs_guru",
      firstName: "Michael",
      lastName: "Rodriguez",
      email: "michael@example.com", 
      resourceCount: 28,
      totalDownloads: 675,
      averageRating: 4.7,
      joinedAt: "2024-03-10"
    }
  ];

  const { data: contributors, isLoading } = useQuery({
    queryKey: ['/api/contributors'],
    queryFn: () => {
      // Simulate API call - replace with real API endpoint
      return Promise.resolve(mockContributors);
    },
  });

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username ? username.slice(0, 2).toUpperCase() : "U";
  };

  const getDisplayName = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return username || "Unknown User";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          Top Contributors
        </h1>
        <p className="text-muted-foreground mt-1">
          Recognize the most active members of our learning community
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : contributors?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active community members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                contributors?.reduce((sum, c) => sum + c.resourceCount, 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Resources shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                contributors?.reduce((sum, c) => sum + c.totalDownloads, 0).toLocaleString() || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Times downloaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contributors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Top contributors ranked by resources shared and community impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 py-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : contributors && contributors.length > 0 ? (
            <div className="space-y-4">
              {contributors.map((contributor, index) => (
                <div 
                  key={contributor.id} 
                  className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                  data-testid={`contributor-${contributor.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(contributor.firstName, contributor.lastName, contributor.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {getDisplayName(contributor.firstName, contributor.lastName, contributor.username)}
                      </p>
                      {index === 0 && <Badge variant="default" className="text-xs">Top Contributor</Badge>}
                      {index === 1 && <Badge variant="secondary" className="text-xs">Rising Star</Badge>}
                      {index === 2 && <Badge variant="outline" className="text-xs">Community Hero</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{contributor.username} • Joined {new Date(contributor.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {contributor.resourceCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Resources
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {contributor.totalDownloads.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Downloads
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <span>{contributor.averageRating.toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-8 w-8 mb-2" />
              <p>No contributors found yet.</p>
              <p className="text-sm mt-1">Be the first to share resources with the community!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}