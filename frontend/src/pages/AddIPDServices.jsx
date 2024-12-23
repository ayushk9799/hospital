import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  PrinterIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { fetchServices } from "../redux/slices/serviceSlice";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import {
  createBill,
  setCreateBillStatusIdle,
  updateBill,
} from "../redux/slices/BillingSlice";
import { useToast } from "../hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import ViewBillDialog from "../components/custom/billing/ViewBillDialog";

export default function AddIPDServices() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { patientId } = useParams();

  const [patientData, setPatientData] = useState(
    location.state?.patientData || null
  );
  const [addedServices, setAddedServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    quantity: "",
    rate: "",
    total: "",
    category: "",
  });
  const [serviceName, setServiceName] = useState("");
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false);
  const [billDataForPrint, setBillDataForPrint] = useState(null);
  const [existingServices, setExistingServices] = useState([]);

  const { services, servicesStatus } = useSelector((state) => state.services);
  const createBillStatus = useSelector((state) => state.bills.createBillStatus);

  // Filter services to only show OPD Procedure category
  const filteredServices = services.filter(
    (service) => service.category === "OPD Procedure" && service.category !== "Surgery"
  );

  useEffect(() => {
    if (servicesStatus === "idle") {
      dispatch(fetchServices());
    }
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    const existingBillServices = location.state?.initialBillData?.services[0]?.services || [];
    setExistingServices(existingBillServices
      .filter(service => service.category !== "Surgery")
      .map((service, index) => ({
        id: `existing-${index}`,
        service: service.name,
        quantity: service.quantity,
        rate: service.rate,
        total: service.rate * service.quantity,
        category: service.category
      })));
  }, [location.state]);

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

  const handleAddService = (e) => {
    e.preventDefault();
    const newServiceItem = {
      id: addedServices.length + 1,
      service: newService.serviceName,
      category: newService.category || "OPD Procedure",
      quantity: parseInt(newService.quantity),
      rate: parseFloat(newService.rate),
      total: parseFloat(newService.total),
    };

    setAddedServices((prev) => [...prev, newServiceItem]);
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

  const calculateTotals = () => {
    const subtotal = addedServices.reduce(
      (sum, service) => sum + service.total,
      0
    );
    
    // Get existing bill data if available
    const existingBill = location.state?.initialBillData?.services[0] || {};
    // Calculate totals including existing bill data
    const existingSubtotal = existingBill.subtotal || 0;
    const existingDiscount = existingBill.additionalDiscount || 0;
    const existingAmountPaid = existingBill.amountPaid || 0;

    const totalSubtotal = subtotal + existingSubtotal;
    const totalDiscount = existingDiscount;
    const totalAmount = totalSubtotal - totalDiscount;
    const totalAmountPaid = existingAmountPaid;
    const balance = totalAmount - totalAmountPaid;

    return {
      subtotal: totalSubtotal,
      discount: totalDiscount,
      totalAmount,
      totalAmountPaid,
      balance,
      billId: existingBill._id,
    };
  };

  const handleCreate = () => {
    if (addedServices.length === 0) {
      toast({
        title: "No services added",
        description: "Please add at least one service before creating the bill.",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    const billData = {
      services: [
        ...existingServices
          .filter(service => service.category !== "Surgery")
          .map(service => ({
            name: service.service,
            quantity: service.quantity,
            rate: service.rate,
            category: service.category
          })),
        ...addedServices
          .map(service => ({
            name: service.service,
            quantity: service.quantity,
            rate: service.rate,
            category: service.category
          }))
      ],
      patient: patientData._id,
      patientType: patientData.type,
      patientInfo: {
        name: patientData.name,
        phone: patientData.contactNumber,
      },
      totals: {
        subtotal: totals.subtotal,
        additionalDiscount: totals.discount,
        totalAmount: totals.totalAmount,
        amountPaid: totals.totalAmountPaid,
      },
    };

    dispatch(updateBill({ billId: totals.billId, billData }))
      .unwrap()
      .then(() => {
        toast({
          variant: "success",
          title: "Services added successfully",
          description: "The services have been successfully added to the bill.",
        });
      })
      .catch((error) => {
        toast({
          title: "Error adding services",
          description: "There was an error adding the services. Please try again.",
          variant: "destructive",
        });
      });
  };

  if (!patientData) {
    return <div>No patient data available</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col gap-1">
      <div className="flex items-center mb-1">
        <div
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-2 w-4" />
          Back
        </div>
        <h2 className="text-lg font-bold ml-2">Add Services</h2>
      </div>

      <Card className="flex-shrink-0">
        <CardContent className="p-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${patientData.name}`}
                  alt={patientData.name}
                />
                <AvatarFallback>{patientData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{patientData.name}</h2>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="outline">{patientData.gender}</Badge>
                  <Badge variant="outline">{patientData.age} yrs</Badge>
                  <Badge variant="outline">
                    UHID No: {patientData.registrationNumber}
                  </Badge>
                  {patientData.ipdNumber && (
                    <Badge variant="outline">
                      IPD No: {patientData.ipdNumber}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className=" flex flex-col overflow-hidden">
        <CardContent className="p-2 flex flex-col h-full">
          <form
            onSubmit={handleAddService}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 items-end"
          >
            <div className="col-span-full sm:col-span-1 md:col-span-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <SearchSuggestion
                suggestions={filteredServices}
                placeholder="Enter service name"
                value={serviceName}
                setValue={setServiceName}
                onSuggestionSelect={handleServiceSuggestionSelect}
              />
            </div>
            <div className="col-span-full sm:col-span-1 md:col-span-3 lg:col-span-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newService.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    type="number"
                    id="rate"
                    name="rate"
                    value={newService.rate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total">Total</Label>
                  <Input
                    type="number"
                    id="total"
                    name="total"
                    value={newService.total}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-span-full sm:col-span-1">
              <Button type="submit" className="w-full">
                Add Service
              </Button>
            </div>
          </form>

          <Separator className="my-2" />

          <ScrollArea className="border rounded-md h-[290px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-auto">
                {/* Existing Services */}
                {existingServices.map((service) => (
                  <TableRow key={service.id} className="bg-muted/30">
                    <TableCell className="py-2">{service.service}</TableCell>
                    <TableCell className="py-2">{service.quantity}</TableCell>
                    <TableCell className="py-2">{service.rate}</TableCell>
                    <TableCell className="py-2">{service.total}</TableCell>
                    <TableCell className="text-right py-2">
                      <Badge variant="secondary">Existing</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Newly Added Services */}
                {addedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="py-2">{service.service}</TableCell>
                    <TableCell className="py-2">{service.quantity}</TableCell>
                    <TableCell className="py-2">{service.rate}</TableCell>
                    <TableCell className="py-2">{service.total}</TableCell>
                    <TableCell className="text-right py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <Card className="mt-2">
            <CardContent className="p-1">
              <div className="flex flex-col items-end space-y-0.5">
                {/* Subtotal */}
                <div className="flex justify-end w-48 items-center text-sm">
                  <span className="text-gray-600 mr-3">Subtotal:</span>
                  <div className="flex items-center">
                    <span className="mr-1">₹</span>
                    <Input
                      value={calculateTotals().subtotal.toFixed(2)}
                      className="w-20 h-7 text-right font-medium border-0 p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className="flex justify-end w-48 items-center text-sm">
                  <span className="text-gray-600 mr-3">Discount:</span>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-1">₹</span>
                    <Input
                      value={calculateTotals().discount.toFixed(2)}
                      className="w-20 h-7 text-right text-red-600 font-medium border-0 p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
                  <span className="font-medium mr-3">Net Total:</span>
                  <span className="font-medium">
                    ₹
                    {calculateTotals().totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Amount Paid */}
                <div className="flex justify-end w-48 items-center text-sm">
                  <span className="text-gray-600 mr-3">Paid:</span>
                  <span className="text-green-600 font-bold">
                    ₹
                    {calculateTotals().totalAmountPaid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Balance */}
                <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
                  <span className="text-gray-600 mr-3">Balance:</span>
                  <span className="text-red-600 font-bold">
                    ₹
                    {calculateTotals().balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={createBillStatus === "loading"}
        >
          {createBillStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Services...
            </>
          ) : (
            "Add Services"
          )}
        </Button>
      </div>

      <ViewBillDialog
        isOpen={isViewBillDialogOpen}
        setIsOpen={setIsViewBillDialogOpen}
        billData={billDataForPrint}
        onClose={() => setIsViewBillDialogOpen(false)}
      />
    </div>
  );
}
