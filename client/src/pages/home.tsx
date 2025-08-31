import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import AddItem from "@/pages/add-item";
import Claims from "@/pages/claims";
import Analytics from "@/pages/analytics";
import MyClaims from "@/pages/my-claims";
import { NotificationToast } from "@/components/notification-toast";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <Inventory />;
      case "add-item":
        return <AddItem />;
      case "claims":
        return <Claims />;
      case "analytics":
        return <Analytics />;
      case "my-claims":
        return <MyClaims />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "chart-pie" },
    { id: "inventory", label: "Inventory", icon: "list" },
    { id: "add-item", label: "Add Item", icon: "plus" },
    { id: "my-claims", label: "My Claims", icon: "hand-paper" },
    { id: "analytics", label: "Analytics", icon: "chart-bar" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        tabs={tabs}
      />
      
      <main className="max-w-7xl mx-auto">
        {activeTab === "dashboard" ? <Dashboard onTabChange={setActiveTab} /> : renderContent()}
      </main>
      
      <NotificationToast />
    </div>
  );
}
