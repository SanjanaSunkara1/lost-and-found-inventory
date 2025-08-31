import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  HandIcon, 
  CheckCircle, 
  Percent,
  Plus,
  Eye,
  Archive,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: (user as any)?.role === "staff",
  });
  
  const { data: recentItems } = useQuery({
    queryKey: ["/api/items"],
  });

  const { data: pendingClaims } = useQuery({
    queryKey: ["/api/claims", "pending"],
    enabled: (user as any)?.role === "staff",
  });

  const recentItemsSlice = (recentItems as any[])?.slice(0, 3) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Manage your Lost & Found inventory efficiently</p>
      </div>

      {(user as any)?.role === "staff" && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-active-items">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                  <p className="text-2xl font-bold text-foreground">{(analytics as any).totalItems}</p>
                </div>
                <div className="bg-chart-1/10 p-3 rounded-full">
                  <Box className="h-6 w-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-claims">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Claims</p>
                  <p className="text-2xl font-bold text-foreground">{(analytics as any).pendingClaims}</p>
                </div>
                <div className="bg-chart-3/10 p-3 rounded-full">
                  <HandIcon className="h-6 w-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-items-returned">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Returned</p>
                  <p className="text-2xl font-bold text-foreground">{(analytics as any).itemsReturned}</p>
                </div>
                <div className="bg-chart-2/10 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-recovery-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recovery Rate</p>
                  <p className="text-2xl font-bold text-foreground">{(analytics as any).recoveryRate.toFixed(1)}%</p>
                </div>
                <div className="bg-chart-5/10 p-3 rounded-full">
                  <Percent className="h-6 w-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Items</CardTitle>
              <p className="text-sm text-muted-foreground">Latest additions to inventory</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItemsSlice.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No items found</p>
                ) : (
                  recentItemsSlice.map((item: any) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-4 p-4 hover:bg-accent rounded-lg transition-colors"
                      data-testid={`item-${item.id}`}
                    >
                      {item.photoUrl && (
                        <img 
                          src={item.photoUrl} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Found in {item.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                          {item.category}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.dateFound).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {(user as any)?.role === "staff" && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Common tasks</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                onClick={() => window.location.hash = "#add-item"}
                data-testid="button-add-item"
              >
                <Plus className="mr-3 h-4 w-4" />
                Add New Item
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={() => window.location.hash = "#claims"}
                data-testid="button-review-claims"
              >
                <Eye className="mr-3 h-4 w-4" />
                Review Claims
                {(pendingClaims as any[])?.length > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                    {(pendingClaims as any[]).length}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-archive-items"
              >
                <Archive className="mr-3 h-4 w-4" />
                Archive Items
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-export-report"
              >
                <Download className="mr-3 h-4 w-4" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
