import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "../components/ui/button";
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
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { CalendarDays, Phone, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Pencil } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { format } from "date-fns";
import { fetchServices, createService } from "../redux/slices/serviceSlice";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import { createOPDProcedureBill } from "../redux/slices/BillingSlice";

export default function OPDProcedure() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const patient = location.state?.patient;
  const [addedServices, setAddedServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', quantity: 1, rate: "", total: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [serviceName, setServiceName] = useState("");

  const { services, servicesStatus } = useSelector((state) => state.services);
  const { createOPDProcedureBillStatus } = useSelector((state) => state.bills);

  useEffect(() => {
    if (servicesStatus === "idle") dispatch(fetchServices());
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    if (!patient) {
      // Fetch patient data if not available
      // This is a placeholder. Replace with actual API call.
    }
  }, [patient, patientId]);

  const handleAddService = (e) => {
    e.preventDefault();
    console.log(newService);
    if (newService.name && newService.rate > 0) {
      setAddedServices([...addedServices, { 
        ...newService, 
        id: Date.now(), 
        total: newService.total
      }]);
      setNewService({ name: '', quantity: 1, rate: 0, total: 0 });
      setServiceName("");
    }
  };

  const handleRemoveService = (id) => {
    setAddedServices(addedServices.filter(service => service.id !== id));
  };

  const handleEditService = (id) => {
    const serviceToEdit = addedServices.find((service) => service.id === id);
    if (serviceToEdit) {
      setNewService({
        name: serviceToEdit.name,
        quantity: serviceToEdit.quantity,
        rate: serviceToEdit.rate,
        total: serviceToEdit.total,
      });
      setServiceName(serviceToEdit.name);
      setAddedServices((prev) => prev.filter((service) => service.id !== id));
    }
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0;
    setNewService(prev => ({
      ...prev,
      quantity,
      total: quantity * prev.rate
    }));
  };

  const handleRateChange = (e) => {
    const rate = parseFloat(e.target.value) || 0;
    setNewService(prev => ({
      ...prev,
      rate,
      total: prev.quantity * rate
    }));
  };

  const handleTotalChange = (e) => {
    const total = parseFloat(e.target.value) || 0;
    setNewService(prev => ({
      ...prev,
      total
    }));
  };

  const calculateTotals = useMemo(() => {
    const subtotal = addedServices.reduce((total, service) => total + service.total , 0);
    return {
      subtotal,
      totalAmount: subtotal,
    };
  }, [addedServices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const opdProcedureBill = {
      services: addedServices.map(service => ({
        name: service.name,
        quantity: service.quantity,
        rate: service.rate,
        total: service.total
      })),
      totalAmount: calculateTotals.totalAmount,
      subtotal: calculateTotals.subtotal,
      patient: patientId,
      patientInfo: {
        name: patient.name,
        phone: patient.contactNumber
      },
    
    };
    
    try {
      const resultAction = await dispatch(createOPDProcedureBill(opdProcedureBill));
      if (createOPDProcedureBill.fulfilled.match(resultAction)) {
        console.log('OPD Procedure bill created successfully:', resultAction.payload);
        setAddedServices([]);
        // Optionally, show a success message to the user or navigate to a success page
        navigate('/billings'); // Adjust this route as needed
      } else if (createOPDProcedureBill.rejected.match(resultAction)) {
        console.error('Failed to create OPD Procedure bill:', resultAction.error);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('An error occurred:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }

    console.log(opdProcedureBill);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleServiceSuggestionSelect = (suggestion) => {
    setNewService((prev) => ({
      ...prev,
      name: suggestion.name,
      rate: suggestion.rate,
      total: suggestion.rate*prev.quantity
    }));
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="w-full mx-auto p-2 space-y-4">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2" />
        <h1 className="text-lg font-bold">Add OPD Procedure</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{patient.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{patient.gender}</Badge>
                  <Badge variant="outline">{patient.age} yrs</Badge>
                  {patient.bloodGroup && <Badge variant="outline">{patient.bloodGroup}</Badge>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>{patient.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patient.contactNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end mb-4">
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
            <div>
              <Label htmlFor="quantity" className="hidden sm:block">Quantity *</Label>
              <Input
                type="number"
                id="quantity"
                value={newService.quantity}
                onChange={handleQuantityChange}
                placeholder="Qty *"
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="rate" className="hidden sm:block">Rate</Label>
              <Input
                type="number"
                id="rate"
                value={newService.rate}
                onChange={handleRateChange}
                placeholder="Rate"
                required
                min="0"
                step="1"
              />
            </div>
            <div>
              <Label htmlFor="total" className="hidden sm:block">Total</Label>
              <Input
                type="number"
                id="total"
                value={newService.total}
                onChange={handleTotalChange}
                placeholder="Total"
                step="1"
              />
            </div>
            <div className="col-span-full sm:col-span-1 flex items-center justify-center mt-2 sm:mt-0">
              <Button type="submit" variant="outline" size="sm" className="h-8 w-full sm:w-auto sm:px-3 mr-2">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-8 sm:p-0"
                onClick={() => setNewService({ name: '', quantity: 1, rate: "", total: "" })}
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
              {addedServices.map((service) => (
                <Card key={service.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{service.name}</span>
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
                      <div>Quantity: {service.quantity}</div>
                      <div>Rate: ₹{service.rate.toLocaleString("en-IN")}</div>
                      <div className="col-span-2 font-semibold">Total: ₹{service.total.toLocaleString("en-IN")}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
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
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.quantity}</TableCell>
                      <TableCell>{service.rate.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{(service.total).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
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
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center space-x-2">
                <Label>Subtotal:</Label>
                <span>₹{calculateTotals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Total:</Label>
                <span className="text-xl font-bold">₹{calculateTotals.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
        <div className="flex w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setAddedServices([])} 
            disabled={isLoading} 
            className="w-1/2 sm:w-auto mr-2 sm:mr-0"
          >
            Reset
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createOPDProcedureBillStatus === "loading"} 
            className="w-1/2 sm:w-auto"
          >
            {createOPDProcedureBillStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Bill"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
