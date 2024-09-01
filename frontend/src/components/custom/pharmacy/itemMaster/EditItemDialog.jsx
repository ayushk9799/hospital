import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../ui/select"; // Import Select components

export default function EditItemDialog({ isOpen, onClose, item }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [MRP, setMRP] = useState("");
  const [types, setTypes] = useState("");
  const [supplierName, setSupplierName] = useState(""); // New state for supplier name

  const typeOptions = ["Type1", "Type2", "Type3"];
  const categoryOptions = ["Category1", "Category2", "Category3"];

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price);
      setStock(item.stock);
      setExpiryDate(item.expiryDate);
      setMRP(item.MRP);
      setTypes(item.types);
      setSupplierName(item.supplierName || ""); // Set supplier name if available
    }
  }, [item]);

  const handleEditItem = () => {
    // Implement edit item functionality here
    console.log("Item edited:", { name, category, price, stock, expiryDate, MRP, types, supplierName });
    onClose();
  };

  const handleReset = () => {
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setExpiryDate("");
    setMRP("");
    setTypes("");
    setSupplierName(""); // Reset supplier name
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
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" placeholder="Expiry Date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="supplierName">Supplier Name</Label> {/* New field for supplier name */}
              <Input id="supplierName" placeholder="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
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
