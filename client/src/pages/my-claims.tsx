import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Package, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MyClaims() {
  const { user } = useAuth();
  
  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims/my-claims"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Claims</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPickupLocation = (status: string, item: any) => {
    if (status === "approved") {
      return "Main Office - Room 101";
    } else if (status === "pending") {
      return "Pending approval";
    } else {
      return "Not available";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Claims</h1>
          <p className="text-muted-foreground">Items you've claimed and their pickup status</p>
        </div>
      </div>

      {!claims || (claims as any[])?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Claims Yet</h3>
            <p className="text-muted-foreground">
              You haven't claimed any items yet. Browse the inventory to find your lost belongings!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(claims as any[])?.map((claim: any) => (
            <Card key={claim.id} data-testid={`claim-${claim.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {claim.item?.name || "Unknown Item"}
                      </h3>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {claim.item?.description || "No description available"}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Found At:</p>
                          <p className="text-muted-foreground capitalize">
                            {claim.item?.location?.replace('-', ' ') || "Unknown"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Pickup Location:</p>
                          <p className="text-muted-foreground">
                            {getPickupLocation(claim.status, claim.item)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Claimed:</p>
                          <p className="text-muted-foreground">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {claim.status === "approved" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <p className="font-medium">Ready for Pickup!</p>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Your item is waiting at the Main Office (Room 101). 
                          Bring your student ID for verification.
                        </p>
                      </div>
                    )}

                    {claim.status === "pending" && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Package className="h-4 w-4" />
                          <p className="font-medium">Under Review</p>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Staff is reviewing your claim. You'll be notified once approved.
                        </p>
                      </div>
                    )}

                    {claim.status === "denied" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 text-red-800">
                          <Package className="h-4 w-4" />
                          <p className="font-medium">Claim Denied</p>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          This claim was not approved. The item may have been claimed by someone else.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {claim.item?.photoUrl && (
                    <img 
                      src={claim.item.photoUrl} 
                      alt={claim.item.name}
                      className="w-20 h-20 rounded-lg object-cover ml-4"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}