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
  fetchBillById,
} from "../redux/slices/BillingSlice";
import { useToast } from "../hooks/use-toast";
import { setSelectedPatientForBill } from "../redux/slices/patientSlice";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "../components/ui/scroll-area";
import OPDBillTokenModal from "../components/custom/registration/OPDBillTokenModal";
import ViewBillDialog from "../components/custom/billing/ViewBillDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const CreateServiceBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { billId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const [billPatientDetails, setBillPatientDetails] = useState(null);

  const patientDetails = billPatientDetails;
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
    // Calculate total from all services (both existing and newly added)
    const subtotal = addedServices.reduce(
      (sum, service) => sum + service.total,
      0
    );

    let discountValue = 0;

    if (additionalDiscount !== "") {
      if (additionalDiscountType === "amount") {
        discountValue = parseFloat(additionalDiscount);
      } else {
        discountValue = (parseFloat(additionalDiscount) / 100) * subtotal;
      }
    }

    // Ensure discount doesn't exceed subtotal
    discountValue = Math.min(discountValue, subtotal);

    const totalAmount = subtotal - discountValue;

    return {
      subtotal,
      additionalDiscount: discountValue.toFixed(2),
      totalAmount,
      currentServicesSubtotal: subtotal, // This is now the same as subtotal since we're not separating them
    };
  }, [addedServices, additionalDiscount, additionalDiscountType]);

  useEffect(() => {
    if (servicesStatus === "idle") dispatch(fetchServices());
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    if (billId) {
      dispatch(fetchBillById(billId))
        .unwrap()
        .then((billData) => {
          setIsEditing(true);
          
          const services = billData.services.map((service, index) => ({
            id: index + 1,
            service: service.name,
            category: service.category,
            quantity: service.quantity,
            rate: service.rate,
            total: service.rate * service.quantity,
            isExisting: true,
          }));

          setAddedServices(services);
          setSelectedServices(services.map((service) => service.id));
          setAdditionalDiscount(billData.additionalDiscount || "");
          
          setBillPatientDetails({
            _id: billData.patient._id,
            name: billData.patientInfo.name,
            contactNumber: billData.patientInfo.phone,
            registrationNumber: billData.patient.registrationNumber,
            age: billData.patient.age,
            gender: billData.patient.gender,
            address: billData.patient.address,
            bloodGroup: billData.patient.bloodGroup,
            type: billData.patientType
          });
        })
        .catch((error) => {
          toast({
            title: "Error fetching bill",
            description: "Could not load the bill details. Please try again.",
            variant: "destructive",
          });
          navigate("/billings");
        });
    } else if (location.state?.billData) {
      let billData = location.state.billData;
      setIsEditing(true);
      
      const services = billData.services.map((service, index) => ({
        id: index + 1,
        service: service.name,
        category: service.category,
        quantity: service.quantity,
        rate: service.rate,
        total: service.rate * service.quantity,
        isExisting: true,
      }));

      setAddedServices(services);
      setSelectedServices(services.map((service) => service.id));
      setAdditionalDiscount(billData.additionalDiscount || "");
    }
  }, [billId, dispatch, location.state, navigate, toast]);

  useEffect(() => {
    if (createBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill created successfully",
        description: "The bill has been successfully created.",
      });

      // If patient type is OPD, show print modal
      if (patientDetails?.type === "OPD") {
        setBillData({
          patient: patientDetails,
          bill: {
            _id: Date.now().toString(),
            services: addedServices.map((service) => ({
              name: service.service,
              quantity: service.quantity,
              rate: service.rate,
            })),
            createdAt: new Date(),
            subtotal: calculateTotals.subtotal,
            additionalDiscount: calculateTotals.additionalDiscount,
            totalAmount: calculateTotals.totalAmount,
            amountPaid: calculateTotals.totalAmount,
          },
          payment: {
            paymentMethod: "Cash",
          },
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
  }, [createBillStatus, dispatch, toast, navigate, patientDetails, addedServices, calculateTotals]);

  useEffect(() => {
    if (updateBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill updated successfully",
        description: "The bill has been successfully updated.",
      });
      dispatch(setCreateBillStatusIdle());
      handlePrintBill();
    } else if (updateBillStatus === "failed") {
      toast({
        title: "Error updating bill",
        description: "There was an error updating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [updateBillStatus, dispatch, toast]);

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
    setSelectedServices((prev) => [...prev, newServiceWithoutDiscount.id]);

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
    setSelectedServices((prev) => prev.filter((serviceId) => serviceId !== id));
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
        description: "Please add at least one service before creating the bill.",
        variant: "destructive",
      });
      return;
    }

    let additionalDiscountAmount = parseFloat(additionalDiscount) || 0;

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
        isExisting: service.isExisting || false,
      })),
      patient: patientDetails._id,
      patientType: patientDetails.type,
      patientInfo: {
        name: patientDetails.name,
        phone: patientDetails.contactNumber,
      },
      totals: {
        totalAmount: calculateTotals.totalAmount,
        subtotal: calculateTotals.subtotal,
        additionalDiscount: additionalDiscountAmount,
        currentServicesSubtotal: calculateTotals.currentServicesSubtotal,
      },
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
    setSelectedServices([]);
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
    // Filter services based on selection
    const selectedServicesList = addedServices.filter((service) =>
      selectedServices.includes(service.id)
    );

    // Calculate totals for selected services only
    const selectedServicesTotal = selectedServicesList.reduce(
      (sum, service) => sum + service.total,
      0
    );

    // Common bill data with filtered services
    const commonBillData = {
      _id: Date.now().toString(),
      services: selectedServicesList.map((service) => ({
        name: service.service,
        quantity: service.quantity,
        rate: Number(service.rate),
      })),
      createdAt: new Date(),
      totalAmount: Number(selectedServicesTotal),
      additionalDiscount: Number(calculateTotals.additionalDiscount || 0),
      amountPaid: Number(selectedServicesTotal),
      payments: [
        {
          amount: Number(selectedServicesTotal),
          paymentMethod: "Cash",
          createdAt: new Date(),
        },
      ],
    };

    if (patientDetails?.type === "OPD") {
      // Format for OPDBillTokenModal
      const opdBillData = {
        patient: {
          name: patientDetails?.name,
          age: patientDetails?.age,
          gender: patientDetails?.gender,
          contactNumber: patientDetails?.contactNumber,
        },
        bill: {
          ...commonBillData,
          subtotal: selectedServicesTotal,
        },
        payment: {
          paymentMethod: "Cash",
        },
      };
      setBillData(opdBillData);
      setIsPrintModalOpen(true);
    } else {
      // Format for ViewBillDialog
      const viewBillData = {
        ...commonBillData,
        patientInfo: {
          name: patientDetails?.name,
        },
        subtotal: selectedServicesTotal,
      };
      setBillData(viewBillData);
      setIsViewBillDialogOpen(true);
    }
  };

  const isLoading =
    createBillStatus === "loading" || updateBillStatus === "loading";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedServices(addedServices.map((service) => service.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (id) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((serviceId) => serviceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="w-full space-y-2 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
      <div
        className="flex items-center cursor-pointer mb-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2" />
        <h1 className="text-lg font-bold">
          {isEditing ? "Edit Bill" : "Add Bill"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${patientDetails?.name}`}
                  alt={patientDetails?.name}
                />
                <AvatarFallback>
                  {patientDetails?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{patientDetails?.name}</h2>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="outline">{patientDetails?.gender}</Badge>
                  <Badge variant="outline">{patientDetails?.age} yrs</Badge>
                  {patientDetails?.bloodGroup && (
                    <Badge variant="outline">{patientDetails.bloodGroup}</Badge>
                  )}
                  {patientDetails?.registrationNumber && (
                    <Badge variant="outline">Reg: {patientDetails.registrationNumber}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>
                  {patientDetails?.bookingDate
                    ? format(patientDetails?.bookingDate, "MMM dd, hh:mm a")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patientDetails?.contactNumber}</span>
              </div>
             
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
        <CardContent className="p-3">
          <form
            onSubmit={handleAddService}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-end mb-2"
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
                  <Label htmlFor="quantity" className="hidden sm:block">
                    Quantity *
                  </Label>
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
                  <Label htmlFor="rate" className="hidden sm:block">
                    Rate
                  </Label>
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
                  <Label htmlFor="total" className="hidden sm:block">
                    Total *
                  </Label>
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
                className="h-8 w-full sm:w-auto sm:px-3 mr-2 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add</span>
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
          <h3 className="font-semibold text-lg mb-1">Added Services</h3>
          <div className="sm:hidden space-y-1">
            {addedServices.map((service) => (
              <Card key={service.id} className="mb-1">
                <CardContent className="p-2">
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
          <div className="hidden sm:block">
            <ScrollArea className="h-[250px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={
                          selectedServices.length === addedServices.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleSelectService(service.id)}
                        />
                      </TableCell>
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
        <CardContent className="p-3">
          <div className="flex md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mb-2 md:mb-0">
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
                  placeholder={
                    additionalDiscountType === "amount" ? "0.00" : "0%"
                  }
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end space-y-1">
              <div className="flex items-center space-x-2">
                <Label>Subtotal:</Label>
                <span>₹{calculateTotals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Total:</Label>
                <span className="text-xl font-bold">
                  ₹{calculateTotals.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
        <div className="flex w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="w-1/2 sm:w-auto"
          >
            Reset
          </Button>
          {addedServices.length > 0 && selectedServices.length > 0 && (
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
        services={addedServices}
        selectedServices={selectedServices}
        onSelectService={handleSelectService}
        onSelectAll={handleSelectAll}
        onClose={() => {
          setIsPrintModalOpen(false);
          navigate("/billings");
        }}
      />

      <ViewBillDialog
        isOpen={isViewBillDialogOpen}
        setIsOpen={setIsViewBillDialogOpen}
        billData={billData}
        services={addedServices}
        selectedServices={selectedServices}
        onSelectService={handleSelectService}
        onSelectAll={handleSelectAll}
        onClose={() => {
          setIsViewBillDialogOpen(false);
          navigate("/billings");
        }}
      />
    </div>
  );
};

export default CreateServiceBill;
