import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Star, FileText, File } from "lucide-react";
import RatingSystem from "@/components/RatingSystem";

interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  fileType: string;
  rating: number;
  downloads: number;
  uploadedBy: string;
  uploadedAt: string;
}

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

export default function ResourceCard({ resource }: ResourceCardProps) {
  const handleDownload = () => {
    console.log("Downloading resource:", resource.id);
  };

  const handleRating = (rating: number) => {
    console.log("Rating resource:", resource.id, "with", rating, "stars");
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
            data-testid={`button-download-${resource.id}`}
          >
            <Download className="h-3 w-3 mr-1" />
            {resource.downloads}
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
            rating={resource.rating} 
            onRating={handleRating}
            size="sm"
            data-testid={`rating-resource-${resource.id}`}
          />
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current" />
            <span data-testid={`rating-value-${resource.id}`}>{resource.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {resource.uploadedBy.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span data-testid={`uploader-${resource.id}`}>{resource.uploadedBy}</span>
          </div>
          <span data-testid={`uploaded-time-${resource.id}`}>{resource.uploadedAt}</span>
        </div>
      </CardContent>
    </Card>
  );
}