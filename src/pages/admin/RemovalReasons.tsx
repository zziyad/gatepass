import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
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
import { RemovalReason } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminRemovalReasonsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<RemovalReason | null>(null);
  const [reasonName, setReasonName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch removal reasons list
  const { data: reasons = [], isLoading, isError: isLoadError, error: loadError } = useQuery<RemovalReason[]>({
    queryKey: ["admin", "removalReasons"],
    queryFn: async () => {
      try {
        const response = await api.admin.getRemovalReasons();
        
        // Expected response format:
        // {
        //   "result": {
        //     "status": "success",
        //     "response": {
        //       "msg": "Removal reasons fetched successfully",
        //       "reasons": [...]
        //     }
        //   }
        // }
        
        if (response.result?.status === "success" && 
            response.result.response?.reasons) {
          return response.result.response.reasons as RemovalReason[];
        }
        
        console.error("Unexpected response format:", response);
        return [];
      } catch (err) {
        const error = err as Error;
        console.error("Failed to load removal reasons:", error);
        setError(`Failed to load removal reasons: ${error.message}`);
        return [];
      }
    }
  });

  // Create removal reason mutation
  const createReasonMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return api.admin.createRemovalReason(data.name);
    },
    onSuccess: (response) => {
      console.log("Create reason response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "Removal reason created successfully",
      //       "reason": { "id": "1", "name": "Example" }
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "New removal reason has been added successfully.";
      
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Success",
        description: msg,
      });
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Failed to create removal reason:", error);
      setError(`Failed to create removal reason: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to create removal reason",
        variant: "destructive",
      });
    },
  });

  // Update removal reason mutation
  const updateReasonMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      return api.admin.updateRemovalReason(data.id, data.name);
    },
    onSuccess: (response) => {
      console.log("Update reason response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "Removal reason updated successfully",
      //       "reason": { "id": "1", "name": "Updated Example" }
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "Removal reason has been updated successfully.";
      
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Success",
        description: msg,
      });
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Failed to update removal reason:", error);
      setError(`Failed to update removal reason: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to update removal reason",
        variant: "destructive",
      });
    },
  });

  // Delete removal reason mutation
  const deleteReasonMutation = useMutation({
    mutationFn: async (reasonId: string) => {
      return api.admin.deleteRemovalReason(reasonId);
    },
    onSuccess: (response) => {
      console.log("Delete reason response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "Removal reason deleted successfully"
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "Removal reason has been deleted successfully.";
      
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Success",
        description: msg,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to delete removal reason:", error);
      setError(`Failed to delete removal reason: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to delete removal reason",
        variant: "destructive",
      });
    },
  });

  // Reset form state
  const resetForm = () => {
    setDialogOpen(false);
    setEditingReason(null);
    setReasonName("");
    setError(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reasonName.trim()) {
      setError("Reason name cannot be empty");
      return;
    }
    
    if (editingReason) {
      updateReasonMutation.mutate({
        id: editingReason.id,
        name: reasonName
      });
    } else {
      createReasonMutation.mutate({
        name: reasonName
      });
    }
  };

  // Handle reason edit
  const handleEditReason = (reason: RemovalReason) => {
    setEditingReason(reason);
    setReasonName(reason.name);
    setDialogOpen(true);
    setError(null);
  };

  // Handle reason deletion
  const handleDeleteReason = (reason: RemovalReason) => {
    if (confirm(`Are you sure you want to delete "${reason.name}"?`)) {
      deleteReasonMutation.mutate(reason.id);
    }
  };

  // Open dialog for new reason
  const handleAddNew = () => {
    setEditingReason(null);
    setReasonName("");
    setDialogOpen(true);
    setError(null);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Removal Reasons</h1>
          <Button onClick={handleAddNew}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Reason
          </Button>
        </div>

        {isLoadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {loadError instanceof Error ? loadError.message : "Failed to load removal reasons"}
            </AlertDescription>
          </Alert>
        )}

        {/* Removal Reasons table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reason Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    Loading removal reasons...
                  </TableCell>
                </TableRow>
              ) : reasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    No removal reasons found
                  </TableCell>
                </TableRow>
              ) : (
                reasons.map((reason) => (
                  <TableRow key={reason.id}>
                    <TableCell>{reason.id}</TableCell>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditReason(reason)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReason(reason)}
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

        {/* Add/Edit Removal Reason Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReason ? "Edit Removal Reason" : "Add New Removal Reason"}
              </DialogTitle>
              <DialogDescription>
                {editingReason
                  ? "Update the removal reason details"
                  : "Enter the details for the new removal reason"}
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
                  <label htmlFor="reason-name" className="text-sm font-medium">
                    Reason Name
                  </label>
                  <Input
                    id="reason-name"
                    value={reasonName}
                    onChange={(e) => setReasonName(e.target.value)}
                    placeholder="Enter removal reason name"
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
                  disabled={!reasonName.trim() || 
                    createReasonMutation.isPending || 
                    updateReasonMutation.isPending}
                >
                  {(createReasonMutation.isPending || updateReasonMutation.isPending)
                    ? "Saving..."
                    : editingReason
                    ? "Update Reason"
                    : "Add Reason"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
} 