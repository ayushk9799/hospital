import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  PrinterIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { fetchServices } from "../redux/slices/serviceSlice";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import {
  createBill,
  setCreateBillStatusIdle,
  updateBill,
} from "../redux/slices/BillingSlice";
import { useToast } from "../hooks/use-toast";
import { setSelectedPatientForBill } from "../redux/slices/patientSlice";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "../components/ui/scroll-area";
import OPDBillTokenModal from "../components/custom/registration/OPDBillTokenModal";
import ViewBillDialog from "../components/custom/billing/ViewBillDialog";
import { ConsoleLogEntry } from "selenium-webdriver/bidi/logEntries";

const CreateServiceBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { billId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const selectedPatient = useSelector(
    (state) => state.patients.selectedPatient
  );
  const patientDetails = selectedPatient?.patient;
  const { services, servicesStatus } = useSelector((state) => state.services);
  const createBillStatus = useSelector((state) => state.bills.createBillStatus);
  const updateBillStatus = useSelector((state) => state.bills.updateBillStatus);
  const [addedServices, setAddedServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    quantity: "",
    rate: "",
    total: "",
    category: "",
  });
  const [serviceName, setServiceName] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("");
  const [additionalDiscountType, setAdditionalDiscountType] =
    useState("amount");
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [billData, setBillData] = useState(null);
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const calculateTotals = useMemo(() => {
    // Calculate subtotal from current added services
    const currentServicesSubtotal = addedServices.reduce(
      (sum, service) => sum + service.total,
      0
    );

    // Get existing bill subtotal if editing
    const existingBillSubtotal = location.state?.billData?.subtotal || 0;
console.log(existingBillSubtotal)
    // Combine subtotals
    const subtotal = currentServicesSubtotal + existingBillSubtotal;

    let discountValue = 0;

    if (additionalDiscount !== "") {
      if (additionalDiscountType === "amount") {
        discountValue = parseFloat(additionalDiscount);
      } else {
        discountValue = (parseFloat(additionalDiscount) / 100) * subtotal;
      }
    }

    const discountedSubtotal = Math.max(subtotal - discountValue, 0);
    const totalAmount = discountedSubtotal;

    return {
      subtotal,
      additionalDiscount: discountValue.toFixed(2),
      totalAmount: totalAmount,
      existingBillSubtotal,
      currentServicesSubtotal
    };
  }, [addedServices, additionalDiscount, additionalDiscountType, location.state?.billData]);

  useEffect(() => {
    if (servicesStatus === "idle") dispatch(fetchServices());
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    if (billId && location.state?.billData) {
      setIsEditing(true);
      const billData = location.state.billData;
      
      // Populate form with bill data
      setAddedServices(
        billData.services.map((service, index) => ({
          id: index + 1,
          service: service.name,
          category: service.category,
          quantity: service.quantity,
          rate: service.rate,
          total: service.rate * service.quantity,
          isExisting: true // Flag to identify existing services
        }))
      );
      setAdditionalDiscount(billData.additionalDiscount || "");
      dispatch(setSelectedPatientForBill(billData.patient));
    }
  }, [billId, location.state]);

  useEffect(() => {
    if (createBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill created successfully",
        description: "The bill has been successfully created.",
      });
      
      // If patient type is OPD, show print modal
      if (selectedPatient?.type === "OPD") {
        setBillData({
          patient: patientDetails,
          bill: {
            _id: Date.now().toString(), // Temporary ID until you get the actual bill ID
            services: addedServices.map(service => ({
              name: service.service,
              quantity: service.quantity,
              rate: service.rate
            })),
            createdAt: new Date(),
            subtotal: calculateTotals.subtotal,
            additionalDiscount: calculateTotals.additionalDiscount,
            totalAmount: calculateTotals.totalAmount,
            amountPaid: calculateTotals.totalAmount // Assuming full payment
          },
          payment: {
            paymentMethod: "Cash" // You might want to add payment method selection
          }
        });
        setIsPrintModalOpen(true);
      }

      dispatch(setCreateBillStatusIdle());
      navigate("/billings");
    } else if (createBillStatus === "failed") {
      toast({
        title: "Error creating bill",
        description: "There was an error creating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [createBillStatus, dispatch, toast, navigate]);

  useEffect(() => {
    if (updateBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill updated successfully",
        description: "The bill has been successfully updated.",
      });
      dispatch(setCreateBillStatusIdle());
      navigate("/billings");
    } else if (updateBillStatus === "failed") {
      toast({
        title: "Error updating bill",
        description: "There was an error updating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [updateBillStatus, dispatch, toast, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => {
      const updatedItem = { ...prev, [name]: value };
      if (updatedItem.quantity && updatedItem.rate) {
        const quantity = parseInt(updatedItem.quantity);
        const rate = parseFloat(updatedItem.rate);
        updatedItem.total = quantity * rate;
      }
      return updatedItem;
    });
  };

  useEffect(() => {
    if (serviceName) {
      setNewService((prev) => ({ ...prev, serviceName }));
    }
  }, [serviceName]);

  const handleAddService = (e) => {
    e.preventDefault();

    const totalValue = parseFloat(newService.total);
    const quantityValue = parseFloat(newService.quantity);

    const newServiceWithoutDiscount = {
      id: addedServices.length + 1,
      service: newService.serviceName,
      category: newService.category || "Not specified",
      quantity: quantityValue,
      rate: totalValue / quantityValue,
      total: totalValue,
    };

    setAddedServices((prev) => [...prev, newServiceWithoutDiscount]);
    setNewService({
      serviceName: "",
      quantity: "",
      rate: "",
      total: "",
      category: "",
    });
    setServiceName("");
  };

  const handleRemoveService = (id) => {
    setAddedServices((prev) => prev.filter((service) => service.id !== id));
  };

  const handleServiceSuggestionSelect = (suggestion) => {
    setNewService((prev) => ({
      ...prev,
      serviceName: suggestion.name,
      rate: suggestion.rate,
      total: suggestion.rate,
      category: suggestion.category,
      quantity: 1,
    }));
  };

  // Create bill data sending to backend
  const handleCreate = () => {
    if (addedServices.length === 0) {
      toast({
        title: "No services added",
        description:
          "Please add at least one service before creating the bill.",
        variant: "destructive",
      });
      return;
    }

    let additionalDiscountAmount = parseFloat(additionalDiscount) || 0;

    // Convert percentage to amount if necessary
    if (additionalDiscountType === "percentage") {
      additionalDiscountAmount =
        (additionalDiscountAmount / 100) * calculateTotals.subtotal;
    }

    const billData = {
      services: addedServices.map((service) => ({
        name: service.service,
        quantity: service.quantity,
        rate: service.rate,
        discount: service.discAmt,
        category: service.category,
        isExisting: service.isExisting || false
      })),
      patient: selectedPatient.patient._id,
      patientType: selectedPatient.type,
      patientInfo: {
        name: selectedPatient.patient.name,
        phone: selectedPatient.patient.contactNumber,
      },
      totals: {
        totalAmount: calculateTotals.totalAmount,
        subtotal: calculateTotals.subtotal,
        additionalDiscount: additionalDiscountAmount,
        existingBillSubtotal: calculateTotals.existingBillSubtotal,
        currentServicesSubtotal: calculateTotals.currentServicesSubtotal
      },
      visitID: selectedPatient?._id,
    };

    if (isEditing) {
      dispatch(updateBill({ billId, billData }));
    } else {
      dispatch(createBill(billData));
    }
  };

  const handleSaveToDraft = () => {
    // Implement the save to draft functionality here
  };

  const handleReset = () => {
    setAddedServices([]);
    setNewService({
      serviceName: "",
      quantity: "",
      rate: "",
      total: "",
      category: "",
    });
    setServiceName("");
    setAdditionalDiscount("");
    setAdditionalDiscountType("amount");
  };

  const handleEditService = (id) => {
    const serviceToEdit = addedServices.find((service) => service.id === id);
    if (serviceToEdit) {
      setNewService({
        serviceName: serviceToEdit.service,
        quantity: serviceToEdit.quantity.toString(),
        rate: serviceToEdit.rate.toString(),
        total: serviceToEdit.total.toString(),
        category: serviceToEdit.category,
      });
      setServiceName(serviceToEdit.service);
      setAddedServices((prev) => prev.filter((service) => service.id !== id));
    }
  };

  const handlePrintBill = () => {
    // Common bill data
    const commonBillData = {
      _id: Date.now().toString(),
      services: addedServices.map(service => ({
        name: service.service,
        quantity: service.quantity,
        rate: Number(service.rate)
      })),
      createdAt: new Date(),
      totalAmount: Number(calculateTotals.totalAmount),
      additionalDiscount: Number(calculateTotals.additionalDiscount || 0),
      amountPaid: Number(calculateTotals.totalAmount),
      payments: [{
        amount: Number(calculateTotals.totalAmount),
        paymentMethod: "Cash",
        createdAt: new Date()
      }]
    };

    if (selectedPatient?.type === "OPD") {
      // Format for OPDBillTokenModal
      const opdBillData = {
        patient: {
          name: patientDetails?.name,
          age: patientDetails?.age,
          gender: patientDetails?.gender,
          contactNumber: patientDetails?.contactNumber
        },
        bill: {
          ...commonBillData,
          subtotal: calculateTotals.subtotal
        },
        payment: {
          paymentMethod: "Cash"
        }
      };
      setBillData(opdBillData);
      setIsPrintModalOpen(true);
    } else {
      // Format for ViewBillDialog
      const viewBillData = {
        ...commonBillData,
        patientInfo: {
          name: patientDetails?.name
        },
        subtotal: calculateTotals.subtotal
      };
      setBillData(viewBillData);
      setIsViewBillDialogOpen(true);
    }
  };

  const isLoading =
    createBillStatus === "loading" || updateBillStatus === "loading";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedServices(addedServices.map(service => service.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (id) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        return prev.filter(serviceId => serviceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="w-full space-y-2">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2" />
        <h1 className="text-lg font-bold">
          {isEditing ? "Edit Bill" : "Add Bill"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${patientDetails?.name}`}
                  alt={patientDetails?.name}
                />
                <AvatarFallback>{patientDetails?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{patientDetails?.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{patientDetails?.gender}</Badge>
                  <Badge variant="outline">{patientDetails?.age} yrs</Badge>
                  {patientDetails?.bloodGroup && (
                    <Badge variant="outline">{patientDetails.bloodGroup}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>
                  {selectedPatient?.bookingDate
                    ? format(selectedPatient?.bookingDate, "MMM dd, hh:mm a")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patientDetails?.contactNumber}</span>
              </div>
              {selectedPatient?.registrationNumber && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Reg:{selectedPatient?.registrationNumber}</span>
                </div>
              )}
              {patientDetails?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{patientDetails.address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={handleAddService}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end mb-4"
          >
            <div className="col-span-full sm:col-span-1 md:col-span-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <SearchSuggestion
                suggestions={services}
                placeholder="Enter service name"
                value={serviceName}
                setValue={setServiceName}
                onSuggestionSelect={handleServiceSuggestionSelect}
              />
            </div>
            <div className="col-span-full sm:col-span-1 md:col-span-3 lg:col-span-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="quantity" className="hidden sm:block">Quantity *</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="Qty *"
                    value={newService.quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="rate" className="hidden sm:block">Rate</Label>
                  <Input
                    type="number"
                    id="rate"
                    name="rate"
                    placeholder="Rate"
                    value={newService.rate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="total" className="hidden sm:block">Total *</Label>
                  <Input
                    type="number"
                    id="total"
                    name="total"
                    placeholder="Total *"
                    value={newService.total}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-full sm:col-span-1 flex items-center justify-center mt-2 sm:mt-0">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-8 sm:p-0 mr-2"
              >
                <Plus className="h-4 w-4 sm:inline" />
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-8 sm:p-0"
                onClick={() =>
                  setNewService({
                    serviceName: "",
                    quantity: "",
                    rate: "",
                    total: "",
                    category: "",
                  })
                }
              >
                <Trash2 className="h-4 w-4 sm:inline" />
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </form>
          <Separator className="my-2" />
          <h3 className="font-semibold text-lg mb-2">Added Services</h3>
          {addedServices.length > 0 ? (
            <div className="sm:hidden">
              {addedServices.map((service, index) => (
                <Card key={service.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{service.service}</span>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 mr-2"
                          onClick={() => handleEditService(service.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Category: {service.category}</div>
                      <div>Quantity: {service.quantity}</div>
                      <div>Rate: {service.rate.toLocaleString("en-IN")}</div>
                      <div>Total: ₹{service.total.toLocaleString("en-IN")}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex md:hidden flex-col items-center justify-center h-[200px] text-gray-500">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p>No services added yet. Please add a service above.</p>
            </div>
          )}
          <div className="hidden sm:block">
            <ScrollArea className="h-[300px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedServices.map((service, index) => (
                    <TableRow key={service.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{service.service}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{service.quantity}</TableCell>
                      <TableCell>
                        {service.rate.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {service.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 mr-2"
                          onClick={() => handleEditService(service.id)}
                        >
                          <span className="sr-only">Edit</span>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <span className="sr-only">Remove</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
              <Label htmlFor="additionalDiscountType">
                Additional Discount:
              </Label>
              <div className="flex items-center space-x-2">
                <Select
                  id="additionalDiscountType"
                  value={additionalDiscountType}
                  onValueChange={(value) => setAdditionalDiscountType(value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="additionalDiscount"
                  type="text"
                  placeholder={additionalDiscountType === "amount" ? "0.00" : "0%"}
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center space-x-2">
                <Label>Subtotal:</Label>
                <span>
                  ₹
                  {calculateTotals.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Total:</Label>
                <span className="text-xl font-bold">
                  ₹
                  {calculateTotals.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
        <div className="flex w-full sm:w-auto gap-4">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={isLoading} 
            className="w-1/2 sm:w-auto"
          >
            Reset
          </Button>
          {addedServices.length > 0 && (
            <Button
              variant="outline"
              onClick={handlePrintBill}
              className="w-1/2 sm:w-auto"
            >
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
          )}
          <Button 
            onClick={handleCreate} 
            disabled={isLoading} 
            className="w-1/2 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Bill"
            ) : (
              "Create Bill"
            )}
          </Button>
        </div>
      </div>

      <OPDBillTokenModal 
        isOpen={isPrintModalOpen}
        setIsOpen={setIsPrintModalOpen}
        patientData={billData}
      />

      <ViewBillDialog
        isOpen={isViewBillDialogOpen}
        setIsOpen={setIsViewBillDialogOpen}
        billData={billData}
      />
    </div>
  );
};

export default CreateServiceBill;
