import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, MessageSquare, Calendar, MapPin, User, Mail, GraduationCap, Hash } from "lucide-react";

interface ClaimCardProps {
  claim: any;
  onUpdateClaim: (id: number, status: string, staffNotes?: string) => void;
  isUpdating: boolean;
}

export default function ClaimCard({ claim, onUpdateClaim, isUpdating }: ClaimCardProps) {
  const [staffNotes, setStaffNotes] = useState("");
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const handleApprove = () => {
    onUpdateClaim(claim.id, "approved", staffNotes);
  };

  const handleReject = () => {
    onUpdateClaim(claim.id, "rejected", staffNotes);
  };

  const handleRequestInfo = () => {
    if (!staffNotes.trim()) {
      return;
    }
    onUpdateClaim(claim.id, "more_info_needed", staffNotes);
    setIsNotesDialogOpen(false);
    setStaffNotes("");
  };

  const isHighPriority = claim.item?.priority === "high";

  return (
    <Card 
      className={`${isHighPriority ? "border-2 border-chart-4" : "border border-border"}`}
      data-testid={`claim-card-${claim.id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Claim Information */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>{claim.item?.name || "Unknown Item"}</span>
                  {isHighPriority && (
                    <Badge variant="destructive">HIGH PRIORITY</Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Submitted {new Date(claim.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge 
                variant="secondary"
                className="bg-chart-3/10 text-chart-3"
              >
                Pending Review
              </Badge>
            </div>

            {/* Student Information */}
            <div className="bg-accent rounded-lg p-4 mb-4">
              <h4 className="font-medium text-foreground mb-2">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {claim.student?.firstName} {claim.student?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="ml-2 text-foreground font-medium">{claim.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 text-foreground font-medium">{claim.student?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role:</span>
                  <span className="ml-2 text-foreground font-medium capitalize">{claim.student?.role}</span>
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="mb-4">
              <h4 className="font-medium text-foreground mb-2">Student's Claim Description</h4>
              <p className="text-foreground bg-background p-3 rounded-md border border-border">
                {claim.description}
              </p>
            </div>
          </div>

          {/* Item Photo and Details */}
          {claim.item && (
            <div className="lg:w-64">
              {claim.item.photoUrl && (
                <img 
                  src={claim.item.photoUrl} 
                  alt={claim.item.name}
                  className="w-full h-64 object-cover rounded-lg border border-border mb-3"
                />
              )}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <strong>Found:</strong> <span>{claim.item.location.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <strong>Date:</strong> <span>{new Date(claim.item.dateFound).toLocaleDateString()}</span>
                </div>
                <div>
                  <strong>ID:</strong> <span>#LF-{claim.item.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
          <Button 
            onClick={handleApprove}
            disabled={isUpdating}
            className="flex-1 bg-chart-2 hover:bg-chart-2/90"
            data-testid={`button-approve-${claim.id}`}
          >
            <Check className="mr-2 h-4 w-4" />
            {isUpdating ? "Processing..." : "Approve Claim"}
          </Button>
          
          <Button 
            onClick={handleReject}
            disabled={isUpdating}
            variant="destructive"
            className="flex-1"
            data-testid={`button-reject-${claim.id}`}
          >
            <X className="mr-2 h-4 w-4" />
            {isUpdating ? "Processing..." : "Reject Claim"}
          </Button>
          
          <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={isUpdating}
                data-testid={`button-request-info-${claim.id}`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Request More Info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Additional Information</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="staff-notes">
                    Message to student (what additional information do you need?)
                  </Label>
                  <Textarea
                    id="staff-notes"
                    placeholder="Please provide more details about..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-staff-notes"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRequestInfo}
                    disabled={!staffNotes.trim() || isUpdating}
                    className="flex-1"
                    data-testid="button-send-request"
                  >
                    Send Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsNotesDialogOpen(false);
                      setStaffNotes("");
                    }}
                    data-testid="button-cancel-request"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
