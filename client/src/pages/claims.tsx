import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clock, Check, X, MessageSquare } from "lucide-react";
import ClaimCard from "@/components/claim-card";

export default function Claims() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const updateClaimMutation = useMutation({
    mutationFn: async ({ id, status, staffNotes }: { id: number; status: string; staffNotes?: string }) => {
      return await apiRequest("PATCH", `/api/claims/${id}`, { status, staffNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Claim Updated",
        description: "The claim status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingClaims = (claims as any[])?.filter((claim: any) => claim.status === "pending") || [];
  const approvedToday = (claims as any[])?.filter((claim: any) => 
    claim.status === "approved" && 
    new Date(claim.reviewedAt).toDateString() === new Date().toDateString()
  )?.length || 0;

  const successRate = (claims as any[])?.length > 0 ? 
    Math.round(((claims as any[]).filter((claim: any) => claim.status === "approved").length / (claims as any[]).length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Claims Management</h2>
        <p className="text-muted-foreground">Review and approve student item claims</p>
      </div>

      {/* Claims Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card data-testid="card-pending-review">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground">{pendingClaims.length}</p>
              </div>
              <div className="bg-chart-3/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-approved-today">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-foreground">{approvedToday}</p>
              </div>
              <div className="bg-chart-2/10 p-3 rounded-full">
                <Check className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-success-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{successRate}%</p>
              </div>
              <div className="bg-chart-1/10 p-3 rounded-full">
                <Check className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingClaims.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No pending claims to review</p>
            </CardContent>
          </Card>
        ) : (
          pendingClaims.map((claim: any) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onUpdateClaim={(id, status, staffNotes) => 
                updateClaimMutation.mutate({ id, status, staffNotes })
              }
              isUpdating={updateClaimMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
