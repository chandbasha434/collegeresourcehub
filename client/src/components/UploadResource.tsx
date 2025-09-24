import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, FileText, File, LogIn } from "lucide-react";

const subjects = [
  "Mathematics", "Computer Science", "Physics", "Chemistry", "Biology", 
  "Economics", "Psychology", "History", "Literature", "Engineering"
];

const semesters = [
  "Fall 2024", "Spring 2024", "Fall 2023", "Spring 2023", "Fall 2022", "Spring 2022"
];

export default function UploadResource() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    tags: [] as string[],
    currentTag: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-medium text-foreground">Authentication Required</h1>
            <p className="text-muted-foreground">
              Please log in to upload and share study materials
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            data-testid="button-login"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const addTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.currentTag.trim()],
        currentTag: ""
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Mutation for uploading resource with file
  const uploadMutation = useMutation({
    mutationFn: async ({ formData, file }: { formData: any, file: File }) => {
      const uploadFormData = new FormData();
      
      // Add the file
      uploadFormData.append('file', file);
      
      // Add metadata
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('subject', formData.subject.trim());
      if (formData.description.trim()) {
        uploadFormData.append('description', formData.description.trim());
      }
      if (formData.semester.trim()) {
        uploadFormData.append('semester', formData.semester.trim());
      }
      if (formData.tags.length > 0) {
        uploadFormData.append('tags', JSON.stringify(formData.tags));
      }
      
      const response = await fetch('/api/resources', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include', // Include session cookies
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate resources queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Resource uploaded!",
        description: "Your resource has been shared with the community.",
      });
      
      // Reset form
      setFormData({ title: "", description: "", subject: "", semester: "", tags: [], currentTag: "" });
      setSelectedFile(null);
      
      console.log("Resource created:", data);
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the resource. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required fields
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title and subject.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({ formData, file: selectedFile });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'docx':
      case 'doc':
        return <File className="h-8 w-8 text-blue-600" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Upload Resource</h1>
        <p className="text-muted-foreground">Share your study materials with fellow students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>Upload PDF, Word documents, or images (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  data-testid="input-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  data-testid="button-browse-file"
                >
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                {getFileIcon(selectedFile.name)}
                <div className="flex-1">
                  <p className="font-medium" data-testid="selected-filename">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  data-testid="button-remove-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Details */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>Provide information to help others find your resource</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this resource covers..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="textarea-description"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  required
                >
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger data-testid="select-semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tags (e.g., midterm, notes, solutions)"
                  value={formData.currentTag}
                  onChange={(e) => setFormData({ ...formData, currentTag: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  data-testid="input-tag"
                />
                <Button type="button" variant="outline" onClick={addTag} data-testid="button-add-tag">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                      data-testid={`tag-${tag.toLowerCase().replace(' ', '-')}`}
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag)}
                        data-testid={`button-remove-tag-${tag.toLowerCase().replace(' ', '-')}`}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={uploadMutation.isPending}
            data-testid="button-upload"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload Resource"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            disabled={uploadMutation.isPending}
            onClick={() => {
              setFormData({ title: "", description: "", subject: "", semester: "", tags: [], currentTag: "" });
              setSelectedFile(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}