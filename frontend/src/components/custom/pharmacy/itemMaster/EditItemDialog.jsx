import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../ui/select"; // Import Select components
import { useToast } from "../../../../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateInventoryItem, setUpdateInventoryStatusIdle } from "../../../../redux/slices/pharmacySlice";

export default function EditItemDialog({ isOpen, onClose, item }) {
  const dispatch = useDispatch();
  const { updateInventoryItemStatus } = useSelector((state) => state.pharmacy);
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [MRP, setMRP] = useState("");
  const [types, setTypes] = useState("");
  const [supplierName, setSupplierName] = useState("");

  const typeOptions = ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Syrup', 'Other'];

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.CP);
      setQuantity(item.quantity);
      setExpiryDate(new Date(item.expiryDate).toISOString().slice(0, 7)); // Format as YYYY-MM
      setMRP(item.MRP);
      setTypes(item.type);
      setSupplierName(item.supplier.name || "");
    }
  }, [item]);

  useEffect(() => {
    if (updateInventoryItemStatus === "succeeded") {
      console.log("updateInventoryItemStatus");
      toast({
        title: "Changes saved",
        description: "The item has been updated successfully.",
        variant: "default",
      });
      onClose();
    }
    return () => {
      dispatch(setUpdateInventoryStatusIdle());
    };
  }, [updateInventoryItemStatus, dispatch]);

  const handleEditItem = () => {
    const changedValues = {};
    if (name !== item.name) changedValues.name = name;
    if (price !== item.CP) changedValues.price = price;
    if (quantity !== item.quantity) changedValues.quantity = quantity;
    if (expiryDate !== new Date(item.expiryDate).toISOString().slice(0, 7)) changedValues.expiryDate = expiryDate;
    if (MRP !== item.MRP) changedValues.MRP = MRP;
    if (types !== item.type) changedValues.type = types;

    if (Object.keys(changedValues).length === 0) {
      toast({
        title: "No changes made",
        description: "No items were modified.",
        variant: "default",
      });
    } else {
      dispatch(updateInventoryItem({ itemId: item._id, updateData: changedValues }));
      // console.log(changedValues, item._id);
    }
  };




  const handleReset = () => {
    setName("");
    setPrice("");
    setQuantity("");
    setExpiryDate("");
    setMRP("");
    setTypes("");
    setSupplierName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Edit the details of the item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleEditItem(); }}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="types">Type</Label>
              <Select onValueChange={(value) => setTypes(value)} value={types}>
                <SelectTrigger id="types">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="MRP">MRP</Label>
              <Input id="MRP" placeholder="MRP" value={MRP} onChange={(e) => setMRP(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate" 
                type="month" 
                placeholder="Expiry Date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input id="supplierName" placeholder="Supplier Name" readOnly value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" size="sm" variant="outline" onClick={handleReset}>Reset</Button>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
