import { useId } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { User, UserRole, ApiUser } from "@/types/user";
import { adaptApiUserToUser } from "@/adapters/userAdapter";

// Define validation schema with Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Define expected API response type to match the API's format
interface LoginApiResponse {
  type: string;
  id: number;
  result: {
    status: string;
    response: {
      msg: string;
      user?: ApiUser; // Change this to match our ApiUser type
    };
  };
}

export default function LoginForm() {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formId = useId();

  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Define the mutation
  const mutation = useMutation<
    LoginApiResponse,
    Error,
    LoginFormValues
  >({
    mutationFn: async (credentials) => {
      const response = await api.auth.login(credentials.email, credentials.password);
      return response as LoginApiResponse;
    },
    onSuccess: (data) => {
      if (data.result?.status === "logged") {
        // Get user data from response
        const apiUser = data.result.response.user;
        
        if (!apiUser) {
          throw new Error("No user data returned from server");
        }

        // Ensure we have a role even if the API doesn't provide one
        if (!apiUser.role) {
          apiUser.role = apiUser.email.includes("admin") ? "ADMIN" : "LEVEL_1" as UserRole;
        }

        // Ensure we have a departmentName
        if (!apiUser.departmentName) {
          // First try to get it from department.name if available
          if (apiUser.department?.name) {
            apiUser.departmentName = apiUser.department.name;
          } else {
            // Default fallback
            apiUser.departmentName = "Not Assigned";
          }
        }

        // Convert API user to our user model
        const user = adaptApiUserToUser(apiUser);

        // Update user context
        setUser(user);

        toast({
          title: "Login successful",
          description: data.result.response.msg || `Welcome, ${user.fullName || user.email}`,
        });
        
        // Redirect admin users to admin dashboard, others to regular dashboard
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Handle cases where status is not 'logged' even if API call succeeded
        throw new Error(data.result?.status || "Login failed: Unknown status");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Use mutation's pending state
  const isSubmitting = mutation.isPending;

  // Trigger the mutation on form submit
  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>
          Enter your credentials to log in to the Item Removal System
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-email`}>Email</FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-email`}
                        type="email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-password`}>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-password`}
                        type="password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
