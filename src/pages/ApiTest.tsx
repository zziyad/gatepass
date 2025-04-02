import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

export default function ApiTest() {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("password");
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(email, password);
      setResponseData(response);
      console.log("Login response:", response);
    } catch (error) {
      console.error("Login error:", error);
      setResponseData({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await api.client.request({
        method: "auth/verify",
        args: {},
      });
      setResponseData(response);
      console.log("Verify response:", response);
    } catch (error) {
      console.error("Verify error:", error);
      setResponseData({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.logout();
      setResponseData(response);
      console.log("Logout response:", response);
    } catch (error) {
      console.error("Logout error:", error);
      setResponseData({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Test login, verify, and logout endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleLogin} disabled={isLoading} className="flex-1">
                Login
              </Button>
              <Button onClick={handleVerify} disabled={isLoading} className="flex-1">
                Verify
              </Button>
              <Button onClick={handleLogout} disabled={isLoading} className="flex-1">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API response data</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px] text-sm">
              {responseData ? JSON.stringify(responseData, null, 2) : "No data yet"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 