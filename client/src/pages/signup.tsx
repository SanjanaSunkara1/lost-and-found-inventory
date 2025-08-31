import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, type SignupData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Signup() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      studentId: "",
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Account Created Successfully!",
        description: "You can now log in with your student ID and password.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupData) => {
    signupMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Account Created!</CardTitle>
            <CardDescription>
              Your Lost & Found account has been successfully created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                You can now log in with your student ID and password to access the Lost & Found system.
              </p>
              <Link href="/login" className="block">
                <Button className="w-full" data-testid="button-go-to-login">
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join the Westwood High School Lost & Found system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="s123456" 
                        {...field} 
                        data-testid="input-student-id"
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-fill email when student ID changes
                          if (e.target.value && /^s\d{6}$/.test(e.target.value)) {
                            form.setValue("email", `${e.target.value}@student.roundrockisd.org`);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Format: s followed by 6 digits (e.g., s123456)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="s123456@student.roundrockisd.org" 
                        {...field} 
                        data-testid="input-email"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Auto-filled based on your student ID
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Create a secure password" 
                        {...field} 
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={signupMutation.isPending}
                data-testid="button-create-account"
              >
                {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}