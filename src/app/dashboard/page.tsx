import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardRecentActivity from "@/components/DashboardRecentActivity";
import Link from "next/link";

interface DashboardStats {
  pending: number;
  approved: number;
  rejected: number;
}

export default async function DashboardPage() {
  // This would normally come from your API
  const stats: DashboardStats = {
    pending: 1,
    approved: 0,
    rejected: 0
  };

  // Example recent requests data
  const recentRequests = [
    {
      id: 1,
      status: "pending",
      dateFrom: new Date(),
      dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      employee: "John Doe",
      department: "IT Department",
      createdAt: new Date(),
      items: [
        { description: "Laptop" },
        { description: "Monitor" }
      ],
      removalTerms: "returnable"
    },
    // Add more example requests as needed
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your removal requests and activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* My Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <p className="text-sm text-gray-500">Summary of your removal requests</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Pending</span>
                </div>
                <span className="font-medium">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Approved</span>
                </div>
                <span className="font-medium">{stats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Rejected</span>
                </div>
                <span className="font-medium">{stats.rejected}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/requests" className="block w-full">
                <Button variant="outline" className="w-full">
                  View All Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <p className="text-sm text-gray-500">Requests waiting for your approval</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No pending approvals
            </div>
            <div className="mt-4">
              <Link href="/approvals" className="block w-full">
                <Button variant="outline" className="w-full">
                  View All Approvals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-gray-500">Common tasks</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/requests/new" className="block w-full">
              <Button className="w-full">
                New Removal Request
              </Button>
            </Link>
            <Link href="/approvals" className="block w-full">
              <Button variant="outline" className="w-full">
                Review Pending Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-6">
        <DashboardRecentActivity recentRequests={recentRequests} />
      </div>
    </div>
  );
} 