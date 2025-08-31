import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      showNotification(notification.title, notification.message, notification.type);
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    // Demo notification for testing
    setTimeout(() => {
      showNotification(
        "New Claim Submitted", 
        "Sarah Johnson submitted a claim for iPhone 15", 
        "info"
      );
    }, 3000);
    
    return () => {
      socket.close();
    };
  }, []);

  const showNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, title, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification(id);
    }, 5000);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    };
    const IconComponent = icons[type as keyof typeof icons] || Info;
    return <IconComponent className="h-5 w-5" />;
  };

  const getIconColor = (type: string) => {
    const colors = {
      success: "text-chart-2",
      error: "text-chart-4", 
      warning: "text-chart-3",
      info: "text-primary",
    };
    return colors[type as keyof typeof colors] || "text-primary";
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className="min-w-80 shadow-lg border border-border animate-in slide-in-from-right-full"
          data-testid={`notification-${notification.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getIconColor(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hideNotification(notification.id)}
                className="flex-shrink-0 h-auto p-1"
                data-testid={`button-close-${notification.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
