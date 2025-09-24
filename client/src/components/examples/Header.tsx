import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from '../Header';

export default function HeaderExample() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Header 
          theme={theme}
          onThemeToggle={toggleTheme}
          onSearch={(query) => console.log('Search:', query)}
          userName="John Doe"
          userInitials="JD"
          notificationCount={5}
        />
        <div className="p-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-medium mb-4">Page Content</h2>
            <p className="text-muted-foreground mb-4">
              This demonstrates the header component with search functionality, 
              theme toggle, notifications, and user menu.
            </p>
            <p className="text-sm text-muted-foreground">
              Try searching, toggling the theme, or clicking the user avatar to see the dropdown.
            </p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}