import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../ui/button";
import { ScrollArea } from "../../../ui/scroll-area";
import { Input } from "../../../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { Plus, Pencil, Trash, Package, Search } from "lucide-react";
import {sampleItems} from '../Demo'
import { SearchSuggestion } from "../../registration/CustomSearchSuggestion";

const customerArray = [
  {
    id: "1",
    name: "John Doe",
    contactNumber: "1234567890",
  },
  {
    id: "2",
    name: "Jane Smith",
    contactNumber: "9876543210",
  },
  {
    id: "3",
    name: "Bob Johnson",
    contactNumber: "5555555555",
  },
];

// input field with label for input box table
const LabeledInput = ({
  label,
  value,
  readOnly = false,
  onChange,
  className = "",
  type = "text",
  placeholder = "",
  required = false,
  suffix = "",
  onFocus,
  min,
  max,
}) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      onFocus={onFocus}
      className={`pl-2 pr-8 pt-4 pb-1 w-full text-sm border rounded ${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
    />
    <label className="absolute text-xs text-gray-500 top-1 left-2">
      {label}
    </label>
    {suffix && (
      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
        {suffix}
      </span>
    )}
  </div>
);

export default function SalesMain() {
  const [itemID, setItemID] = useState(1);
  const [itemName, setItemName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ phone: "" });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", mrp: "", discount: "", tax: "", });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("");

  const itemNameInputRef = useRef(null);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerInfo({
        phone: selectedCustomer.contactNumber || "",
      });
    }
  }, [selectedCustomer]);

  const handleCustomerChange = (value) => {
    const customer = customerArray.find((c) => c.id === value);
    setSelectedCustomer(customer);
  };

  // customer info input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [id]: value }));
  };

  // Add this function to handle suggestion selection
  const handleItemSuggestionSelect = (suggestion) => {
    setNewItem((prev) => ({ ...prev, mrp: suggestion.MRP }));
  };

  
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => {
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

  // item name change in search suggestion
  useEffect(() => {
    if (itemName) {
      setNewItem((prev) => ({ ...prev, name: itemName }));
    }
  }, [itemName]);

  // add item to table-->when form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  // add item to table-->when form is submitted-
  const addItem = () => {
    const quantity = parseFloat(newItem.quantity);
    const mrp = parseFloat(newItem.mrp);
    const discount = parseFloat(newItem.discount) || 0;
    const tax = parseFloat(newItem.tax) || 0;

    const subtotal = quantity * mrp;
    const discountAmount = subtotal * (discount / 100);
    const taxAmount = (subtotal - discountAmount) * (tax / 100);
    const total = subtotal - discountAmount + taxAmount;

    const newItemWithId = { id: itemID, ...newItem, quantity, mrp, discount, tax, total};

    setItems((prev) => [...prev, newItemWithId]);
    setItemID((prev) => prev + 1);
    setNewItem({ name: "", quantity: "", mrp: "", discount: "", tax: ""});
    setItemName("");

    // Focus on the item name input after adding an item
    if (itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  };

  const deleteItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const editItem = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    deleteItem(id);
    setNewItem(itemToEdit);
    setItemName(itemToEdit.name);
  };

  const clearNewItem = () => {
    setNewItem({ name: "", quantity: "", mrp: "", discount: "", tax: "", });
    setItemName("");
  };

  const calculateTotals = () => {
    const totals = items.reduce(
      (acc, item) => {
        const subtotal = item.quantity * item.mrp;
        const discountAmount = subtotal * (item.discount / 100);

        acc.subtotal += subtotal;
        acc.discountTotal += discountAmount;

        return acc;
      },
      { subtotal: 0, discountTotal: 0 }
    );

    const additionalDiscountAmount =
      totals.subtotal *
      ((additionalDiscount === "" ? 0 : additionalDiscount) / 100);
    totals.finalTotal =
      totals.subtotal - totals.discountTotal - additionalDiscountAmount;
    return totals;
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
    console.log("Creating sales order...", {
      items,
      customerInfo,
      totals,
      paymentMethod,
      buyerName,
    });
    // You might want to send this data to your backend to create the order
  };

  const handleAdditionalDiscountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAdditionalDiscount(Math.min(Math.max(value, 0), 100));
    } else {
      setAdditionalDiscount("");
    }
  };

  const handleAdditionalDiscountFocus = (e) => {
    e.target.select();
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex space-x-2 h-[calc(100vh-220px)]">
          {/* Sales Order Details and Item Table */}
          
          <div className="w-3/4 space-y-2 h-full">
            {/* Item Table */}
            <Card className="h-full pt-2">
             <ScrollArea className="h-[calc(100vh-235px)]">
              <CardContent className="px-4 h-full">
                <form onSubmit={handleSubmit} className="h-full">
                  <Table className="w-full h-full ">
                    <TableHeader>
                      <TableRow className=" bg-blue-200 border-2 border-blue-300 hover:bg-blue-200">
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
                      <TableRow className="border-2 border-blue-300 overflow-visible ">
                        <TableCell></TableCell>
                        <TableCell className="overflow-visible">
                          <SearchSuggestion suggestions={sampleItems} placeholder="Enter Item name" value={itemName} setValue={setItemName} ref={itemNameInputRef} onSuggestionSelect={handleItemSuggestionSelect}/>
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
                          <Input type="number" name="tax" value={newItem.tax} onChange={handleNewItemChange} placeholder="0" className="h-7 text-sm w-20" />
                        </TableCell>
                        <TableCell className='w-20'>
                          {newItem.quantity && newItem.mrp ? `₹${newItem.total.toFixed(2)}` : "₹0.00"}
                        </TableCell>
                        <TableCell>
                          <Button type="submit" size="icon" variant="outline" className="h-7 w-7 mr-1" >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="outline" className="h-7 w-7" onClick={clearNewItem}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {items.length === 0 ? (
                        <TableRow className="hover:bg-white border-b-0">
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
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => deleteItem(item.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      <TableRow style ={{height:`${250 - items.length*40}px`, display: items.length <= 5 ? 'block' : 'none'}} className="w-full"></TableRow>
                    </TableBody>
                  </Table>
                </form>
              </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Customer Information at footer */}
          <div className="w-1/4 space-y-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="p-0 font-semibold ">Search Patients</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="flex space-x-2">
                        <Input className="h-7" placeholder="Enter patient name or mobile"/>
                        <Button size="icon" variant="outline" className="h-7 w-7" >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader >
                <CardTitle className="font-semibold">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <SearchSuggestion suggestions={customerArray} placeholder="Enter Customer name" value={selectedCustomer} setValue={setSelectedCustomer}/>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Phone Number" value={customerInfo.phone} onChange={handleInputChange}/>
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-semibold">Recent Bills</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient Name</TableHead>
                                <TableHead>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>John Doe</TableCell>
                                <TableCell>₹100</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>John Doe</TableCell>
                                <TableCell>₹100</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>John Doe</TableCell>
                                <TableCell>₹100</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>John Doe</TableCell>
                                <TableCell>₹100</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Totals footer */}
        <Card className="mt-2 flex items-center">
          <CardContent className=" w-full p-2">
            <form className="grid grid-cols-4 gap-4 p-2" onSubmit={handleCreateSalesOrder}>
              <div className="grid col-span-3 grid-cols-4 gap-4">
                <div className="h-full">
                  <Select onValueChange={handlePaymentMethodChange} value={paymentMethod} className="w-full h-full">
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LabeledInput label="Buyer Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full" placeholder="Enter buyer name"/>
                <LabeledInput
                  label="Additional Discount (%)"
                  value={additionalDiscount}
                  onChange={handleAdditionalDiscountChange}
                  onFocus={handleAdditionalDiscountFocus}
                  className="w-full"
                  placeholder="0"
                  suffix="%"
                  min="0"
                  max="100"
                />
                <LabeledInput label="Total" value={`₹${totals.finalTotal.toFixed(2)}`} readOnly className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
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
