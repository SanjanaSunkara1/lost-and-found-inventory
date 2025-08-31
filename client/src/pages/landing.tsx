import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "wouter";

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
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Access your school Lost & Found inventory system
              </p>
              
              <Link href="/login" className="block">
                <Button 
                  className="w-full"
                  data-testid="button-login"
                >
                  Log In
                </Button>
              </Link>
              
              <Link href="/signup" className="block">
                <Button 
                  variant="outline"
                  className="w-full"
                  data-testid="button-signup"
                >
                  Create Account
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Students: Use your Round Rock ISD student ID to create an account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
