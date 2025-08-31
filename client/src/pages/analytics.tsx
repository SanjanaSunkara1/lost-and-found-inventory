import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Percent,
  TrendingUp,
  AlertTriangle,
  Utensils,
  Dumbbell,
  Book,
  DoorOpen,
  Presentation
} from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const timeRanges = [
    { label: "Last 30 Days", value: "30", active: true },
    { label: "Last 7 Days", value: "7", active: false },
    { label: "This Month", value: "month", active: false },
    { label: "All Time", value: "all", active: false },
  ];

  const locationIcons: Record<string, any> = {
    "cafeteria": Utensils,
    "gymnasium": Dumbbell,
    "library": Book,
    "main-hall": DoorOpen,
    "classroom": Presentation,
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track trends and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={range.active ? "default" : "secondary"}
              size="sm"
              data-testid={`button-range-${range.value}`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="metric-total-items">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items Logged</p>
                    <p className="text-2xl font-bold text-foreground">{(analytics as any).totalItems}</p>
                    <p className="text-xs text-chart-2 mt-1">+18% vs last month</p>
                  </div>
                  <div className="bg-chart-1/10 p-3 rounded-full">
                    <Plus className="h-6 w-6 text-chart-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="metric-items-returned">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Items Returned</p>
                    <p className="text-2xl font-bold text-foreground">{(analytics as any).itemsReturned}</p>
                    <p className="text-xs text-chart-2 mt-1">+22% vs last month</p>
                  </div>
                  <div className="bg-chart-2/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="metric-avg-return-time">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Return Time</p>
                    <p className="text-2xl font-bold text-foreground">4.2 days</p>
                    <p className="text-xs text-chart-2 mt-1">-0.8 days vs last month</p>
                  </div>
                  <div className="bg-chart-3/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="metric-success-rate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">{(analytics as any).recoveryRate}%</p>
                    <p className="text-xs text-chart-2 mt-1">+5.1% vs last month</p>
                  </div>
                  <div className="bg-chart-4/10 p-3 rounded-full">
                    <Percent className="h-6 w-6 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Items by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Items by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics as any).categoryStats.map((stat: any, index: number) => {
                    const percentage = (analytics as any).totalItems > 0 ? 
                      (stat.count / (analytics as any).totalItems) * 100 : 0;
                    
                    const colors = [
                      "bg-chart-1",
                      "bg-chart-2", 
                      "bg-chart-3",
                      "bg-chart-4",
                      "bg-chart-5"
                    ];
                    
                    return (
                      <div key={stat.category} data-testid={`category-${stat.category}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                            <span className="text-foreground capitalize">{stat.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-foreground font-medium">{stat.count}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Items by Location */}
            <Card>
              <CardHeader>
                <CardTitle>Most Common Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics as any).locationStats.slice(0, 5).map((stat: any) => {
                    const IconComponent = locationIcons[stat.location.toLowerCase()] || DoorOpen;
                    
                    return (
                      <div 
                        key={stat.location} 
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                        data-testid={`location-${stat.location}`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground font-medium capitalize">
                            {stat.location.replace('-', ' ')}
                          </span>
                        </div>
                        <span className="text-foreground font-bold">{stat.count} items</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Placeholder */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">January 2024</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded bg-chart-1"></div>
                          <span className="text-foreground">47 found</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded bg-chart-2"></div>
                          <span className="text-foreground">34 returned</span>
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 flex">
                      <div className="bg-chart-1 h-3 rounded-l-full" style={{ width: "47%" }}></div>
                      <div className="bg-chart-2 h-3 rounded-r-full ml-1" style={{ width: "34%" }}></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      📈 <strong>Insight:</strong> Recovery rates have improved by 15% since implementing the digital system. 
                      Electronics have the highest return rate at 89%.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-chart-2/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-sm font-medium text-chart-2">Peak Activity</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Most items are found between 12-2 PM (lunch period)
                  </p>
                </div>

                <div className="p-4 bg-chart-3/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium text-chart-3">Fastest Returns</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Electronics are claimed 3x faster than other categories
                  </p>
                </div>

                <div className="p-4 bg-chart-4/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm font-medium text-chart-4">Attention Needed</span>
                  </div>
                  <p className="text-sm text-foreground">
                    8 items approaching 30-day archive deadline
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
