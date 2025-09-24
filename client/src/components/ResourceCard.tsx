import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Star, FileText, File } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RatingSystem from "@/components/RatingSystem";
import type { Resource } from "@shared/schema";

interface ResourceCardProps {
  resource: Resource;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toUpperCase()) {
    case 'PDF':
      return <FileText className="h-4 w-4 text-red-600" />;
    case 'DOCX':
    case 'DOC':
      return <File className="h-4 w-4 text-blue-600" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

// Helper function to format relative time
const formatRelativeTime = (date: Date | string) => {
  const now = new Date();
  const resourceDate = new Date(date);
  const diffInMs = now.getTime() - resourceDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return resourceDate.toLocaleDateString();
};

// Helper function to get user display name
const getUserDisplayName = (user: any, fallbackId?: string) => {
  if (!user) return fallbackId ? `User ${fallbackId.slice(0, 8)}` : "Unknown User";
  if (typeof user === 'string') return user; // Handle legacy string format
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.fullName) return user.fullName;
  if (user.username) return user.username;
  if (user.email) return user.email;
  return "Unknown User";
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { toast } = useToast();
  
  // Mutation for incrementing download count
  const downloadMutation = useMutation({
    mutationFn: () => apiRequest(`/api/resources/${resource.id}/download`, {
      method: 'POST'
    }),
    onSuccess: () => {
      // Invalidate resources queries to update download count
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      toast({
        title: "Download started",
        description: "The resource download has been initiated.",
      });
    },
    onError: () => {
      toast({
        title: "Download failed",
        description: "Could not download the resource. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const handleRating = (rating: number) => {
    console.log("Rating resource:", resource.id, "with", rating, "stars");
    // TODO: Implement rating functionality
    toast({
      title: "Rating submitted",
      description: `You rated this resource ${rating} stars.`,
    });
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getFileIcon(resource.fileType)}
            <Badge variant="outline" className="text-xs">
              {resource.fileType}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            data-testid={`button-download-${resource.id}`}
          >
            <Download className="h-3 w-3 mr-1" />
            {resource.downloadCount || 0}
          </Button>
        </div>
        <CardTitle className="text-base line-clamp-2" data-testid={`title-resource-${resource.id}`}>
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`description-resource-${resource.id}`}>
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs" data-testid={`subject-${resource.subject.toLowerCase()}`}>
            {resource.subject}
          </Badge>
          <Badge variant="secondary" className="text-xs" data-testid={`semester-${resource.semester.toLowerCase().replace(' ', '-')}`}>
            {resource.semester}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <RatingSystem 
            rating={parseFloat(resource.averageRating || "0")} 
            onRating={handleRating}
            size="sm"
            data-testid={`rating-resource-${resource.id}`}
          />
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current" />
            <span data-testid={`rating-value-${resource.id}`}>
              {parseFloat(resource.averageRating || "0").toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {getUserDisplayName((resource as any).uploadedBy || resource.uploadedById, resource.uploadedById).split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span data-testid={`uploader-${resource.id}`}>
              {getUserDisplayName((resource as any).uploadedBy || resource.uploadedById, resource.uploadedById)}
            </span>
          </div>
          <span data-testid={`uploaded-time-${resource.id}`}>
            {formatRelativeTime(resource.createdAt || new Date())}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}