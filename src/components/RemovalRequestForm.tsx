import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { RemovalReason } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { createRemovalRequest } from "@/api/removalService";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Department } from "@/contexts/ConfigContext";

interface ItemDescription {
  id: string;
  description: string;
  removalReasonId: number;
  customReason?: string;
}

interface FormData {
  removalTerms: 'returnable' | 'non-returnable';
  dateFrom: Date;
  dateTo?: Date;
  employee: string;
  departmentId: number;
  itemDescriptions: ItemDescription[];
  images: string[]; // Base64 encoded strings
}

const RemovalRequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [removalReasons, setRemovalReasons] = useState<RemovalReason[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    removalTerms: "returnable",
    dateFrom: new Date(),
    employee: user?.fullName || "",
    departmentId: 0,
    itemDescriptions: [
      {
        id: crypto.randomUUID(),
        description: "",
        removalReasonId: 0,
      }
    ],
    images: [],
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localImages, setLocalImages] = useState<{id: string, url: string}[]>([]);
  
  // Fetch departments and removal reasons from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch departments
        const deptResponse = await api.admin.getDepartments();
        if (deptResponse.result?.status === 'success' && deptResponse.result.response?.departments) {
          setDepartments(deptResponse.result.response.departments);
        }
        
        // Fetch removal reasons
        const reasonsResponse = await api.admin.getRemovalReasons();
        console.log("Full reasons response:", reasonsResponse);
        
        if (reasonsResponse.result?.status === 'success' && reasonsResponse.result.response?.reasons) {
          const reasons = reasonsResponse.result.response.reasons;
          console.log("Loaded removal reasons:", reasons);
          
          // Log the structure of the first reason (if available)
          if (reasons.length > 0) {
            console.log("First reason structure:", reasons[0]);
            console.log("First reason ID type:", typeof reasons[0].id);
            console.log("First reason name:", reasons[0].name);
          }
          
          setRemovalReasons(reasons);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: "Error",
          description: "Failed to load departments and removal reasons",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (
    field: keyof FormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "removalTerms") {
      if (value === "returnable") {
        setFormData((prev) => ({ 
          ...prev, 
          removalTerms: "returnable"
        }));
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          removalTerms: "non-returnable", 
          dateTo: undefined,
        }));
      }
    }
  };

  const handleItemDescriptionChange = (id: string, field: keyof ItemDescription, value: any) => {
    // Special handling for removal reason changes
    if (field === "removalReasonId") {
      console.log(`Reason changed to: ${value}`);
      // Convert to string to ensure proper comparison
      const strValue = value.toString();
      const reason = removalReasons.find(r => r.id.toString() === strValue);
      console.log(`Found reason:`, reason);
      console.log(`Is Other:`, reason?.name?.toUpperCase() === "OTHER");
    }
    
    setFormData(prev => ({
      ...prev,
      itemDescriptions: prev.itemDescriptions.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const addItemDescription = () => {
    setFormData(prev => ({
      ...prev,
      itemDescriptions: [
        ...prev.itemDescriptions,
        {
          id: crypto.randomUUID(),
          description: "",
          removalReasonId: 0,
        }
      ]
    }));
  };

  const removeItemDescription = (id: string) => {
    if (formData.itemDescriptions.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one item description is required",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      itemDescriptions: prev.itemDescriptions.filter(item => item.id !== id)
    }));
  };

  const isReasonOther = (reasonId: number): boolean => {
    if (!reasonId) return false;
    
    // Convert to string to ensure proper comparison
    const strId = reasonId.toString();
    console.log("Checking if reason is OTHER:", strId, removalReasons);
    
    // Find the reason by ID (as string)
    const reason = removalReasons.find(r => r.id.toString() === strId);
    console.log("Found reason for OTHER check:", reason);
    
    // If found, check if it's "OTHER" (case insensitive)
    if (reason && reason.name) {
      const upperName = reason.name.toUpperCase();
      return upperName === "OTHER";
    }
    
    return false;
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const imageUrl = event.target.result as string;
            // Add to local images for display
            setLocalImages((prev) => [
              ...prev,
              { id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, url: imageUrl }
            ]);
            
            // Add base64 string to form data
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, imageUrl]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (id: string) => {
    const imageIndex = localImages.findIndex(img => img.id === id);
    if (imageIndex !== -1) {
      // Remove from local images
      setLocalImages(prev => prev.filter(img => img.id !== id));
      
      // Remove from form data
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== imageIndex)
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const hasEmptyDescriptions = formData.itemDescriptions.some(item => !item.description);
    if (hasEmptyDescriptions) {
      toast({
        title: "Missing Information",
        description: "Please provide all item descriptions",
        variant: "destructive"
      });
      return;
    }
    
    const hasInvalidReason = formData.itemDescriptions.some(item => item.removalReasonId === 0);
    if (hasInvalidReason) {
      toast({
        title: "Missing Information",
        description: "Please select a removal reason for each item",
        variant: "destructive"
      });
      return;
    }
    
    // Check if any "Other" reason requires custom text
    const missingCustomReason = formData.itemDescriptions.some(
      item => isReasonOther(item.removalReasonId) && !item.customReason
    );
    
    if (missingCustomReason) {
      toast({
        title: "Missing Information",
        description: "Please provide a custom reason for all items with 'Other' selected",
        variant: "destructive"
      });
      return;
    }
    
    // Validate dateTo for returnable items
    if (formData.removalTerms === "returnable" && !formData.dateTo) {
      toast({
        title: "Missing Information",
        description: "Please select a return date for returnable items",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For now we'll use the first item for backward compatibility
      // In a future update, the API should be modified to accept multiple items
      const primaryItem = formData.itemDescriptions[0];
      
      // Format the request according to the API contract
      const requestData = {
        removalTerms: formData.removalTerms,
        dateFrom: formData.dateFrom.toISOString(),
        dateTo: formData.dateTo ? formData.dateTo.toISOString() : undefined,
        employee: formData.employee,
        departmentId: formData.departmentId,
        itemDescription: formData.itemDescriptions.map(item => item.description).join(" | "),
        removalReasonId: primaryItem.removalReasonId,
        customReason: primaryItem.customReason,
        images: formData.images
      };
      
      // Send the request to the API using our service
      const response = await createRemovalRequest(requestData);
      
      if (response.result?.status === 'success') {
        toast({
          title: "Success",
          description: response.result.response?.msg || "Removal request created successfully",
        });
        
        // Navigate to the request details page if successful
        if (response.result.response?.removal?.id) {
          navigate(`/request/${response.result.response.removal.id}`);
        } else {
          navigate('/requests'); // Fallback to requests list
        }
      } else {
        toast({
          title: "Error",
          description: response.result?.error || "Failed to create removal request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit the removal request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  // Display loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardContent className="p-8 text-center">
            <p className="text-lg">Loading form data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={isMobile ? "w-full px-2" : "max-w-3xl mx-auto"}>
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardContent className={isMobile ? "p-4" : "p-8"}>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <h2 className={isMobile ? "text-xl font-bold mb-4" : "text-2xl font-bold mb-6"}>Item Details</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Removal Terms</Label>
                  <RadioGroup
                    value={formData.removalTerms}
                    onValueChange={(value) => handleChange("removalTerms", value)}
                    className="flex space-x-6 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="returnable" id="returnable" className="h-5 w-5" />
                      <Label htmlFor="returnable" className={isMobile ? "text-sm" : "text-base"}>Returnable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-returnable" id="non-returnable" className="h-5 w-5" />
                      <Label htmlFor="non-returnable" className={isMobile ? "text-sm" : "text-base"}>Non-Returnable</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label htmlFor="dateFrom" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-2 h-11"
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {formData.dateFrom ? (
                          format(formData.dateFrom, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateFrom}
                        onSelect={(date) => handleChange("dateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {formData.removalTerms === "returnable" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label htmlFor="dateTo" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Date To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2 h-11"
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {formData.dateTo ? (
                            format(formData.dateTo, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dateTo}
                          onSelect={(date) => handleChange("dateTo", date)}
                          initialFocus
                          disabled={(date) => 
                            date < formData.dateFrom || 
                            date < new Date()
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label htmlFor="employee" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Employee Name</Label>
                  <Input
                    id="employee"
                    value={formData.employee}
                    onChange={(e) => handleChange("employee", e.target.value)}
                    className="mt-2 h-11"
                    placeholder="Enter employee name"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label htmlFor="departmentId" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Department</Label>
                  <Select
                    value={formData.departmentId === 0 ? "" : formData.departmentId.toString()}
                    onValueChange={(value) => handleChange("departmentId", parseInt(value))}
                  >
                    <SelectTrigger className="mt-2 h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="w-full"
                >
                  Next
                </Button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-5">
                <h2 className={isMobile ? "text-xl font-bold mb-4" : "text-2xl font-bold mb-6"}>Item Description</h2>
                
                {formData.itemDescriptions.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-primary">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Item {index + 1}</h3>
                      {formData.itemDescriptions.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItemDescription(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <Label htmlFor={`description-${item.id}`} className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>
                        Item Description
                      </Label>
                      <Textarea
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) => handleItemDescriptionChange(item.id, "description", e.target.value)}
                        className="mt-2 min-h-[100px]"
                        placeholder="Provide a detailed description of the item"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <Label htmlFor={`reason-${item.id}`} className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>
                        Removal Reason
                      </Label>
                      <Select
                        value={item.removalReasonId === 0 ? "" : item.removalReasonId.toString()}
                        onValueChange={(value) => handleItemDescriptionChange(item.id, "removalReasonId", parseInt(value))}
                      >
                        <SelectTrigger className="mt-2 h-11" id={`reason-${item.id}`}>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {removalReasons.map((reason) => {
                            // Log each reason for debugging
                            console.log(`Reason option: id=${reason.id}, name=${reason.name}`);
                            
                            return (
                              <SelectItem key={reason.id} value={reason.id.toString()}>
                                {reason.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Custom reason field for "OTHER" */}
                    {(() => {
                      // Check if a reason is selected
                      if (!item.removalReasonId) return null;
                      
                      // Convert reason ID to string for comparison
                      const reasonId = item.removalReasonId.toString();
                      console.log("Rendering reason check:", reasonId);
                      
                      // Find the reason by ID
                      const reason = removalReasons.find(r => r.id.toString() === reasonId);
                      console.log("Found reason for render:", reason);
                      
                      // Check if it's "OTHER"
                      if (reason && reason.name && reason.name.toUpperCase() === "OTHER") {
                        console.log("Rendering custom reason field");
                        return (
                          <div className="mb-2">
                            <Label htmlFor={`customReason-${item.id}`} className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>
                              Custom Reason
                            </Label>
                            <Textarea
                              id={`customReason-${item.id}`}
                              value={item.customReason || ""}
                              onChange={(e) => handleItemDescriptionChange(item.id, "customReason", e.target.value)}
                              className="mt-2 min-h-[80px]"
                              placeholder="Please specify the reason"
                            />
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addItemDescription}
                  className="w-full flex items-center justify-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Item
                </Button>
                
                <div className="flex justify-between space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-5">
                <h2 className={isMobile ? "text-xl font-bold mb-4" : "text-2xl font-bold mb-6"}>Upload Images</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label htmlFor="imageUpload" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>
                    Item Images
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="h-11"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload images of the item (maximum 5MB each)
                    </p>
                  </div>
                </div>
                
                {localImages.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>
                      Image Preview
                    </Label>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {localImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt="Item"
                            className="w-full h-24 object-cover rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemovalRequestForm;
