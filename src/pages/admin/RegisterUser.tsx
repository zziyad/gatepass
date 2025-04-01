import AppLayout from "@/components/AppLayout";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterUserPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Register New User</h1>
        <p className="text-gray-600 mb-8 text-center">
          Create a new user account for the Item Removal System
        </p>
        <RegisterForm adminCreated={true} />
      </div>
    </AppLayout>
  );
} 