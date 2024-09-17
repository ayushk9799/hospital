import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Label } from "../../ui/label";
import { ChevronRight } from "lucide-react";
import { BriefcaseMedicalIcon } from "lucide-react";
import { Plus, Pencil, Trash, Package, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, setCreateOrderStatus, fetchSuppliers, fetchSupplierDetails, clearSelectedSupplier } from '../../../redux/slices/pharmacySlice';
import { SearchSuggestion } from "../registration/CustomSearchSuggestion";

export default function Purchase() {
  const dispatch = useDispatch();
  const [supplierInfo, setSupplierInfo] = useState({ name: "", phone: "", email: "", address: "",});
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({id : '', name: '', type: '', quantity: '', MRP: '', discount: '', expiryDate: ''});
  const [amountPaying, setAmountPaying] = useState('');
  const { createOrderStatus, error, suppliers, suppliersStatus, selectedSupplier } = useSelector(state => state.pharmacy);
  const [supplierName, setSupplierName] = useState("");
  const [itemSuggestions, setItemSuggestions] = useState([]);

  useEffect(() => {
    if(suppliersStatus === 'idle'){
      dispatch(fetchSuppliers());
    }
  }, [dispatch, suppliersStatus]);

  useEffect(() => {
    if (selectedSupplier) {
      setSupplierInfo({
        name: selectedSupplier.name,
        phone: selectedSupplier.phone,
        email: selectedSupplier.email,
        address: selectedSupplier.address,
      });
      setItemSuggestions(selectedSupplier.items);
    }
  }, [selectedSupplier]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSupplierInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => {
      const updatedItem = { ...prev, [name]: value };
      
      // Calculate total if quantity and MRP are present
      if (updatedItem.quantity && updatedItem.MRP) {
        const quantity = parseFloat(updatedItem.quantity);
        const MRP = parseFloat(updatedItem.MRP);
        const discount = parseFloat(updatedItem.discount) || 0;

        const subtotal = quantity * MRP;
        const discountAmount = subtotal * (discount / 100);
        updatedItem.total = subtotal - discountAmount;
      } else {
        updatedItem.total = null;
      }
      return updatedItem;
    });
  };

  const handleTypeChange = (value) => {
    setNewItem(prev => ({...prev, type: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const addItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.MRP) {
      alert('Please fill in at least the item name, quantity, and MRP.');
      return;
    }

    const quantity = parseInt(newItem.quantity);
    const MRP = parseFloat(newItem.MRP);
    const discount = parseFloat(newItem.discount) || 0;

    const subtotal = quantity * MRP;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    const newItemWithId = {
      ...newItem,
      quantity,
      MRP,
      discount,
      total,
      expiryDate: newItem.expiryDate,
    };

    setItems(prev => [...prev, newItemWithId]);
    setNewItem({
      name: '',
      type: '',
      quantity: '',
      MRP: '',
      discount: '',
      expiryDate: '',
      id : ''
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
    setNewItem({ name: '', type: '', quantity: '', MRP: '', discount: '', expiryDate: '',});
  };

  const calculateTotals = () => {
    const totals = items.reduce((acc, item) => {
      const subtotal = item.quantity * item.MRP;
      const discountAmount = subtotal * (item.discount / 100);
      
      acc.subtotal += subtotal;
      acc.discountTotal += discountAmount;
      acc.grandTotal += subtotal - discountAmount;

      return acc;
    }, { subtotal: 0, discountTotal: 0, grandTotal: 0 });

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
    if(items.length === 0){
      alert('Please add at least one item to the purchase order.');
      return;
    }
    if(supplierInfo.name === '' || supplierInfo.phone === ''){
      alert('Please fill name and phone the supplier information.');
      return;
    }
    const orderData = {
      supplierInfo,
      items,
      total: {
        subtotal: totals.subtotal,
        totalAmount: totals.grandTotal,
        paidAmount: parseFloat(amountPaying) || 0,
      },
    };
    dispatch(createOrder(orderData));
  };

  useEffect(() => {
    if (createOrderStatus === 'succeeded') {
      alert('Purchase order created successfully!');
    } else if (createOrderStatus === 'failed') {
      alert(`Failed to create purchase order: ${error}`);
    }
    return () => {
      dispatch(setCreateOrderStatus('idle'));
    }
  }, [createOrderStatus, error]);

  const handlePayFullAmount = () => {
    setAmountPaying(totals.grandTotal.toFixed(2));
  };

  const handleSupplierSuggestionSelect = (suggestion) => {
    setItems([]);
    setNewItem({id : '', name: '', type: '', quantity: '', MRP: '', discount: '', expiryDate: '',})
    dispatch(fetchSupplierDetails(suggestion._id));
  };

  const handleItemSuggestionSelect = (suggestion) => {
    setNewItem(prev => ({
      ...prev,
      name: suggestion.name,
      type: suggestion.type,
      MRP: suggestion.MRP,
      id : suggestion._id,
    }));
  };

  const handleClearAll = () => {
    setSupplierInfo({ name: "", phone: "", email: "", address: "" });
    setItems([]);
    setNewItem({id: '', name: '', type: '', quantity: '', MRP: '', discount: '', expiryDate: ''});
    setAmountPaying('');
    setSupplierName("");
    dispatch(clearSelectedSupplier());
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 space-x-1 bg-gray-100">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <BriefcaseMedicalIcon className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="font-semibold text-gray-700 text-sm">
              Purchase Order
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAll} className="whitespace-nowrap">Clear All</Button>
        </div>

        <div className="flex space-x-2 h-[calc(100vh-245px)]">
          {/* Purchase Order Details and Item Table */}
          <div className="w-3/4 space-y-4 h-full">
            {/* Item Table */}
            <Card className="h-full">
              <CardContent className="px-4 pt-2">
                <form onSubmit={handleSubmit}>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className='bg-blue-200 border-2 border-blue-300 hover:bg-blue-200'>
                        <TableHead className="h-7">Sr.</TableHead>
                        <TableHead className="h-7 ">Item Name</TableHead>
                        <TableHead className="h-7">Type</TableHead>
                        <TableHead className="h-7">Quantity</TableHead>
                        <TableHead className="h-7">MRP</TableHead>
                        <TableHead className="h-7">Disc (%)</TableHead>
                        <TableHead className="h-7">Expiry Date</TableHead>
                        <TableHead className="h-7">Total</TableHead>
                        <TableHead className="h-7">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className='border-2 border-blue-300'>
                        <TableCell></TableCell>
                        <TableCell className="w-40">
                          <SearchSuggestion
                            suggestions={itemSuggestions}
                            placeholder="Enter Item name"
                            value={newItem.name}
                            setValue={(value) => setNewItem(prev => ({ ...prev, name: value }))}
                            onSuggestionSelect={handleItemSuggestionSelect}
                          />
                        </TableCell>
                        <TableCell>
                          <Select name="type" value={newItem.type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-7 text-sm w-28">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tablet">Tablet</SelectItem>
                              <SelectItem value="Capsule">Capsule</SelectItem>
                              <SelectItem value="Injection">Injection</SelectItem>
                              <SelectItem value="syrup">Syrup</SelectItem>
                              <SelectItem value="Liquid">Liquid</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                            name="MRP"
                            value={newItem.MRP}
                            onChange={handleNewItemChange}
                            placeholder="0.00"
                            className="h-7 text-sm w-20"
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
                          <Input type="month" size="sm" name="expiryDate" value={newItem.expiryDate} onChange={handleNewItemChange} className="h-7 text-sm w-25" />
                        </TableCell>
                        <TableCell className="w-20">
                          {newItem.quantity && newItem.MRP ? `₹${newItem.total.toFixed(2)}` : '₹0.00'}
                        </TableCell>
                        <TableCell>
                          <Button type="submit" size="icon" variant="outline" className="h-7 w-7 mr-1">
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
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.MRP.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>{item.expiryDate}</TableCell>
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
            </Card>
          </div>

          {/* Supplier Information */}
          <div className="w-1/4 space-y-2">
            <Card className="flex-grow">
              <CardHeader className="pb-2">
                <CardTitle className="p-0 font-semibold">Search Supplier</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <SearchSuggestion 
                  suggestions={suppliers} 
                  placeholder="Enter Supplier name"
                  value={supplierName}
                  setValue={setSupplierName}
                  onSuggestionSelect={handleSupplierSuggestionSelect}
                />
              </CardContent>
            </Card>
            <Card className='h-[calc(100vh-340px)]'>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Supplier Name" value={supplierInfo.name} onChange={handleInputChange}/>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Phone Number" value={supplierInfo.phone} onChange={handleInputChange}/>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Email Address" value={supplierInfo.email} onChange={handleInputChange}/>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Supplier Address" value={supplierInfo.address} onChange={handleInputChange}/>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Totals footer */}
        <Card className="mt-2 p-2 flex items-center">
          <CardContent className=" w-full p-2">
            <form className="grid grid-cols-4 gap-4 p-2" onSubmit={handleCreatePurchaseOrder}>
            <div className="grid col-span-3 grid-cols-5 gap-4">
              <LabeledInput label="Subtotal" value={`₹${totals.subtotal.toFixed(2)}`} readOnly className="w-full" />
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
                <Button type="button"  size="icon" variant="ghost"  className="absolute right-0 top-1/2 transform -translate-y-1/2" onClick={handlePayFullAmount}>
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
    <label className="absolute text-xs text-gray-500 top-1 left-2">{label}</label>
  </div>
);
