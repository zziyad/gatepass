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
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RemovalReason } from "@/types";

export default function AdminRemovalReasonsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<RemovalReason | null>(null);
  const [reasonName, setReasonName] = useState("");

  // Fetch removal reasons list
  const { data: reasons = [], isLoading } = useQuery<RemovalReason[]>({
    queryKey: ["admin", "removalReasons"],
    queryFn: async () => {
      const response = await api.client.request({
        method: "admin/removalReasons",
        args: {},
      });
      return response.result || [];
    }
  });

  // Create removal reason mutation
  const createReasonMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return api.client.request({
        method: "admin/createRemovalReason",
        args: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Reason Created",
        description: "New removal reason has been added successfully.",
      });
      resetForm();
    },
    onError: (error) => {
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
      return api.client.request({
        method: "admin/updateRemovalReason",
        args: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Reason Updated",
        description: "Removal reason has been updated successfully.",
      });
      resetForm();
    },
    onError: (error) => {
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
      return api.client.request({
        method: "admin/deleteRemovalReason",
        args: { reasonId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "removalReasons"] });
      toast({
        title: "Reason Deleted",
        description: "Removal reason has been deleted successfully.",
      });
    },
    onError: (error) => {
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
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
                  disabled={!reasonName || 
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