import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { createService } from "../../../redux/slices/serviceSlice";
import { useToast } from "../../../hooks/use-toast";

const categories = [
  "Consultation",
  "Lab",
  "General",
  "OPD Procedure",
  "Surgery",
  "Sub Category",
  "Other"
];

export default function AddServiceDialog({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const createServiceStatus = useSelector((state) => state.services.createServiceStatus);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState("");
  const { toast } = useToast();

  const handleAddService = () => {
    const serviceData = {
      name,
      category,
      rate: parseFloat(rate),
    };
    dispatch(createService(serviceData))
      .unwrap()
      .then(() => {
        toast({
          title: "Service added successfully",
          description: "The new service has been added.",
          variant: "success",
        });
        handleReset();
      })
      .catch((error) => {
        toast({
          title: "Failed to add service",
          description: error.message || "There was an error adding the service. Please try again.",
          variant: "destructive",
        });
      }).finally(() => {
        onClose();
      });
  };

  const handleReset = () => {
    setName("");
    setCategory("");
    setRate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Service</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill in the details to add a new service
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleAddService(); }} >
          <div className="grid gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate" className="text-sm font-medium">Rate</Label>
              <Input 
                id="rate" 
                placeholder="Rate" 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)} 
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">Reset</Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={createServiceStatus === "loading"} className="w-full sm:w-auto">
              {createServiceStatus === "loading" ? "Adding..." : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
