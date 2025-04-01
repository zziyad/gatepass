import { useId, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { apiClient } from "@/lib/apiClient";
import { UserRole } from "@/types";

// Updated to match schema
interface Department {
  id: number;
  name: string;
}

// Fallback mock departments for development until API is ready
const mockDepartments: Department[] = [
  { id: 1, name: "IT Department" },
  { id: 2, name: "Finance Department" },
  { id: 3, name: "HR Department" },
  { id: 4, name: "Operations" },
  { id: 5, name: "Marketing" },
  { id: 6, name: "Research & Development" },
];

// Define validation schema with Zod
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentId: z.string().min(1, "Department is required"), // Will be converted to number
  role: z.enum(["EMPLOYEE", "HOD", "FINANCE", "MOD", "SECURITY", "ADMIN"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Define expected API response structure based on schema
interface RegisterSuccessResponse {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  department: {
    id: number;
    name: string;
  };
}

interface RegisterFormProps {
  adminCreated?: boolean;
}

export default function RegisterForm({ adminCreated = false }: RegisterFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formId = useId();
  const [apiError, setApiError] = useState<string | null>(null);

  // Query to fetch departments
  const { data: apiDepartments, isError } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => 
      apiClient<Department[]>({
        method: "department/list",
        args: {},
        requiresAuth: adminCreated, // Require auth if admin is creating the account
      }).then(res => res.response || [])
      .catch(err => {
        setApiError("Failed to load departments: " + err.message);
        return [];
      }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Use API departments if available, otherwise use mock data
  const departments = (apiDepartments && apiDepartments.length > 0) 
    ? apiDepartments 
    : mockDepartments;

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: "",
      role: "EMPLOYEE" // Default role
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

  // Define the mutation
  const mutation = useMutation<
    { status: string; response?: RegisterSuccessResponse },
    Error,
    RegisterFormValues
  >({
    mutationFn: (userData) =>
      apiClient<RegisterSuccessResponse>({
        method: adminCreated ? "admin/createUser" : "auth/register",
        args: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          departmentId: parseInt(userData.departmentId, 10),
          role: userData.role,
        },
        requiresAuth: adminCreated, // Require auth if admin is creating the account
      }),
    onSuccess: (data) => {
      const successStatus = adminCreated ? "created" : "registered";
      if (data.status === successStatus && data.response) {
        toast({
          title: "Registration successful",
          description: adminCreated 
            ? `User ${data.response.name} has been created successfully.`
            : "You can now log in with your credentials.",
        });
        
        // If admin created, stay on the page for more registrations
        // Otherwise navigate to login
        if (!adminCreated) {
          navigate("/login");
        } else {
          // Reset form for next user creation
          form.reset({
            name: "",
            email: "",
            password: "",
            departmentId: "",
            role: "EMPLOYEE"
          });
        }
      } else {
        throw new Error(data.status || "Registration failed: Unknown status");
      }
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`${formId}-name`}>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`${formId}-name`}
                        disabled={mutation.isPending}
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
                        disabled={mutation.isPending}
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
                        autoComplete="new-password"
                        disabled={mutation.isPending}
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
                    <FormLabel>Department</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem
                            key={department.id}
                            value={department.id.toString()}
                          >
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="HOD">Head of Department</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                        <SelectItem value="MOD">MOD</SelectItem>
                        <SelectItem value="SECURITY">Security</SelectItem>
                        {adminCreated && (
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? (adminCreated ? "Creating..." : "Registering...") 
                : (adminCreated ? "Create User" : "Register")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
