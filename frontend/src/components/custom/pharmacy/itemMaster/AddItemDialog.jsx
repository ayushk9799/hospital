import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../ui/select"; // Import Select components
import { useDispatch } from "react-redux";
import { createInventoryItem } from "../../../../redux/slices/pharmacySlice";
import { useToast } from "../../../../hooks/use-toast";
import { useSelector } from "react-redux";

export default function AddItemDialog({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { createInventoryItemStatus } = useSelector((state) => state.pharmacy);
  const {hospitalInfo} = useSelector((state) => state.hospital  );
  const pharmacyItemCategories = hospitalInfo?.pharmacyItemCategories || [];
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(""); // Changed from stock to quantity
  const [expiryDate, setExpiryDate] = useState("");
  const [MRP, setMRP] = useState("");
  const [types, setTypes] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const handleAddItem = () => {
    const itemData = {
      itemsDetails : {
        name,
        CP: parseFloat(price),
        quantity: parseInt(quantity),
        expiryDate,
        MRP: parseFloat(MRP),
        type: types,
      },
      supplierInfo: { name: supplierName, phone: supplierPhone, address: supplierAddress }
    };
    dispatch(createInventoryItem(itemData)).unwrap()
      .then(() => {
        toast({
          title: "Item added successfully",
          description: "The new item has been added to the inventory.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to add item",
          description: error.message || "There was an error adding the item. Please try again.",
          variant: "destructive",
        });
      }).finally(() => {
        onClose();
      });
  };

  const handleReset = () => {
    setName("");
    setPrice("");
    setQuantity(""); // Changed from setStock to setQuantity
    setExpiryDate("");
    setMRP("");
    setTypes("");
    setSupplierName("");
    setSupplierPhone(""); // Reset supplier phone
    setSupplierAddress(""); // Reset supplier address
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] w-[90vw] rounded-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Fill basic details of item for new item registration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-4 gap-1">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="types">Type</Label>
              <Select onValueChange={(value) => setTypes(value)} required>
                <SelectTrigger id="types">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacyItemCategories.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="MRP">MRP</Label>
              <Input id="MRP" placeholder="MRP" value={MRP} onChange={(e) => setMRP(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
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
            <div className="hidden sm:block">
              <Label htmlFor="supplierName">Supplier Name</Label> {/* New field for supplier name */}
              <Input id="supplierName" placeholder="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
            <div className="hidden sm:block">
              <Label htmlFor="supplierPhone">Supplier Phone</Label>
              <Input id="supplierPhone" placeholder="Supplier Phone" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} />
            </div>
            <div className="hidden sm:block">
              <Label htmlFor="supplierAddress">Supplier Address</Label>
              <Input id="supplierAddress" placeholder="Supplier Address" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4 flex-col-reverse sm:flex-row gap-2">
            <Button className="hidden md:block" type="button" size="sm" variant="outline" onClick={handleReset}>Reset</Button>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={createInventoryItemStatus === "loading"}>
              {createInventoryItemStatus === "loading" ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
