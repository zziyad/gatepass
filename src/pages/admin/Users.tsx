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
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilIcon, Trash2Icon, SearchIcon, UserPlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/types";

// Extended user type with department details
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: {
    id: number;
    name: string;
  };
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Fetch users list
  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: () => 
      apiClient<AdminUser[]>({
        method: "admin/users",
        args: {},
      }).then(res => res.response || []),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { userId: number; newPassword: string }) => 
      apiClient({
        method: "admin/resetPassword",
        args: {
          userId: data.userId,
          newPassword: data.newPassword
        },
      }),
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "User password has been reset successfully.",
      });
      setResetPasswordOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiClient({
        method: "admin/deleteUser",
        args: { userId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Handle password reset
  const handleResetPassword = () => {
    if (!selectedUser) return;
    
    resetPasswordMutation.mutate({
      userId: selectedUser.id,
      newPassword: newPassword
    });
  };

  // Handle user deletion
  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500";
      case "HOD":
        return "bg-blue-500";
      case "FINANCE":
        return "bg-green-500";
      case "MOD":
        return "bg-purple-500";
      case "SECURITY":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <Button onClick={() => navigate("/admin/register-user")}>
            <UserPlusIcon className="mr-2 h-4 w-4" /> Register New User
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department.name}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordOpen(true);
                        }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user)}
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

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setResetPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleResetPassword}
                disabled={!newPassword || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
} 