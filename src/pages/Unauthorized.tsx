import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="rounded-full bg-red-100 p-3">
          <Shield className="h-12 w-12 text-red-500" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Unauthorized Access</h1>
          <p className="text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 