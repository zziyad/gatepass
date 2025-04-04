import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilIcon, Trash2Icon, SearchIcon, UserPlusIcon, AlertCircle, KeyIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RegisterForm from "@/components/RegisterForm";
import { getRoleDisplayName, getRoleBadgeColor } from "@/utils/roleUtils";
import { UserCard } from "@/components/UserCard";

// Extended user type with department details
interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  position?: string;
  departmentName?: string;
  department: {
    id: number;
    name: string;
  };
}

// Department type for the dropdown
interface Department {
  id: number;
  name: string;
}

// Convert AdminUser to User for UserCard component
function adminUserToUser(adminUser: AdminUser): User {
  return {
    id: adminUser.id.toString(), // Convert ID to string
    fullName: adminUser.fullName,
    email: adminUser.email,
    departmentName: adminUser.department?.name || "Unknown",
    position: adminUser.position,
    role: adminUser.role
  };
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [registerUserOpen, setRegisterUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole | "">("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editPosition, setEditPosition] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL_ROLES");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL_DEPARTMENTS");

  // Fetch departments for the edit user form
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await api.admin.getDepartments();
        
        if (response.result?.status === "success" && 
            response.result.response?.departments) {
          return response.result.response.departments as Department[];
        }
        
        return [];
      } catch (err) {
        console.error("Failed to load departments:", err);
        return [];
      }
    }
  });

  // Fetch users list
  const { data: users = [], isLoading, isError: isLoadError, error: loadError } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<AdminUser[]> => {
      try {
        const response = await api.admin.getUsers();
        
        // Expected response format:
        // {
        //   "result": {
        //     "status": "success",
        //     "response": {
        //       "msg": "Users fetched successfully",
        //       "users": [...]
        //     }
        //   }
        // }
        
        if (response.result?.status === "success" && 
            response.result.response?.users) {
          return response.result.response.users as AdminUser[];
        }
        
        console.error("Unexpected response format:", response);
        return [] as AdminUser[];
      } catch (err) {
        const error = err as Error;
        console.error("Failed to load users:", error);
        setError(`Failed to load users: ${error.message}`);
        return [] as AdminUser[];
      }
    }
  });

  // Set up edit form when a user is selected
  useEffect(() => {
    if (selectedUser && editUserOpen) {
      setEditEmail(selectedUser.email || "");
      setEditRole(selectedUser.role || "");
      setEditDepartmentId(selectedUser.department?.id ? selectedUser.department.id.toString() : "");
      setEditPosition(selectedUser.position || "");
    }
  }, [selectedUser, editUserOpen]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { userId: number; newPassword: string }) => {
      return api.admin.resetPassword(data.userId, data.newPassword);
    },
    onSuccess: (response) => {
      console.log("Reset password response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "Password reset successfully"
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "User password has been reset successfully.";
      
      toast({
        title: "Success",
        description: msg,
      });
      setResetPasswordOpen(false);
      setNewPassword("");
      setError(null);
    },
    onError: (error: Error) => {
      console.error("Failed to reset password:", error);
      setError(`Failed to reset password: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      email: string; 
      role: string; 
      departmentId: number;
      position?: string;
    }) => {
      return api.admin.updateUser(
        data.id, 
        data.email, 
        data.role, 
        data.departmentId,
        data.position
      );
    },
    onSuccess: (response) => {
      console.log("Update user response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "User updated successfully",
      //       "user": {
      //         "id": 1,
      //         "email": "user@example.com",
      //         "role": "ADMIN",
      //         "departmentId": 2
      //       }
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "User has been updated successfully.";
      
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: msg,
      });
      setEditUserOpen(false);
      setError(null);
    },
    onError: (error: Error) => {
      console.error("Failed to update user:", error);
      setError(`Failed to update user: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return api.admin.deleteUser(userId);
    },
    onSuccess: (response) => {
      console.log("Delete user response:", response);
      
      // Expected response format:
      // {
      //   "result": {
      //     "status": "success",
      //     "response": {
      //       "msg": "User deleted successfully"
      //     }
      //   }
      // }
      
      const msg = response.result?.response?.msg || "User has been deleted successfully.";
      
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: msg,
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error("Failed to delete user:", error);
      setError(`Failed to delete user: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Handle user registration completion
  const handleRegistrationComplete = () => {
    // Refresh the users list
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  // Handle password reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError("No user selected");
      return;
    }
    
    if (!newPassword.trim()) {
      setError("Password cannot be empty");
      return;
    }
    
    resetPasswordMutation.mutate({
      userId: selectedUser.id,
      newPassword: newPassword
    });
  };

  // Handle user update
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError("No user selected");
      return;
    }
    
    if (!editEmail.trim()) {
      setError("Email cannot be empty");
      return;
    }
    
    if (!editRole) {
      setError("Role must be selected");
      return;
    }
    
    if (!editDepartmentId) {
      setError("Department must be selected");
      return;
    }
    
    updateUserMutation.mutate({
      id: selectedUser.id,
      email: editEmail,
      role: editRole,
      departmentId: parseInt(editDepartmentId, 10),
      position: editPosition
    });
  };

  // Handle edit user
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditEmail(user.email || "");
    setEditRole(user.role || "");
    setEditDepartmentId(user.department?.id ? user.department.id.toString() : "");
    setEditPosition(user.position || "");
    setEditUserOpen(true);
    setError(null);
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  // Filter users based on search query and role/department filters
  const filteredUsers = users.filter(
    (user) => {
      // Text search filtering
      const matchesSearch = searchQuery === "" || (
        (user.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (user.department?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
      
      // Role filtering
      const matchesRole = !roleFilter || roleFilter === "ALL_ROLES" || user.role === roleFilter;
      
      // Department filtering
      const matchesDepartment = !departmentFilter || 
        departmentFilter === "ALL_DEPARTMENTS" ||
        (user.department && user.department.id === parseInt(departmentFilter, 10));
      
      return matchesSearch && matchesRole && matchesDepartment;
    }
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL_ROLES");
    setDepartmentFilter("ALL_DEPARTMENTS");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <Button onClick={() => setRegisterUserOpen(true)}>
            <UserPlusIcon className="mr-2 h-4 w-4" /> Register New User
          </Button>
        </div>

        {isLoadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {loadError instanceof Error ? loadError.message : "Failed to load users"}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and filters */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full sm:w-64">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_ROLES">All Roles</SelectItem>
                  <SelectItem value="LEVEL_1">Requester</SelectItem>
                  <SelectItem value="LEVEL_2">Department Approval</SelectItem>
                  <SelectItem value="LEVEL_3">Finance Approval</SelectItem>
                  <SelectItem value="LEVEL_4">Management Approval</SelectItem>
                  <SelectItem value="SECURITY">Security Approval</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-64">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_DEPARTMENTS">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(roleFilter || departmentFilter || searchQuery) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Users table display counts */}
        <div className="text-sm text-gray-500 mb-4">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>{user.department?.name || user.departmentName || "No Department"}</TableCell>
                    <TableCell>{user.position || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <PencilIcon className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordOpen(true);
                          setNewPassword("");
                          setError(null);
                        }}
                      >
                        <KeyIcon className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}
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
                Set a new password for {selectedUser?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleResetPassword}>
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
                  type="button" 
                variant="outline" 
                onClick={() => setResetPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                  disabled={!newPassword.trim() || resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update details for {selectedUser?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={editRole}
                    onValueChange={(value) => setEditRole(value as UserRole)}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEVEL_1">Requester</SelectItem>
                      <SelectItem value="LEVEL_2">Department Approval</SelectItem>
                      <SelectItem value="LEVEL_3">Finance Approval</SelectItem>
                      <SelectItem value="LEVEL_4">Management Approval</SelectItem>
                      <SelectItem value="SECURITY">Security Approval</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-department" className="text-sm font-medium">
                    Department
                  </label>
                  <Select
                    value={editDepartmentId}
                    onValueChange={setEditDepartmentId}
                  >
                    <SelectTrigger id="edit-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-position" className="text-sm font-medium">
                    Position
                  </label>
                  <Input
                    id="edit-position"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    placeholder="Enter position (e.g., Manager, Engineer)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!editEmail.trim() || !editRole || !editDepartmentId || updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Register User Dialog */}
        <Dialog 
          open={registerUserOpen} 
          onOpenChange={(open) => {
            setRegisterUserOpen(open);
            if (!open) handleRegistrationComplete();
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Register New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the Item Removal System
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RegisterForm 
                adminCreated={true} 
                queryClient={queryClient} 
                onComplete={() => setRegisterUserOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.fullName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="mt-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-medium">Standard User Card</h3>
            {users.length > 0 && <UserCard user={adminUserToUser(users[0])} />}
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Compact User Card</h3>
            {users.length > 0 && <UserCard user={adminUserToUser(users[0])} variant="compact" />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 