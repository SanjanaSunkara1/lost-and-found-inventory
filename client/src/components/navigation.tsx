import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  ChevronDown,
  BarChart3,
  List,
  Plus,
  HandIcon,
  BarChart2
} from "lucide-react";

interface NavigationProps {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string; icon: string }>;
}

export default function Navigation({ user, activeTab, onTabChange, tabs }: NavigationProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    select: (data) => (data as any[])?.filter((n: any) => !n.read) || [],
  });

  const { data: pendingClaims } = useQuery({
    queryKey: ["/api/claims", "pending"],
    enabled: (user as any)?.role === "staff",
    select: (data) => (data as any[])?.filter((c: any) => c.status === "pending") || [],
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      "chart-pie": BarChart3,
      "list": List,
      "plus": Plus,
      "hand-paper": HandIcon,
      "chart-bar": BarChart2,
    };
    return icons[iconName] || List;
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Lost & Found</h1>
              {user && (
                <Badge variant="secondary" data-testid="badge-user-role">
                  {user.role === "staff" ? "Staff" : "Student"}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              
              {/* Dark Mode Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleDarkMode} data-testid="button-dark-mode">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {/* User Menu */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {/* Logout functionality could be implemented here */}
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg hidden">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = getIcon(tab.icon);
              const isActive = activeTab === tab.id;
              const showBadge = tab.id === "claims" && pendingClaims && pendingClaims.length > 0;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`py-4 px-2 border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => onTabChange(tab.id)}
                  data-testid={`tab-${tab.id}`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {tab.label}
                  {showBadge && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingClaims.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
