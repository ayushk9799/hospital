import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { updateService } from "../../../redux/slices/serviceSlice";

const categoryOptions = ['Lab', 'General', 'Consultation', 'Other'];

export default function EditServiceDialog({ isOpen, onClose, service }) {
  const dispatch = useDispatch();
  const updateServiceStatus = useSelector((state) => state.services.updateServiceStatus);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState("");

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
    dispatch(updateService(updatedService));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the service details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleEditService(); }}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateServiceStatus === "loading"}>
              {updateServiceStatus === "loading" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}