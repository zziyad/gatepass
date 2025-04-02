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
import { User, UserRole } from "@/types/user";

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
      user?: {
        id: number;
        email: string;
        role?: UserRole;
        department?: {
          id: number;
          name: string;
        };
      };
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
      console.log("Login response:", data);
      if (data.result?.status === "logged") {
        // For testing - mock user data if not provided by API
        const emailAddress = form.getValues().email;
        const mockUser = {
          id: 1,
          email: emailAddress,
          role: emailAddress.includes("admin") ? "ADMIN" : "EMPLOYEE" as UserRole,
          department: {
            id: 1,
            name: "IT Department"
          }
        };
        
        // Get user data from response or use mock
        const userData = data.result.response.user || mockUser;
        
        // Cookie is automatically handled by the browser
        // The server sets the 'token' cookie with HttpOnly flag

        // Default role and department if not provided
        const userRole = userData.role || (userData.email.includes("admin") ? "ADMIN" : "EMPLOYEE" as UserRole);
        const userDepartment = userData.department?.name || "Default Department";

        // Map the API response to our User type
        const user: User = {
          id: userData.id.toString(),
          name: userData.email, // Use email as name since name is not available
          email: userData.email,
          role: userRole,
          department: userDepartment,
        };

        // Update user context
        setUser(user);

        toast({
          title: "Login successful",
          description: data.result.response.msg || `Welcome, ${userData.email}`,
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
    console.log("Submitting login form:", values);
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
