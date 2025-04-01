import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { Users, Building2, FileText, User, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Admin management cards with navigation
  const adminCards = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove system users",
      icon: <Users className="h-10 w-10 text-blue-500" />,
      action: () => navigate("/admin/users"),
    },
    {
      title: "Manage Departments",
      description: "Add, edit, or remove departments",
      icon: <Building2 className="h-10 w-10 text-green-500" />,
      action: () => navigate("/admin/departments"),
    },
    {
      title: "Manage Removal Reasons",
      description: "Add, edit, or remove removal reasons",
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      action: () => navigate("/admin/removal-reasons"),
    },
    {
      title: "Register New User",
      description: "Create a new system user account",
      icon: <PlusCircle className="h-10 w-10 text-orange-500" />,
      action: () => navigate("/admin/register-user"),
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Welcome to the admin section. From here you can manage all aspects of the Item Removal System.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="mt-1">{card.description}</CardDescription>
                </div>
                <div>{card.icon}</div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={card.action}
                  className="w-full mt-2"
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">System Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <p className="text-sm text-gray-500 mt-1">Active accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">6</div>
                <p className="text-sm text-gray-500 mt-1">Registered departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Removal Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">6</div>
                <p className="text-sm text-gray-500 mt-1">Available reasons</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 