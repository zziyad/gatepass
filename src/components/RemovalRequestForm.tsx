import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { RemovalReason, RemovalTerm } from "@/types";
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
import { Calendar as CalendarIcon, X, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ItemDescriptionWithReason {
  id: string;
  description: string;
  reasonId: string;
  customReason?: string;
}

interface FormData {
  term: RemovalTerm;
  dateFrom: Date;
  dateTo?: Date;
  targetDepartment?: string;
  employee?: string;
  items: ItemDescriptionWithReason[];
  images: { id: string; url: string }[];
}

const RemovalRequestForm = () => {
  const { addRequest, removalReasons } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState<FormData>({
    term: "RETURNABLE",
    dateFrom: new Date(),
    items: [{ id: "item-1", description: "", reasonId: "", customReason: "" }],
    images: [],
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (
    field: keyof FormData,
    value: string | Date | undefined | { id: string; url: string }[] | ItemDescriptionWithReason[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "term") {
      if (value === "RETURNABLE") {
        setFormData((prev) => ({ 
          ...prev, 
          term: "RETURNABLE", 
          employee: undefined,
        }));
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          term: "NON_RETURNABLE", 
          dateTo: undefined,
          targetDepartment: undefined,
        }));
      }
    }
  };

  const handleItemChange = (itemId: string, field: keyof ItemDescriptionWithReason, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    const newItemId = `item-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: newItemId, description: "", reasonId: "", customReason: "" }]
    }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length <= 1) {
      return; // Don't remove the last item
    }
    
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const imageUrl = event.target.result as string;
            setFormData((prev) => ({
              ...prev,
              images: [
                ...prev.images,
                { id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, url: imageUrl },
              ],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate items have description and reason
    const invalidItems = formData.items.filter(item => 
      !item.description.trim() || !item.reasonId.trim() || 
      (item.reasonId === "6" && !item.customReason?.trim())
    );
    
    if (invalidItems.length > 0) {
      alert("Please fill in all required item fields (description and reason)");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a request for each item
      const mainItem = formData.items[0];
      // Create the first request and get its ID
      const requestData = {
        term: formData.term,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        targetDepartment: formData.targetDepartment,
        employee: formData.employee,
        itemDescription: mainItem.description,
        removalReasonId: mainItem.reasonId,
        customReason: mainItem.customReason,
        images: formData.images
      };
      
      // Store the result and explicitly check if it's a string
      const result = addRequest(requestData);
      const requestId = typeof result === 'string' ? result : null;
      
      if (requestId) {
        navigate(`/request/${requestId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
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
                    value={formData.term}
                    onValueChange={(value) => handleChange("term", value as RemovalTerm)}
                    className="flex space-x-6 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="RETURNABLE" id="returnable" className="h-5 w-5" />
                      <Label htmlFor="returnable" className={isMobile ? "text-sm" : "text-base"}>Returnable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NON_RETURNABLE" id="non-returnable" className="h-5 w-5" />
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
                
                {formData.term === "RETURNABLE" && (
                  <>
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
                            fromDate={formData.dateFrom}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Label htmlFor="targetDepartment" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Target Department</Label>
                      <Input
                        id="targetDepartment"
                        value={formData.targetDepartment || ""}
                        onChange={(e) => handleChange("targetDepartment", e.target.value)}
                        placeholder="Enter department name"
                        className="mt-2 h-11"
                      />
                    </div>
                  </>
                )}
                
                {formData.term === "NON_RETURNABLE" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label htmlFor="employee" className={isMobile ? "text-sm font-medium" : "text-base font-medium"}>Employee (Sender)</Label>
                    <Input
                      id="employee"
                      value={formData.employee || ""}
                      onChange={(e) => handleChange("employee", e.target.value)}
                      placeholder="Enter employee name"
                      className="mt-2 h-11"
                    />
                  </div>
                )}
                
                <div className="flex justify-end pt-6">
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className={isMobile ? "h-10 px-4" : "h-11 px-6"}
                    size={isMobile ? "default" : "lg"}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-5">
                <h2 className={isMobile ? "text-xl font-bold mb-4" : "text-2xl font-bold mb-6"}>Item Descriptions</h2>
                
                {formData.items.map((item, index) => (
                  <div key={item.id} className="p-5 border rounded-md mb-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={isMobile ? "text-md font-semibold" : "text-lg font-semibold"}>Item {index + 1}</h3>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className={isMobile ? "h-4 w-4 mr-1" : "h-5 w-5 mr-1"} /> Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label 
                          htmlFor={`item-description-${item.id}`}
                          className={isMobile ? "text-sm font-medium" : "text-base font-medium"}
                        >
                          Item Description
                        </Label>
                        <Textarea
                          id={`item-description-${item.id}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                          placeholder="Describe the item in detail"
                          className="mt-2 min-h-24"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label 
                          htmlFor={`item-reason-${item.id}`}
                          className={isMobile ? "text-sm font-medium" : "text-base font-medium"}
                        >
                          Removal Reason
                        </Label>
                        <Select
                          value={item.reasonId}
                          onValueChange={(value) => handleItemChange(item.id, "reasonId", value)}
                          required
                        >
                          <SelectTrigger 
                            className="mt-2 h-11" 
                            id={`item-reason-${item.id}`}
                          >
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {removalReasons.map((reason: RemovalReason) => (
                              <SelectItem key={reason.id} value={reason.id}>
                                {reason.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {item.reasonId === "6" && (
                        <div>
                          <Label 
                            htmlFor={`item-custom-reason-${item.id}`}
                            className={isMobile ? "text-sm font-medium" : "text-base font-medium"}
                          >
                            Custom Reason
                          </Label>
                          <Textarea
                            id={`item-custom-reason-${item.id}`}
                            value={item.customReason || ""}
                            onChange={(e) => handleItemChange(item.id, "customReason", e.target.value)}
                            placeholder="Enter your custom reason"
                            className="mt-2 min-h-24"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full flex items-center justify-center h-11 bg-gray-50 hover:bg-gray-100"
                >
                  <Plus className={isMobile ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"} /> 
                  Add Another Item
                </Button>
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className={isMobile ? "h-10 px-4" : "h-11 px-6"}
                    size={isMobile ? "default" : "lg"}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className={isMobile ? "h-10 px-4" : "h-11 px-6"}
                    size={isMobile ? "default" : "lg"}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-5">
                <h2 className={isMobile ? "text-xl font-bold mb-4" : "text-2xl font-bold mb-6"}>Images & Review</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label 
                    htmlFor="images"
                    className={isMobile ? "text-sm font-medium" : "text-base font-medium"}
                  >
                    Upload Images
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="mt-2 h-11"
                  />
                </div>
                
                {formData.images.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label 
                      className={isMobile ? "text-sm font-medium" : "text-base font-medium"}
                    >
                      Uploaded Images ({formData.images.length})
                    </Label>
                    <div className={isMobile ? "grid grid-cols-2 gap-2 mt-2" : "grid grid-cols-3 gap-3 mt-3"}>
                      {formData.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt="Uploaded item"
                            className={isMobile 
                              ? "h-28 w-full object-cover rounded border transition-transform group-hover:opacity-80" 
                              : "h-36 w-full object-cover rounded border transition-transform group-hover:opacity-80"
                            }
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-70 hover:opacity-100"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-5 rounded-lg mt-4">
                  <h3 className={isMobile ? "text-md font-semibold mb-3" : "text-lg font-semibold mb-4"}>Form Summary</h3>
                  <ul className={isMobile ? "space-y-2 text-sm" : "space-y-3 text-base"}>
                    <li>
                      <span className="font-medium">Term:</span> {formData.term === "RETURNABLE" ? "Returnable" : "Non-Returnable"}
                    </li>
                    <li>
                      <span className="font-medium">Date From:</span> {formData.dateFrom?.toLocaleDateString()}
                    </li>
                    {formData.term === "RETURNABLE" && (
                      <>
                        <li>
                          <span className="font-medium">Date To:</span> {formData.dateTo?.toLocaleDateString() || "Not specified"}
                        </li>
                        <li>
                          <span className="font-medium">Target Department:</span> {formData.targetDepartment || "Not specified"}
                        </li>
                      </>
                    )}
                    {formData.term === "NON_RETURNABLE" && (
                      <li>
                        <span className="font-medium">Employee (Sender):</span> {formData.employee || "Not specified"}
                      </li>
                    )}
                    <li>
                      <span className="font-medium">Items:</span> {formData.items.length}
                    </li>
                    {formData.items.map((item, index) => (
                      <li key={item.id} className={isMobile ? "ml-3 mt-1 bg-white p-2 rounded" : "ml-4 mt-2 bg-white p-3 rounded"}>
                        <span className="font-medium">Item {index + 1}:</span> {item.description || "Not provided"} 
                        {item.reasonId && (
                          <span className="block ml-4 mt-1">
                            <span className="font-medium">Reason:</span> {removalReasons.find(r => r.id === item.reasonId)?.name}
                            {item.reasonId === "6" && item.customReason && (
                              <span className="block ml-4 mt-1 text-gray-600">
                                <span className="font-medium">Custom Reason:</span> {item.customReason}
                              </span>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                    <li>
                      <span className="font-medium">Images:</span> {formData.images.length} uploaded
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className={isMobile ? "h-10 px-4" : "h-11 px-6"}
                    size={isMobile ? "default" : "lg"}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={isMobile ? "h-10 px-4" : "h-11 px-6"}
                    size={isMobile ? "default" : "lg"}
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
