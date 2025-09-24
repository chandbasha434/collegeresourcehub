import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          activeItem="/"
          onNavigate={(path) => console.log('Navigate to:', path)}
        />
        <div className="flex-1 p-8 bg-background">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-medium mb-4">Main Content Area</h2>
            <p className="text-muted-foreground">
              This shows how the sidebar works alongside the main content. 
              Click on sidebar items to see navigation in action.
            </p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}