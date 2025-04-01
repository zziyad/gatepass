import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Registration Restricted",
      description: "Registration is only available through system administrators.",
      variant: "destructive",
    });
    
    // Redirect to login page after showing message
    navigate("/login");
  }, [navigate, toast]);

  return null; // No UI needed as we're redirecting
};

export default Register;
