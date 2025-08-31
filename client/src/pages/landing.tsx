import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <Search className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Lost & Found</h1>
            <p className="text-muted-foreground">Westwood High School</p>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Access your school Lost & Found inventory system
              </p>
              
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full"
                data-testid="button-login"
              >
                Sign In with School Account
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account? Contact the front office.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
