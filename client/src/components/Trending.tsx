import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, Eye, Star, Calendar, BookOpen, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface TrendingResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  fileType: string;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  uploadedAt: string;
  uploader: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  trendingScore: number;
  growthRate: number;
}

interface TrendingSubject {
  subject: string;
  resourceCount: number;
  totalDownloads: number;
  growthRate: number;
}

export default function Trending() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const { data: trendingResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/trending/resources', timeframe],
    queryFn: async () => {
      const params = new URLSearchParams({ timeframe });
      const response = await fetch(`/api/trending/resources?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending resources');
      }
      return response.json();
    },
  });

  const { data: trendingSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/trending/subjects', timeframe],
    queryFn: async () => {
      const params = new URLSearchParams({ timeframe });
      const response = await fetch(`/api/trending/subjects?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending subjects');
      }
      return response.json();
    },
  });

  const getUploaderDisplayName = (uploader: any) => {
    if (uploader.firstName && uploader.lastName) {
      return `${uploader.firstName} ${uploader.lastName}`;
    }
    return uploader.username;
  };

  const getTrendingBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary"; 
    return "outline";
  };

  const getTrendingBadgeText = (score: number) => {
    if (score >= 80) return "🔥 Hot";
    if (score >= 60) return "📈 Rising";
    return "💡 New";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Trending
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover the most popular resources in the community right now
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center space-x-1">
            {(['week', 'month', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(period)}
                data-testid={`filter-${period}`}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trending Resources */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Resources
              </CardTitle>
              <CardDescription>
                Most popular resources based on downloads, views, and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingResources && trendingResources.length > 0 ? (
                <div className="space-y-4">
                  {trendingResources.map((resource: TrendingResource, index: number) => (
                    <div 
                      key={resource.id} 
                      className="p-4 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`trending-resource-${resource.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={getTrendingBadgeVariant(resource.trendingScore)}
                          className="ml-2 shrink-0"
                        >
                          {getTrendingBadgeText(resource.trendingScore)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {resource.subject}
                          </span>
                          <span>by {getUploaderDisplayName(resource.uploader)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(resource.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {resource.downloadCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {resource.averageRating.toFixed(1)}
                          </span>
                          <span className="text-green-600 font-medium">
                            +{resource.growthRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="mx-auto h-8 w-8 mb-2" />
                  <p>No trending resources found.</p>
                  <p className="text-sm mt-1">Check back later for popular content!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trending Subjects Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hot Subjects</CardTitle>
              <CardDescription>
                Most active subjects this {timeframe}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingSubjects && trendingSubjects.length > 0 ? (
                <div className="space-y-3">
                  {trendingSubjects.map((subject: TrendingSubject, index: number) => (
                    <div 
                      key={subject.subject} 
                      className="flex items-center justify-between py-2 hover-elevate cursor-pointer p-2 rounded-md -m-2"
                      data-testid={`trending-subject-${subject.subject.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {subject.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{subject.resourceCount} resources</span>
                        <span className="text-green-600 font-medium">
                          +{subject.growthRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No trending subjects yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Downloads</span>
                <span className="text-sm font-medium">
                  {resourcesLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    trendingResources?.reduce((sum: number, r: TrendingResource) => sum + r.downloadCount, 0).toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  {resourcesLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <>
                      <Star className="h-3 w-3 text-yellow-500" />
                      {trendingResources && trendingResources.length > 0 ? (
                        trendingResources.reduce((sum: number, r: TrendingResource) => sum + r.averageRating, 0) / 
                        trendingResources.length
                      ).toFixed(1) : "0.0"}
                    </>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}