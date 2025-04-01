import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, Trash2Icon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Department {
  id: number;
  name: string;
  userCount?: number; // May be included in response
}

export default function AdminDepartmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch departments list
  const { data: departments = [], isLoading, isError: isLoadError, error: loadError } = useQuery<Department[]>({
    queryKey: ["admin", "departments"],
    queryFn: () => 
      apiClient<Department[]>({
        method: "admin/departments",
        args: {},
      }).then(res => {
        console.log("Departments response:", res);
        return res.response || [];
      })
      .catch(err => {
        console.error("Error loading departments:", err);
        setError(`Failed to load departments: ${err.message}`);
        return [];
      }),
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: (data: { name: string }) => 
      apiClient({
        method: "admin/adddep",
        args: { name: data.name },
      }),
    onSuccess: (data) => {
      console.log("Department created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast({
        title: "Department Created",
        description: "New department has been added successfully.",
      });
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Failed to create department:", error);
      setError(`Failed to create department: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    },
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) => 
      apiClient({
        method: "admin/updateDepartment",
        args: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast({
        title: "Department Updated",
        description: "Department has been updated successfully.",
      });
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Failed to update department:", error);
      setError(`Failed to update department: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    },
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: (departmentId: number) => 
      apiClient({
        method: "admin/deleteDepartment",
        args: { departmentId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast({
        title: "Department Deleted",
        description: "Department has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to delete department:", error);
      setError(`Failed to delete department: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  // Reset form state
  const resetForm = () => {
    setDialogOpen(false);
    setEditingDepartment(null);
    setDepartmentName("");
    setError(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!departmentName.trim()) {
      setError("Department name cannot be empty");
      return;
    }
    
    if (editingDepartment) {
      updateDepartmentMutation.mutate({
        id: editingDepartment.id,
        name: departmentName
      });
    } else {
      console.log("Creating department with name:", departmentName);
      createDepartmentMutation.mutate({
        name: departmentName
      });
    }
  };

  // Handle department edit
  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDialogOpen(true);
    setError(null);
  };

  // Handle department deletion
  const handleDeleteDepartment = (department: Department) => {
    if (confirm(`Are you sure you want to delete ${department.name}?`)) {
      deleteDepartmentMutation.mutate(department.id);
    }
  };

  // Open dialog for new department
  const handleAddNew = () => {
    setEditingDepartment(null);
    setDepartmentName("");
    setDialogOpen(true);
    setError(null);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Departments</h1>
          <Button onClick={handleAddNew}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>

        {isLoadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {loadError instanceof Error ? loadError.message : "Failed to load departments"}
            </AlertDescription>
          </Alert>
        )}

        {/* Departments table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.userCount || 0} users</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDepartment(department)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDepartment(department)}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Department Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? "Update the department details"
                  : "Enter the details for the new department"}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="department-name" className="text-sm font-medium">
                    Department Name
                  </label>
                  <Input
                    id="department-name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!departmentName || 
                    createDepartmentMutation.isPending || 
                    updateDepartmentMutation.isPending}
                >
                  {(createDepartmentMutation.isPending || updateDepartmentMutation.isPending)
                    ? "Saving..."
                    : editingDepartment
                    ? "Update Department"
                    : "Add Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
} 