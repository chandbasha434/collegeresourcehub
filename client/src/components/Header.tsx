import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Upload
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onThemeToggle?: () => void;
  onLogout?: () => void;
  theme?: "light" | "dark";
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
}

export default function Header({ 
  onSearch,
  onThemeToggle,
  onLogout,
  theme = "light",
  userName = "John Doe",
  userInitials = "JD",
  notificationCount = 3
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Header search:", searchQuery);
    onSearch?.(searchQuery);
  };

  const handleProfileAction = (action: string) => {
    console.log("Profile action:", action);
    if (action === 'logout' && onLogout) {
      onLogout();
    }
  };

  const handleNotification = () => {
    console.log("Notifications clicked");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="mr-4" data-testid="button-sidebar-toggle" />
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              data-testid="input-header-search"
            />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Upload Button */}
          <Button 
            size="sm" 
            variant="outline" 
            className="hidden md:flex"
            onClick={() => console.log("Upload clicked")}
            data-testid="button-header-upload"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotification}
            data-testid="button-notifications"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                data-testid="notification-badge"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none" data-testid="dropdown-username">
                    {userName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Computer Science Student
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleProfileAction('profile')}
                data-testid="dropdown-profile"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleProfileAction('settings')}
                data-testid="dropdown-settings"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleProfileAction('logout')}
                data-testid="dropdown-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}