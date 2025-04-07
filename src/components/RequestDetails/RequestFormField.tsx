// components/RequestDetails/RequestFormField.tsx
interface RequestFormFieldProps {
    label: string;
    value: string;
  }
  
  const RequestFormField: React.FC<RequestFormFieldProps> = ({ label, value }) => (
    <div>
      <h3 className="text-sm font-medium mb-1">{label}</h3>
      <div className="border-b border-gray-400 py-1">{value}</div>
    </div>
  );
  
  export default RequestFormField;