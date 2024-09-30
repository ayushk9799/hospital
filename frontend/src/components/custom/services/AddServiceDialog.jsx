import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { createService } from "../../../redux/slices/serviceSlice";
import { useToast } from "../../../hooks/use-toast";

const categoryOptions = ['Lab', 'General', 'Consultation', 'Other'];

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
          variant: "default",
        });
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
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new service
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleAddService(); }}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rate">Rate</Label>
              <Input id="rate" placeholder="Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} required />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createServiceStatus === "loading"}>
              {createServiceStatus === "loading" ? "Adding..." : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}