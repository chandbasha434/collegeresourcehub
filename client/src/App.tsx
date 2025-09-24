import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Components
import Landing from "./components/Landing";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import UploadResource from "./components/UploadResource";
import SearchFilters from "./components/SearchFilters";
import ResourceCard from "./components/ResourceCard";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";
import NotFound from "@/pages/not-found";


interface Resource {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  semester: string | null;
  fileType: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  uploadedById: string;
  downloadCount: number | null;
  averageRating: string | null;
  ratingCount: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  uploadedBy?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

function BrowseResources() {
  const [filters, setFilters] = useState({
    query: '',
    subject: '',
    minRating: '',
    sortBy: 'newest' as const
  });

  // Fetch resources with current filters
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('search', filters.query);
      if (filters.subject && filters.subject !== "All Subjects") {
        params.append('subject', filters.subject);
      }
      if (filters.minRating && filters.minRating !== "all") {
        params.append('minRating', filters.minRating);
      }
      params.append('sortBy', filters.sortBy);
      params.append('limit', '50'); // Reasonable limit for browsing
      
      const queryString = params.toString();
      return fetch(`/api/resources${queryString ? '?' + queryString : ''}`)
        .then(res => res.json());
    },
  });

  const handleSearch = (newFilters: typeof filters) => {
    console.log("Updating filters:", newFilters);
    setFilters({
      query: newFilters.query || '',
      subject: newFilters.subject || '',
      minRating: newFilters.minRating || '',
      sortBy: newFilters.sortBy || 'newest'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Browse Resources</h1>
        <p className="text-muted-foreground">Discover study materials shared by your peers</p>
      </div>
      
      <SearchFilters onSearch={handleSearch} />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            {isLoading ? 'Loading...' : `${resources?.length || 0} resources found`}
          </h2>
        </div>
        
        {isLoading ? (
          // Loading skeleton
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
            ))}
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource: Resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resources found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MyResources({ user }: { user: any }) {
  // Fetch user's own resources
  const { data: userResources, isLoading } = useQuery({
    queryKey: ['/api/resources', { userId: user?.id }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (user?.id) {
        params.append('userId', user.id);
      }
      params.append('sortBy', 'newest');
      
      const queryString = params.toString();
      return fetch(`/api/resources${queryString ? '?' + queryString : ''}`)
        .then(res => res.json());
    },
    enabled: !!user?.id, // Only fetch if user ID is available
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">My Resources</h1>
        <p className="text-muted-foreground">Resources you've uploaded to the community</p>
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
          ))}
        </div>
      ) : userResources && userResources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userResources.map((resource: Resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You haven't uploaded any resources yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Share your knowledge with the community!</p>
          <Button className="mt-4" onClick={() => {/* TODO: Navigate to upload */}}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Your First Resource
          </Button>
        </div>
      )}
    </div>
  );
}

function AuthenticatedRouter({ user }: { user: any }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/browse">
        <BrowseResources />
      </Route>
      <Route path="/upload">
        <UploadResource />
      </Route>
      <Route path="/my-resources">
        <MyResources user={user} />
      </Route>
      <Route path="/favorites">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Favorites</h1>
            <p className="text-muted-foreground">Resources you've saved for later</p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No favorite resources yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Star resources to save them here.</p>
          </div>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function UnauthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route component={Landing} />
    </Switch>
  );
}

function AuthenticatedApp({ user }: { user: any }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Custom sidebar width
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  // Get user initials
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName.split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar onNavigate={(path) => window.location.pathname = path} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header 
            theme={theme}
            onThemeToggle={toggleTheme}
            onSearch={(query) => console.log("Global search:", query)}
            userName={getUserDisplayName()}
            userInitials={getUserInitials()}
            notificationCount={0}
            onLogout={() => window.location.href = '/api/logout'}
          />
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <AuthenticatedRouter user={user} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp user={user} /> : <UnauthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;