import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { HandIcon, Eye, MapPin, Calendar, AlertTriangle } from "lucide-react";

interface ItemCardProps {
  item: any;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [claimDescription, setClaimDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClaimMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/claims", {
        itemId: item.id,
        description: claimDescription,
      });
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted for review",
      });
      setIsClaimDialogOpen(false);
      setClaimDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics: "bg-chart-1/10 text-chart-1",
      clothing: "bg-chart-2/10 text-chart-2",
      books: "bg-chart-3/10 text-chart-3",
      accessories: "bg-chart-4/10 text-chart-4",
      sports: "bg-chart-5/10 text-chart-5",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const isHighPriority = item.priority === "high";
  const isClaimed = item.status === "claimed";
  const canClaim = user && !isClaimed;

  return (
    <Card 
      className={`shadow-sm hover:shadow-md transition-shadow ${
        isHighPriority ? "border-2 border-chart-4" : ""
      } ${isClaimed ? "opacity-75" : ""}`}
      data-testid={`item-card-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
          {isHighPriority && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              HIGH PRIORITY
            </Badge>
          )}
          {isClaimed && (
            <Badge className="bg-chart-2 text-white">
              CLAIMED
            </Badge>
          )}
          {!isHighPriority && !isClaimed && (
            <span className="text-xs text-muted-foreground">ID: #LF-{item.id}</span>
          )}
        </div>
        
        {item.photoUrl && (
          <img 
            src={item.photoUrl} 
            alt={item.name}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
        )}
        
        <h3 className="font-medium text-foreground mb-2">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location.replace('-', ' ')}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(item.dateFound).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex gap-2">
          {canClaim ? (
            <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" data-testid={`button-claim-${item.id}`}>
                  <HandIcon className="mr-1 h-4 w-4" />
                  Claim
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claim Item: {item.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="claim-description">
                      Describe why this item belongs to you
                    </Label>
                    <Textarea
                      id="claim-description"
                      placeholder="Provide details about the item that prove it's yours (e.g., distinguishing marks, where you lost it, etc.)"
                      value={claimDescription}
                      onChange={(e) => setClaimDescription(e.target.value)}
                      rows={4}
                      data-testid="textarea-claim-description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => createClaimMutation.mutate()}
                      disabled={!claimDescription.trim() || createClaimMutation.isPending}
                      className="flex-1"
                      data-testid="button-submit-claim"
                    >
                      {createClaimMutation.isPending ? "Submitting..." : "Submit Claim"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsClaimDialogOpen(false)}
                      data-testid="button-cancel-claim"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              disabled 
              className="flex-1 cursor-not-allowed"
              data-testid={`button-claimed-${item.id}`}
            >
              {isClaimed ? "Claimed" : "View"}
            </Button>
          )}
          
          <Button variant="secondary" size="sm" data-testid={`button-view-${item.id}`}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
