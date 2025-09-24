import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Star, Upload, TrendingUp, Users } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";

// TODO: remove mock functionality
const mockStats = [
  { title: "Total Resources", value: "2,847", icon: BookOpen, change: "+12%" },
  { title: "Downloads This Week", value: "1,249", icon: Download, change: "+23%" },
  { title: "Average Rating", value: "4.8", icon: Star, change: "+0.2" },
  { title: "Active Contributors", value: "342", icon: Users, change: "+8%" },
];

const mockRecentResources = [
  {
    id: "1",
    title: "Advanced Calculus Notes - Chapter 7",
    description: "Comprehensive notes covering differential equations and integration techniques",
    subject: "Mathematics",
    semester: "Fall 2024",
    fileType: "PDF",
    rating: 4.9,
    downloads: 234,
    uploadedBy: "Sarah Chen",
    uploadedAt: "2 hours ago",
  },
  {
    id: "2", 
    title: "Organic Chemistry Lab Report Template",
    description: "Professional template for lab reports with proper formatting guidelines",
    subject: "Chemistry",
    semester: "Fall 2024",
    fileType: "DOCX",
    rating: 4.7,
    downloads: 189,
    uploadedBy: "Alex Rodriguez",
    uploadedAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Data Structures Final Exam 2023",
    description: "Past exam paper with detailed solutions and explanations",
    subject: "Computer Science",
    semester: "Spring 2023",
    fileType: "PDF",
    rating: 4.8,
    downloads: 567,
    uploadedBy: "Priya Patel",
    uploadedAt: "1 day ago",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening in your study hub today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat, index) => (
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
        ))}
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
          {mockRecentResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
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