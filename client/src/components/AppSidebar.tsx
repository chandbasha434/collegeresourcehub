import { 
  Home, 
  Search, 
  Upload, 
  BookOpen, 
  Star, 
  Settings, 
  Users,
  TrendingUp,
  GraduationCap,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Browse Resources",
    url: "/browse",
    icon: Search,
  },
  {
    title: "Upload Resource",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "My Resources",
    url: "/my-resources",
    icon: BookOpen,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Star,
    badge: "12",
  },
];

const communityItems = [
  {
    title: "Top Contributors",
    url: "/contributors",
    icon: Users,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendingUp,
  },
];

const subjects = [
  "Computer Science", 
  "Mathematics", 
  "Physics", 
  "Chemistry", 
  "Biology"
];

interface AppSidebarProps {
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

export default function AppSidebar({ activeItem = "/", onNavigate }: AppSidebarProps) {
  const handleNavigation = (url: string) => {
    console.log("Navigating to:", url);
    onNavigate?.(url);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">Resource Hub</h2>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeItem === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <button 
                      onClick={() => handleNavigation(item.url)}
                      className="w-full flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeItem === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <button 
                      onClick={() => handleNavigation(item.url)}
                      className="w-full flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Popular Subjects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subjects.map((subject) => (
                <SidebarMenuItem key={subject}>
                  <SidebarMenuButton 
                    asChild
                    size="sm"
                    data-testid={`subject-${subject.toLowerCase().replace(' ', '-')}`}
                  >
                    <button 
                      onClick={() => handleNavigation(`/subject/${subject.toLowerCase().replace(' ', '-')}`)}
                      className="w-full text-left text-sm"
                    >
                      {subject}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          {/* User Profile */}
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground" data-testid="user-name">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground" data-testid="user-status">
                Computer Science
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1"
              onClick={() => handleNavigation('/settings')}
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}