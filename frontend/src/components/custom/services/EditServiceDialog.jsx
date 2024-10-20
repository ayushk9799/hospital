import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { updateService } from "../../../redux/slices/serviceSlice";
import { useToast } from "../../../hooks/use-toast";
import { cn } from "../../../lib/utils";

const categoryOptions = ['Lab', 'General', 'Consultation', 'Other'];

export default function EditServiceDialog({ isOpen, onClose, service }) {
  const dispatch = useDispatch();
  const updateServiceStatus = useSelector((state) => state.services.updateServiceStatus);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setRate(service.rate.toString());
    }
  }, [service]);

  const handleEditService = () => {
    const updatedService = {
      _id: service._id,
      name,
      category,
      rate: parseFloat(rate),
    };
    dispatch(updateService(updatedService))
      .unwrap()
      .then(() => {
        toast({
          title: "Service updated successfully",
          description: "The service has been updated.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to update service",
          description: error.message || "There was an error updating the service. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        onClose();
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Edit Service</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the service details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleEditService(); }} className="mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Service Name</Label>
              <Input 
                id="name" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate" className="text-sm font-medium">Rate</Label>
              <Input 
                id="rate" 
                placeholder="Rate" 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)} 
                required 
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={cn("w-full sm:w-auto", updateServiceStatus === "loading" && "opacity-50 cursor-not-allowed")}
              disabled={updateServiceStatus === "loading"}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={updateServiceStatus === "loading"}
            >
              {updateServiceStatus === "loading" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
