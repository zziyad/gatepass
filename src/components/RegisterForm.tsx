import { useId, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { ApiResponse } from "@/services/api/types";
import { UserRole } from "@/types";
import { RegistrationData } from "@/services/auth/types";

// Updated to match schema
interface Department {
  id: number;
  name: string;
}

// Define validation schema with Zod
const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentId: z.string().min(1, "Department is required"), // Will be converted to number
  position: z.string().min(2, "Position is required"), // Employee's job title
  role: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "SECURITY", "ADMIN"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  adminCreated?: boolean;
  queryClient?: QueryClient;
  onComplete?: () => void;
}

export default function RegisterForm({ 
  adminCreated = false,
  queryClient,
  onComplete
}: RegisterFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formId = useId();
  const [apiError, setApiError] = useState<string | null>(null);

  // Query to fetch departments
  const { data: departments = [], isLoading: loadingDepartments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        // Use admin API to get departments
        const response = await api.admin.getDepartments();
        
        if (response.result?.status === "success" && 
            response.result.response?.departments) {
          return response.result.response.departments as Department[];
        }
        
        console.warn("Failed to fetch departments");
        return [];
      } catch (err) {
        const error = err as Error;
        console.error("Failed to load departments:", error);
        setApiError("Failed to load departments: " + error.message);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      departmentId: "",
      position: "",
      role: "LEVEL_1" // Default role
    },
  });

  // Show toast for API errors
  useEffect(() => {
    if (apiError) {
      toast({
        title: "Department Loading Error",
        description: apiError,
        variant: "destructive",
      });
    }
  }, [apiError, toast]);

  // Define the register user mutation
  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      // Create registration data object
      const registrationData: RegistrationData = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        departmentId: parseInt(values.departmentId, 10),
        position: values.position
      };
      
      // Add role if admin is creating the user
      if (adminCreated && values.role) {
        registrationData.role = values.role as UserRole;
      }
      
      // Call the auth register service
      return api.auth.register(registrationData);
    },
    onSuccess: (response) => {
      console.log("Registration response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": { 
      //       "msg": "User registered successfully" 
      //     }
      //   }
      // }
      
      if (response?.result?.status === "success") {
        const successMsg = response.result.response?.msg || "User registered successfully";
        
        toast({
          title: "Registration successful",
          description: successMsg,
        });
        
        // If admin created, stay on the page for more registrations
        // Otherwise navigate to login
        if (!adminCreated) {
          navigate("/login");
        } else {
          // Reset form for next user creation
          form.reset({
            fullName: "",
            email: "",
            password: "",
            departmentId: "",
            position: "",
            role: "LEVEL_1"
          });
          
          // If queryClient is provided, refresh users list
          if (queryClient) {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          }
          
          // Call onComplete callback if provided
          if (onComplete) {
            onComplete();
          }
        }
      } else {
        throw new Error(response?.result?.error || "Registration failed");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <Card className={adminCreated ? "w-full" : "w-[350px]"}>
      <CardHeader>
        <CardTitle>{adminCreated ? "Create New User" : "Register"}</CardTitle>
        <CardDescription>
          {adminCreated 
            ? "Create a new user account with specific role and permissions"
            : "Create an account for the Item Removal System"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-fullName`}>
                      Full fullName
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-fullName`}
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        disabled={registerMutation.isPending}
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
                    <FormLabel htmlFor={`${formId}-password`}>Password</FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-password`}
                        type="password"
                        autoComplete="new-password"
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-department`}>
                      Department
                    </FormLabel>
                    <Select
                      disabled={registerMutation.isPending || loadingDepartments}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id={`${formId}-department`}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Position field */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-position`}>
                      Position
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-position`}
                        disabled={registerMutation.isPending}
                        placeholder="e.g., Manager, Engineer, Analyst"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Only show role selector for admin */}
              {adminCreated && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`${formId}-role`}>User Role</FormLabel>
                      <Select
                        disabled={registerMutation.isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id={`${formId}-role`}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LEVEL_1">Requester</SelectItem>
                          <SelectItem value="LEVEL_2">Department Approval</SelectItem>
                          <SelectItem value="LEVEL_3">Finance Approval</SelectItem>
                          <SelectItem value="LEVEL_4">Management Approval</SelectItem>
                          <SelectItem value="SECURITY">Security Approval</SelectItem>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {adminCreated && (
              <Button 
                variant="outline" 
                type="button" 
                onClick={onComplete ? onComplete : () => navigate("/admin/users")}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className={!adminCreated ? "w-full" : ""}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Processing..." : adminCreated ? "Create User" : "Register"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
