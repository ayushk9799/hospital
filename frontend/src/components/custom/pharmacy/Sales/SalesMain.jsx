// use scroll area for item table, rupee symbol for amount paying

import React, { useState, useEffect } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { ChevronRight } from "lucide-react";
import { BriefcaseMedicalIcon } from "lucide-react";
import { Plus, Pencil, Trash, Package, CheckCircle } from 'lucide-react';

const customerArray = [
  { id: '1', name: 'John Doe', contactNumber: '1234567890', email: 'john@example.com', address: '123 Main St' },
  { id: '2', name: 'Jane Smith', contactNumber: '9876543210', email: 'jane@example.com', address: '456 Elm St' },
  { id: '3', name: 'Bob Johnson', contactNumber: '5555555555', email: 'bob@example.com', address: '789 Oak St' },
  // Add more customer objects as needed
];

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

export default function SalesMain() {
  const [itemID, setItemID] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    phone: "",
    email: "",
    address: "",
  });

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    mrp: '',
    discount: '',
    tax: '',
  });

  const [amountPaying, setAmountPaying] = useState('');

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerInfo({
        phone: selectedCustomer.contactNumber || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
      });
    }
  }, [selectedCustomer]);

  const handleCustomerChange = (value) => {
    const customer = customerArray.find((c) => c.id === value);
    setSelectedCustomer(customer);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => {
      const updatedItem = { ...prev, [name]: value };
      
      // Calculate total if quantity and mrp are present
      if (updatedItem.quantity && updatedItem.mrp) {
        const quantity = parseFloat(updatedItem.quantity);
        const mrp = parseFloat(updatedItem.mrp);
        const discount = parseFloat(updatedItem.discount) || 0;
        const tax = parseFloat(updatedItem.tax) || 0;

        const subtotal = quantity * mrp;
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
    if (!newItem.name || !newItem.quantity || !newItem.mrp) {
      alert('Please fill in at least the item name, quantity, and MRP.');
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const mrp = parseFloat(newItem.mrp);
    const discount = parseFloat(newItem.discount) || 0;
    const tax = parseFloat(newItem.tax) || 0;

    const subtotal = quantity * mrp;
    const discountAmount = subtotal * (discount / 100);
    const taxAmount = (subtotal - discountAmount) * (tax / 100);
    const total = subtotal - discountAmount + taxAmount;

    const newItemWithId = {
      id: itemID,
      ...newItem,
      quantity,
      mrp,
      discount,
      tax,
      total,
    };

    setItems(prev => [...prev, newItemWithId]);
    setItemID(prev => prev + 1);
    setNewItem({
      name: '',
      quantity: '',
      mrp: '',
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
      mrp: '',
      discount: '',
      tax: '',
    });
  };

  const calculateTotals = () => {
    const totals = items.reduce((acc, item) => {
      const subtotal = item.quantity * item.mrp;
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
    console.log("Saving draft...", { items, customerInfo, totals });
    // You might want to send this data to your backend or store it locally
  };

  const handleCreateSalesOrder = (e) => {
    e.preventDefault();
    // Implement logic to create the sales order
    console.log("Creating sales order...", { items, customerInfo, totals });
    // You might want to send this data to your backend to create the order
  };

  const handlePayFullAmount = () => {
    setAmountPaying(totals.grandTotal.toFixed(2));
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex-1">

        <div className="flex space-x-2 h-[calc(100vh-245px)]">
          {/* Sales Order Details and Item Table */}
          <div className="w-3/4 space-y-4 h-full">
            {/* Item Table */}
            <Card className="h-full">
              <CardHeader>
                {/* <CardTitle className="font-semibold">Sale Items</CardTitle> */}
              </CardHeader>
              <CardContent className="px-4">
                <form onSubmit={handleSubmit}>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className='bg-blue-200 border-2 border-blue-300 hover:bg-blue-200'>
                        <TableHead className="h-7">Sr.</TableHead>
                        <TableHead className="h-7 ">Item Name</TableHead>
                        <TableHead className="h-7">Quantity</TableHead>
                        <TableHead className="h-7">MRP</TableHead>
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
                            name="mrp"
                            value={newItem.mrp}
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
                          {newItem.quantity && newItem.mrp
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
                            <TableCell>₹{item.mrp.toFixed(2)}</TableCell>
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

          {/* Customer Information */}
          <Card className="w-1/4">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label htmlFor="customer-name">Customer Name</Label>
                <Select onValueChange={handleCustomerChange}>
                  <SelectTrigger id="customer-name">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerArray.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
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
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Customer Address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals footer */}
        <Card className="mt-2 p-2 flex items-center">
          <CardContent className=" w-full p-2">
            <form className="grid grid-cols-4 gap-4 p-2" onSubmit={handleCreateSalesOrder}>
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
              <Button className="bg-green-500 hover:bg-green-600" size="sm" type="submit">
                Create Sales Order
              </Button>
            </div> 
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
