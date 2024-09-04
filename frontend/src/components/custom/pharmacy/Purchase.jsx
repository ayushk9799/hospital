// use scroll area for item table, rupee symbol for amount paying

import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Label } from "../../ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ChevronRight } from "lucide-react";
import { BriefcaseMedicalIcon } from "lucide-react";
import { supplierArray } from "./Supplier";
import { Plus, Pencil, Trash, Package, CheckCircle } from 'lucide-react';

const LabeledInput = ({ label, value, readOnly = false, onChange, className = "", type = "text", placeholder="", required=false }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      className={`pl-2 pr-2 pt-4 pb-1 w-full text-sm border rounded ${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      placeholder={placeholder}
      required={required}
    />
    <label className="absolute text-xs text-gray-500 top-1 left-2">
      {label}
    </label>
  </div>
);

export default function Purchase() {
  const [itemID, setItemID] = useState(1); // for unique id of item
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierInfo, setSupplierInfo] = useState({
    phone: "",
    email: "",
    address: "",
  });

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unitPrice: '',
    discount: '',
    tax: '',
  });

  const [amountPaying, setAmountPaying] = useState('');

  useEffect(() => {
    if (selectedSupplier) {
      setSupplierInfo({
        phone: selectedSupplier.contactNumber || "",
        email: selectedSupplier.email || "",
        address: selectedSupplier.address || "",
      });
    }
  }, [selectedSupplier]);

  const handleSupplierChange = (value) => {
    const supplier = supplierArray.find((s) => s.id === value);
    setSelectedSupplier(supplier);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSupplierInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => {
      const updatedItem = { ...prev, [name]: value };
      
      // Calculate total if quantity and unitPrice are present
      if (updatedItem.quantity && updatedItem.unitPrice) {
        const quantity = parseFloat(updatedItem.quantity);
        const unitPrice = parseFloat(updatedItem.unitPrice);
        const discount = parseFloat(updatedItem.discount) || 0;
        const tax = parseFloat(updatedItem.tax) || 0;

        const subtotal = quantity * unitPrice;
        const discountAmount = subtotal * (discount / 100);
        const taxAmount = (subtotal - discountAmount) * (tax / 100);
        updatedItem.total = subtotal - discountAmount + taxAmount;
      } else {
        updatedItem.total = null;
      }

      return updatedItem;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const addItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unitPrice) {
      alert('Please fill in at least the item name, quantity, and unit price.');
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const unitPrice = parseFloat(newItem.unitPrice);
    const discount = parseFloat(newItem.discount) || 0;
    const tax = parseFloat(newItem.tax) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const taxAmount = (subtotal - discountAmount) * (tax / 100);
    const total = subtotal - discountAmount + taxAmount;

    const newItemWithId = {
      id: itemID,
      ...newItem,
      quantity,
      unitPrice,
      discount,
      tax,
      total,
    };

    setItems(prev => [...prev, newItemWithId]);
    setItemID(prev => prev + 1);
    setNewItem({
      name: '',
      quantity: '',
      unitPrice: '',
      discount: '',
      tax: '',
    });
  };

  const deleteItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const editItem = (id) => {
    const itemToEdit = items.find(item => item.id === id);
    deleteItem(id);
    setNewItem(itemToEdit);
  }

  const clearNewItem = () => {
    setNewItem({
      name: '',
      quantity: '',
      unitPrice: '',
      discount: '',
      tax: '',
    });
  };

  const calculateTotals = () => {
    const totals = items.reduce((acc, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const taxAmount = (subtotal - discountAmount) * (item.tax / 100);
      
      acc.subtotal += subtotal;
      acc.taxTotal += taxAmount;
      acc.discountTotal += discountAmount;
      acc.grandTotal += subtotal - discountAmount + taxAmount;

      return acc;
    }, { subtotal: 0, taxTotal: 0, discountTotal: 0, grandTotal: 0 });

    const dueAmount = totals.grandTotal - parseFloat(amountPaying || 0);
    return { ...totals, dueAmount };
  };

  const totals = calculateTotals();

  const handleSaveDraft = () => {
    // Implement logic to save the current state as a draft
    console.log("Saving draft...", { items, supplierInfo, totals });
    // You might want to send this data to your backend or store it locally
  };

  const handleCreatePurchaseOrder = (e) => {
    e.preventDefault();
    // Implement logic to create the purchase order
    console.log("Creating purchase order...", { items, supplierInfo, totals });
    // You might want to send this data to your backend to create the order
  };

  const handlePayFullAmount = () => {
    setAmountPaying(totals.grandTotal.toFixed(2));
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center p-1 space-x-1 bg-gray-100 mb-2">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <BriefcaseMedicalIcon className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-semibold text-gray-700 text-sm">
            Purchase Order
          </span>
        </div>

        <div className="flex  space-x-2 h-[calc(100vh-245px)]">
          {/* Purchase Order Details and Item Table */}
          <div className="w-3/4 space-y-4 h-full">
            {/* Item Table */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-semibold">Purchase Items</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <form onSubmit={handleSubmit}>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className='bg-blue-200 border-2 border-blue-300 hover:bg-blue-200'>
                        <TableHead className="h-7">Sr.</TableHead>
                        <TableHead className="h-7 ">Item Name</TableHead>
                        <TableHead className="h-7">Quantity</TableHead>
                        <TableHead className="h-7">Unit Price</TableHead>
                        <TableHead className="h-7">Discount (%)</TableHead>
                        <TableHead className="h-7">Tax (%)</TableHead>
                        <TableHead className="h-7">Total</TableHead>
                        <TableHead className="h-7">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className='border-2 border-blue-300'>
                        <TableCell></TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            name="name"
                            value={newItem.name}
                            onChange={handleNewItemChange}
                            placeholder="Enter Item name"
                            className="h-7 text-sm w-40"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            name="quantity"
                            value={newItem.quantity}
                            onChange={handleNewItemChange}
                            placeholder="0"
                            className="h-7 text-sm w-20"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            name="unitPrice"
                            value={newItem.unitPrice}
                            onChange={handleNewItemChange}
                            placeholder="0.00"
                            className="h-7 text-sm w-24"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            name="discount"
                            value={newItem.discount}
                            onChange={handleNewItemChange}
                            placeholder="0"
                            className="h-7 text-sm w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            name="tax"
                            value={newItem.tax}
                            onChange={handleNewItemChange}
                            placeholder="0"
                            className="h-7 text-sm w-20"
                          />
                        </TableCell>
                        <TableCell>
                          {newItem.quantity && newItem.unitPrice
                            ? `₹${newItem.total.toFixed(2)}`
                            : '₹0.00'}
                        </TableCell>
                        <TableCell>
                          <Button type="submit" size="icon" variant="outline" className="h-7 w-7 mr-1">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7" 
                            onClick={clearNewItem}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center text-gray-500">
                              <Package className="h-12 w-12 mb-2" />
                              <span>No items added yet.</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>{item.tax}%</TableCell>
                            <TableCell>₹{item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button size="icon" variant="outline" className="h-7 w-7 mr-1" onClick={() => editItem(item.id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-7 w-7"
                                onClick={() => deleteItem(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Information */}
          <Card className="w-1/4">
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Select onValueChange={handleSupplierChange}>
                  <SelectTrigger id="supplier-name">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierArray.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Phone Number"
                  value={supplierInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={supplierInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Supplier Address"
                  value={supplierInfo.address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals footer */}
        <Card className="mt-2 p-2 flex items-center">
          <CardContent className=" w-full p-2">
            <form className="grid grid-cols-4 gap-4 p-2" onSubmit={handleCreatePurchaseOrder}>
            <div className="grid col-span-3 grid-cols-6 gap-4">
              <LabeledInput label="Subtotal" value={`₹${totals.subtotal.toFixed(2)}`} readOnly className="w-full" />
              <LabeledInput label="Tax Total" value={`₹${totals.taxTotal.toFixed(2)}`} readOnly className="w-full" />
              <LabeledInput label="Discount Total" value={`₹${totals.discountTotal.toFixed(2)}`} readOnly className="w-full" />
              <LabeledInput label="Grand Total" value={`₹${totals.grandTotal.toFixed(2)}`} readOnly className="w-full font-bold" />
              <div className="relative">
                <LabeledInput
                  label="Amount Paying"
                  type="number"
                  value={amountPaying}
                  onChange={(e) => setAmountPaying(e.target.value)}
                  className="w-full"
                  placeholder="Type Amount"
                  required
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                  onClick={handlePayFullAmount}
                >
                  <CheckCircle className="h-4 w-4 hover:text-green-500" />
                </Button>
              </div>
              <LabeledInput label="Due Amount" value={`₹${totals.dueAmount.toFixed(2)}`} readOnly className="w-full font-bold text-red-500" />
              
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>Save Draft</Button>
              <Button className="bg-green-500 hover:bg-green-600" size="sm" type="submit" onClick={handleCreatePurchaseOrder}>
                Create Purchase Order
              </Button>
            </div> 
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
