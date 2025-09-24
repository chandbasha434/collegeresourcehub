import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
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

// TODO: remove mock functionality
const mockResources = [
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
  {
    id: "4",
    title: "Physics Mechanics Problem Set Solutions",
    description: "Step-by-step solutions for complex mechanics problems",
    subject: "Physics",
    semester: "Fall 2024",
    fileType: "PDF",
    rating: 4.6,
    downloads: 145,
    uploadedBy: "Michael Zhang",
    uploadedAt: "3 days ago",
  },
  {
    id: "5",
    title: "Biology Cell Structure Diagrams",
    description: "Detailed diagrams and explanations of cellular components",
    subject: "Biology",
    semester: "Fall 2024",
    fileType: "PDF",
    rating: 4.5,
    downloads: 89,
    uploadedBy: "Emma Wilson",
    uploadedAt: "1 week ago",
  },
  {
    id: "6",
    title: "Economics Market Analysis Report",
    description: "Comprehensive analysis of current market trends and indicators",
    subject: "Economics",
    semester: "Fall 2024",
    fileType: "DOCX",
    rating: 4.3,
    downloads: 76,
    uploadedBy: "David Kumar",
    uploadedAt: "1 week ago",
  }
];

function BrowseResources() {
  const [filteredResources, setFilteredResources] = useState(mockResources);

  const handleSearch = (filters: any) => {
    console.log("Filtering resources with:", filters);
    // TODO: remove mock functionality - implement real filtering
    let filtered = mockResources;
    
    if (filters.query) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        resource.description.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    if (filters.subject && filters.subject !== "All Subjects") {
      filtered = filtered.filter(resource => resource.subject === filters.subject);
    }
    
    if (filters.minRating && filters.minRating !== "all") {
      const minRating = parseFloat(filters.minRating);
      filtered = filtered.filter(resource => resource.rating >= minRating);
    }
    
    setFilteredResources(filtered);
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
            {filteredResources.length} resources found
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
        
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MyResources() {
  // TODO: remove mock functionality
  const userResources = mockResources.slice(0, 2); // Mock user's resources
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">My Resources</h1>
        <p className="text-muted-foreground">Resources you've uploaded to the community</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      
      {userResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't uploaded any resources yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Share your knowledge with the community!</p>
        </div>
      )}
    </div>
  );
}

function AuthenticatedRouter() {
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
        <MyResources />
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
      .map(name => name[0])
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
              <AuthenticatedRouter />
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