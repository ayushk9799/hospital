import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItems,
  createSalesBill,
  fetchSalesBills,
} from "../../../../redux/slices/pharmacySlice";
import {
  fetchPatients,
  setSelectedPatient,
} from "../../../../redux/slices/patientSlice";
import { Button } from "../../../ui/button";
import { ScrollArea } from "../../../ui/scroll-area";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { Plus, Pencil, Trash, Package } from "lucide-react";
import { SearchSuggestion } from "../../registration/CustomSearchSuggestion";
import { useToast } from "../../../../hooks/use-toast";
import ViewBillDialog from "../reports/ViewBillDialog";
import MedicineSuggDialog from "./MedicineSuggDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { useMediaQuery } from "../../../../hooks/use-media-query";
import { Separator } from "../../../ui/separator";

export default function SalesMain({
  clearTrigger,
  shouldOpenMedicineSuggDialog,
  setShouldOpenMedicineSuggDialog,
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    items: sampleItems,
    itemsStatus,
    createSalesBillStatus,
    error,
    salesBills,
    salesBillsStatus,
  } = useSelector((state) => state.pharmacy);
  const {
    patientlist,
    status: patientsStatus,
    selectedPatient,
  } = useSelector((state) => state.patients);
  const [itemName, setItemName] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    _id: "",
    type: "",
  });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    quantity: "",
    mrp: "",
    discount: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("");
  const [patientName, setPatientName] = useState("");
  const itemNameInputRef = useRef(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false);
  const [isMedicineSuggDialogOpen, setIsMedicineSuggDialogOpen] =
    useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // patient list modified for search suggestion
  const patientListModified = useMemo(() => {
    return patientlist.map((patient) => ({
      _id: patient._id,
      patientId: patient.patient._id,
      name: patient.patient.name,
      phone: patient.patient.contactNumber,
      gender: patient.patient.gender,
      medications: patient.medications,
      type: patient.type,
    }));
  }, [patientlist]);

  // fetch items from backend
  useEffect(() => {
    if (itemsStatus === "idle") dispatch(fetchItems());
    if (salesBillsStatus === "idle") dispatch(fetchSalesBills());
    if (patientsStatus === "idle") dispatch(fetchPatients());
  }, [dispatch, itemsStatus, salesBillsStatus, patientsStatus]);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  // handle input change in customer info
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [id]: value }));
  };

  // handle item suggestion select
  const handleItemSuggestionSelect = (suggestion) => {
    setNewItem((prev) => ({
      ...prev,
      mrp: suggestion.MRP,
      id: suggestion._id,
    }));
  };

  // handle new item change
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => {
      const updatedItem = { ...prev, [name]: value };

      if (updatedItem.quantity && updatedItem.mrp) {
        const quantity = parseFloat(updatedItem.quantity);
        const mrp = parseFloat(updatedItem.mrp);
        const discount = parseFloat(updatedItem.discount) || 0;

        updatedItem.total = quantity * mrp * (1 - discount / 100);
      } else {
        updatedItem.total = null;
      }
      return updatedItem;
    });
  };

  // handle item name change in search suggestion
  useEffect(() => {
    if (itemName) {
      setNewItem((prev) => ({ ...prev, name: itemName }));
    }
  }, [itemName]);

  // handle add item in table
  const handleAddItemInTable = (e) => {
    e.preventDefault();
    const quantity = parseInt(newItem.quantity);
    const mrp = parseFloat(newItem.mrp);
    const discount = parseFloat(newItem.discount) || 0;

    const subtotal = quantity * mrp;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    const newItemWithId = { ...newItem, quantity, mrp, discount, total };

    setItems((prev) => [...prev, newItemWithId]);
    setNewItem({ name: "", quantity: "", mrp: "", discount: "", id: "" });
    setItemName("");

    // Focus on the item name input after adding an item
    if (itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  };

  // handle delete item from table
  const deleteItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // handle edit item from table
  const editItem = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    deleteItem(id);
    setNewItem(itemToEdit);
    setItemName(itemToEdit.name);
  };

  // clear new item
  const clearNewItem = () => {
    setNewItem({ name: "", quantity: "", mrp: "", discount: "" });
    setItemName("");
  };

  // calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const additionalDiscountAmount = subtotal * (additionalDiscount / 100);
    return { subtotal, totalAmount: subtotal - additionalDiscountAmount };
  }, [items, additionalDiscount]);

  const handleSaveDraft = () => {};

  // handle create sales order sending data to backend
  const handleCreateSalesOrder = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({
        title: "Please add items to create a sales order",
      });
      return;
    }
    if (paymentMethod === "") {
      toast({ title: "Please select payment method" });
      return;
    }
    if (paymentMethod === "Due" && buyerName === "") {
      toast({ title: "Please enter buyer name" });
      return;
    }
    
    // Check if customer name is empty
    if (customerInfo.name.trim() === "") {
      setIsAlertDialogOpen(true);
      return;
    }
    
    createSalesOrder();
  };

  // Add this new function to create the sales order
  const createSalesOrder = () => {
    const itemsArray = items.map((item) => ({
      item: item.id,
      quantity: item.quantity,
      MRP: item.mrp,
      discount: item.discount,
    }));
    let billInfo = {};
    if (customerInfo._id !== "") {
      billInfo = { _id: customerInfo?._id, type: customerInfo?.type };
    }
    const patientInfo = {
      items: itemsArray,
      patientInfo: { name: customerInfo?.name===""? "Unknown": customerInfo.name, phone: customerInfo.phone },
      billInfo,
      totals,
      paymentMethod,
      buyerName,
    };
    dispatch(createSalesBill(patientInfo))
      .unwrap()
      .then(() => {
        clearAllFields();
        toast({
          title: "Sales order created successfully!",
          variant: "success",
          description: "You can print the bill by clicking on recent bills",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to create sales order",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleAdditionalDiscountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAdditionalDiscount(Math.min(Math.max(value, 0), 100));
    } else {
      setAdditionalDiscount("");
    }
  };

  const handlePatientSuggestionSelect = (suggestion) => {
    setCustomerInfo({
      name: suggestion.name,
      phone: suggestion.phone || "",
      _id: suggestion._id || "",
      type: suggestion.type || "",
    });
    // Find the full patient object from patientlist
    const fullPatient = patientlist.find((p) => p._id === suggestion._id);
    dispatch(setSelectedPatient(fullPatient));
    setShouldOpenMedicineSuggDialog(true);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsViewBillDialogOpen(true);
  };

  const handleConfirmedMedications = (confirmedMedications) => {
    const newItems = confirmedMedications
      .map((med) => {
        const item = sampleItems.find((item) => item.name === med.name);
        if (item) {
          return {
            id: item._id,
            name: item.name,
            quantity: parseInt(med.quantity),
            mrp: parseFloat(item.MRP),
            discount: 0,
            total: parseFloat(item.MRP) * parseInt(med.quantity),
          };
        }
      })
      .filter((item) => item !== undefined);
    setItems((prev) => [...prev, ...newItems]);
    dispatch(setSelectedPatient(null)); // Clear selected patient after handling
  };

  useEffect(() => {
    clearAllFields();
  }, [clearTrigger]);

  const clearAllFields = () => {
    setCustomerInfo({ name: "", phone: "", _id: "", type: "" });
    setItems([]);
    setNewItem({ id: "", name: "", quantity: "", mrp: "", discount: "" });
    setPaymentMethod("");
    setBuyerName("");
    setAdditionalDiscount("");
    setPatientName("");
    setItemName("");
  };

  useEffect(() => {
    if (selectedPatient && shouldOpenMedicineSuggDialog) {
      setCustomerInfo({
        name: selectedPatient.patient.name,
        phone: selectedPatient.patient.contactNumber || "",
        _id: selectedPatient._id || "",
        type: selectedPatient.type || "",
      });
      setIsMedicineSuggDialogOpen(true);
      setShouldOpenMedicineSuggDialog(false);
    }
  }, [selectedPatient, shouldOpenMedicineSuggDialog]);

  // Add this function to handle the confirmation from the alert dialog
  const handleAlertDialogConfirm = () => {
    setCustomerInfo(prev => ({ ...prev, name: "Unknown" }));
    setIsAlertDialogOpen(false);
    createSalesOrder();
  };

  return (
    <div className="flex flex-col px-2 md:px-0">
      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Customer Information - Moved to the top */}
        {!isDesktop && (
          <div className="w-full mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-semibold">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter Customer name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                  />
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
              </CardContent>
            </Card>
          </div>
        )}

        <div className={`${isDesktop ? 'flex space-x-2' : 'space-y-4'} md:h-[70vh]overflow-hidden`}>
          {/* Sales Order Details and Item List */}
          <div className={isDesktop ? "w-3/4" : "w-full"}>
            {/* Item List */}
            <Card className="h-full pt-2">
              <ScrollArea className={isDesktop ? "h-[calc(100vh-235px)]" : ""}>
                <CardContent className="px-4 h-full">
                  <form onSubmit={handleAddItemInTable} className="h-full">
                    {isDesktop ? (
                      // Desktop view: Table
                      <Table className="w-full h-full">
                        <TableHeader>
                          <TableRow className="bg-blue-200 border-2 border-blue-300 hover:bg-blue-200">
                            <TableHead className="h-7 hidden lg:table-cell">Sr.</TableHead>
                            <TableHead className="h-7">Item Name</TableHead>
                            <TableHead className="h-7">Quantity</TableHead>
                            <TableHead className="h-7">MRP</TableHead>
                            <TableHead className="h-7 hidden lg:table-cell">Discount (%)</TableHead>
                            <TableHead className="h-7">Total</TableHead>
                            <TableHead className="h-7">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-2 border-blue-300 overflow-visible">
                            <TableCell className="hidden lg:table-cell"></TableCell>
                            <TableCell className="overflow-visible">
                              <SearchSuggestion
                                suggestions={sampleItems}
                                placeholder="Enter Item name"
                                value={itemName}
                                setValue={setItemName}
                                ref={itemNameInputRef}
                                showStock={true}
                                onSuggestionSelect={handleItemSuggestionSelect}
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
                            <TableCell className="hidden lg:table-cell">
                              <Input
                                type="number"
                                name="discount"
                                value={newItem.discount}
                                onChange={handleNewItemChange}
                                placeholder="0"
                                className="h-7 text-sm w-20"
                              />
                            </TableCell>
                            <TableCell className="w-20">
                              {newItem.quantity && newItem.mrp
                                ? `₹${newItem.total.toLocaleString()}`
                                : "₹0.00"}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="submit"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 mr-1"
                              >
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
                                <TableCell>₹{item.total.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 mr-1"
                                    onClick={() => editItem(item.id)}
                                  >
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
                          <TableRow
                            style={{
                              height: `${250 - items.length * 40}px`,
                              display: items.length <= 5 ? "block" : "none",
                            }}
                            className="w-full"
                          ></TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      // Mobile view: Cards
                      <div className="space-y-4">
                        {/* New Item Form */}
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <SearchSuggestion
                                suggestions={sampleItems}
                                placeholder="Enter Item name"
                                value={itemName}
                                setValue={setItemName}
                                ref={itemNameInputRef}
                                showStock={true}
                                onSuggestionSelect={handleItemSuggestionSelect}
                              />
                              <div className="flex gap-2"> 
                                <Input
                                  type="number"
                                  name="quantity"
                                  value={newItem.quantity}
                                  onChange={handleNewItemChange}
                                  placeholder="Quantity"
                                  className="w-full"
                                  required
                                />
                                <Input
                                  type="number"
                                  name="mrp"
                                  value={newItem.mrp}
                                  onChange={handleNewItemChange}
                                  placeholder="MRP"
                                  className="w-full"
                                  required
                                />
                                <Input
                                  type="number"
                                    name="discount"
                                    value={newItem.discount}
                                    onChange={handleNewItemChange}
                                    placeholder="Dis(%)"
                                    className="w-full"
                                  />
                                </div>
                              <div className="flex justify-between items-center">
                                <span>Total: ₹{newItem.total ? newItem.total.toLocaleString() : '0.00'}</span>
                                <Button type="submit" size="sm">
                                  Add Item
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Separator className="my-2" />
                        <h1 className="text-lg font-semibold">Items Added:</h1>
                        {/* Item Cards */}
                        {items.length === 0 ? (
                          <Card className="py-8">
                            <CardContent className="flex flex-col items-center text-gray-500">
                              <Package className="h-12 w-12 mb-2" />
                              <span>No items added yet.</span>
                            </CardContent>
                          </Card>
                        ) : (
                          items.map((item, index) => (
                            <Card key={item.id}>
                              <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-5 px-4">
                                <div className="grid grid-cols-2 gap-2 col-span-4">
                                  <div>Qty: {item.quantity}</div>
                                  <div>MRP: ₹{item.mrp.toFixed(2)}</div>
                                  <div>Dis: {item.discount}%</div>
                                  <div>Total: ₹{item.total.toFixed(2)}</div>
                                </div>
                                <div className="w-full flex flex-col items-end">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => editItem(item.id)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </form>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Desktop Customer Information */}
          {isDesktop && (
            <div className="w-1/4">
              {/* Desktop layout for customer info */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="p-0 font-semibold">
                    Search Patients
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <SearchSuggestion
                    suggestions={patientListModified}
                    placeholder="Enter patient name or mobile"
                    value={patientName}
                    setValue={setPatientName}
                    onSuggestionSelect={handlePatientSuggestionSelect}
                  />
                </CardContent>
              </Card>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="font-semibold">
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter Customer name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                    />
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
                </CardContent>
              </Card>
              
              <Card >
                <CardHeader className="pb-2">
                  <CardTitle className="font-semibold">Recent Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="p-0 space-y-0">
                      <TableRow >
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesBills.slice(0, 3).map((bill) => (
                        <TableRow
                          key={bill._id}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleViewBill(bill)}
                        >
                          <TableCell>{bill.patientInfo.name}</TableCell>
                          <TableCell>₹{bill.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Totals footer */}
        <Card className="mt-2">
          <CardContent className="p-2">
            <form
              className={`grid ${isDesktop ? 'grid-cols-4' : 'grid-cols-1'} gap-4 p-2`}
              onSubmit={handleCreateSalesOrder}
            >
              <div className={`grid ${isDesktop ? 'col-span-3 grid-cols-4' : 'grid-cols-1'} gap-4`}>
                <div className="h-full flex items-center">
                  <Select
                    onValueChange={handlePaymentMethodChange}
                    value={paymentMethod}
                    className="w-full h-full"
                  >
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Due">Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LabeledInput
                  label="Buyer Name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full"
                  placeholder="Enter buyer name"
                />
                {isDesktop ? (
                  <>
                    <LabeledInput
                      label="Additional Discount (%)"
                      value={additionalDiscount}
                      onChange={handleAdditionalDiscountChange}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full"
                      placeholder="0"
                      suffix="%"
                      min="0"
                      max="100"
                    />
                    <LabeledInput
                      label="Total"
                      value={`₹${totals.totalAmount.toFixed(2)}`}
                      readOnly
                      className="w-full"
                    />
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <LabeledInput
                      label="Additional Disc (%)"
                      value={additionalDiscount}
                      onChange={handleAdditionalDiscountChange}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full"
                      placeholder="0"
                      suffix="%"
                      min="0"
                      max="100"
                    />
                    <LabeledInput
                      label="Total"
                      value={`₹${totals.totalAmount.toFixed(2)}`}
                      readOnly
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-4 items-center`}>
                <Button variant="outline" size="sm" className="hidden md:block" onClick={handleSaveDraft} disabled={true}>
                  Save Draft
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  size="sm"
                  type="submit"
                  disabled={createSalesBillStatus === "loading"}
                >
                  {createSalesBillStatus === "loading"
                    ? "Creating..."
                    : "Create Sales Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Add ViewBillDialog component */}
      <ViewBillDialog
        isOpen={isViewBillDialogOpen}
        setIsOpen={setIsViewBillDialogOpen}
        billData={selectedBill}
      />
      <MedicineSuggDialog
        isOpen={isMedicineSuggDialogOpen}
        setIsOpen={setIsMedicineSuggDialogOpen}
        selectedPatient={selectedPatient}
        onConfirm={handleConfirmedMedications}
      />
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Unknown Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              The customer name is empty. Do you want to create an unknown sale?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAlertDialogConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// input field with label for input box table
const LabeledInput = React.memo(
  ({
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
  )
);
