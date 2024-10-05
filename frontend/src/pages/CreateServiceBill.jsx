import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Pencil, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { fetchServices } from '../redux/slices/serviceSlice';
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import { createBill, setCreateBillStatusIdle, updateBill } from '../redux/slices/BillingSlice';
import { useToast } from '../hooks/use-toast';
import { setSelectedPatientForBill } from '../redux/slices/patientSlice';
import { CalendarDays, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import { format } from 'date-fns';
const CreateServiceBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { billId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const selectedPatient = useSelector((state) => state.patients.selectedPatient);
  const patientDetails = selectedPatient?.patient;
  const { services, servicesStatus } = useSelector((state) => state.services);
  const createBillStatus = useSelector((state) => state.bills.createBillStatus);
  const updateBillStatus = useSelector((state) => state.bills.updateBillStatus);
  const [addedServices, setAddedServices] = useState([]);
  const [newService, setNewService] = useState({ serviceName: '', quantity: '', rate: '', total: '', category: '' });
  const [serviceName, setServiceName] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState('');
  const [additionalDiscountType, setAdditionalDiscountType] = useState('amount');
  const [isEditing, setIsEditing] = useState(false);

  const calculateTotals = useMemo(() => {
    const subtotal = addedServices.reduce((sum, service) => sum + service.total, 0);
    let discountValue = 0;

    if (additionalDiscount !== '') {
      if (additionalDiscountType === 'amount') {
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
      totalAmount: totalAmount
    };
  }, [addedServices, additionalDiscount, additionalDiscountType]);

  useEffect(() => {
    if (servicesStatus === 'idle') dispatch(fetchServices());
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    if (billId && location.state?.billData) {
      setIsEditing(true);
      const billData = location.state.billData;
      // Populate form with bill data
      setAddedServices(billData.services.map((service, index) => ({
        id: index + 1,
        service: service.name,
        category: service.category,
        quantity: service.quantity,
        rate: service.rate,
        total: service.rate * service.quantity,
      })));
      setAdditionalDiscount(billData.additionalDiscount || '');
      dispatch(setSelectedPatientForBill(billData.patient));
    }
  }, [billId, location.state]);

  useEffect(() => {
    if (createBillStatus === 'succeeded') {
      toast({ 
        variant: "success",
        title: "Bill created successfully",
        description: "The bill has been successfully created.",
      });
      dispatch(setCreateBillStatusIdle());
      navigate('/billings');
    } else if (createBillStatus === 'failed') {
      toast({
        title: "Error creating bill",
        description: "There was an error creating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [createBillStatus, dispatch, toast, navigate]);

  useEffect(() => {
    if (updateBillStatus === 'succeeded') {
      toast({ 
        variant: "success",
        title: "Bill updated successfully",
        description: "The bill has been successfully updated.",
      });
      dispatch(setCreateBillStatusIdle());
      navigate('/billings');
    } else if (updateBillStatus === 'failed') {
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
    setNewService(prev => {
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
      setNewService(prev => ({ ...prev, serviceName }));
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
      total: totalValue
    };
    
    setAddedServices(prev => [...prev, newServiceWithoutDiscount]);
    setNewService({ serviceName: '', quantity: '', rate: '', total: '', category: '' });
    setServiceName('');
  };

  const handleRemoveService = (id) => {
    setAddedServices(prev => prev.filter(service => service.id !== id));
  };

  const handleServiceSuggestionSelect = (suggestion) => {
    setNewService(prev => ({
      ...prev,
      serviceName: suggestion.name,
      rate: suggestion.rate,
      total: suggestion.rate,
      category: suggestion.category,
      quantity: 1
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
    
    // Convert percentage to amount if necessary
    if (additionalDiscountType === 'percentage') {
      additionalDiscountAmount = (additionalDiscountAmount / 100) * calculateTotals.subtotal;
    }

    const billData = {
      services: addedServices.map(service => ({
        name: service.service,
        quantity: service.quantity,
        rate: service.rate,
        discount: service.discAmt,
        category: service.category
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
        additionalDiscount: additionalDiscountAmount
      },
      visitID: selectedPatient?._id
    };

    if (isEditing) {
      dispatch(updateBill({ billId, billData }));
    } else {
      dispatch(createBill(billData));
    }
  };

  const handleSaveToDraft = () => {
    // Implement the save to draft functionality here
    console.log("Save to Draft button clicked");
  };

  const handleReset = () => {
    setAddedServices([]);
    setNewService({ serviceName: '', quantity: '', rate: '', total: '', category: '' });
    setServiceName('');
    setAdditionalDiscount('');
    setAdditionalDiscountType('amount');
  };

  if (!selectedPatient) {
    return <div>No patient selected</div>;
  }

  const handleEditService = (id) => {
    const serviceToEdit = addedServices.find(service => service.id === id);
    if (serviceToEdit) {
      setNewService({
        serviceName: serviceToEdit.service,
        quantity: serviceToEdit.quantity.toString(),
        rate: serviceToEdit.rate.toString(),
        total: serviceToEdit.total.toString(),
        category: serviceToEdit.category
      });
      setServiceName(serviceToEdit.service);
      setAddedServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const isLoading = createBillStatus === 'loading' || updateBillStatus === 'loading';

  return (
    <div className="w-full mx-auto p-2 space-y-2">
      <div className="flex items-center cursor-pointer" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2" />
        <h1 className="text-lg font-bold">{isEditing ? 'Edit Bill' : 'Add Bill'}</h1>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patientDetails?.name}`} alt={patientDetails?.name} />
              <AvatarFallback>{patientDetails?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{patientDetails?.name}</h2>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{patientDetails?.gender}</Badge>
                <Badge variant="outline">{patientDetails?.age} yrs</Badge>
                {patientDetails?.bloodGroup && <Badge variant="outline">{patientDetails.bloodGroup}</Badge>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{selectedPatient?.bookingDate ? format(selectedPatient?.bookingDate, 'MMM dd, hh:mm a') : 'N/A'}</span>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 min-h-[430px]">
        
        <form onSubmit={handleAddService} className="grid grid-cols-6 gap-4 items-end mb-4">
            <div className="col-span-2">
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
              <Label htmlFor="quantity">Quantity *</Label>
              <Input type="number" id="quantity" name="quantity" placeholder="Quantity" value={newService.quantity} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="rate">Rate</Label>
              <Input type="number" id="rate" name="rate" placeholder="Rate" value={newService.rate} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="total">Total *</Label>
              <Input type="number" id="total" name="total" placeholder="Total" value={newService.total} onChange={handleInputChange} required />
            </div>
            <div className='flex items-center justify-center'>
              <Button type="submit" variant="outline" size="sm" className="h-8 w-8 p-0 mr-2" >
                <Plus className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 mr-2" onClick={() => setNewService({ serviceName: '', quantity: '', rate: '', total: '', category: '' })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <Separator className='my-2' />
          <h3 className="font-semibold text-lg mb-2">Added Service</h3>
          {addedServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Service Category</TableHead>
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
                    <TableCell>{service.rate.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{service.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 mr-2" onClick={() => handleEditService(service.id)}>
                        <span className="sr-only">Edit</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleRemoveService(service.id)}>
                        <span className="sr-only">Remove</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p>No services added yet. Please add a service above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Label htmlFor="additionalDiscountType">Additional Discount Type:</Label>
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
            <Label htmlFor="additionalDiscount">Additional Discount:</Label>
            <Input
              id="additionalDiscount"
              type="text"
              placeholder={additionalDiscountType === 'amount' ? '0.00' : '0%'}
              value={additionalDiscount}
              onChange={(e) => setAdditionalDiscount(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <Label>Subtotal:</Label>
              <span>₹{calculateTotals.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Total Amount:</Label>
              <span className="text-xl font-bold">₹{calculateTotals.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New buttons */}
      <div className="flex justify-end space-x-4 mt-4">
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          Reset
        </Button>
        <Button variant="outline" onClick={handleSaveToDraft} disabled={isLoading}>
          Save to Draft
        </Button>
        <Button onClick={handleCreate} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Bill' : 'Create Bill'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateServiceBill;