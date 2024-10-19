import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { CalendarDays, Phone, Plus, Trash2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { format } from "date-fns";

export default function OPDProcedure() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', quantity: 1, rate: 0, category: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!patient) {
      // Fetch patient data if not available
      // This is a placeholder. Replace with actual API call.
    }
  }, [patient, patientId]);

  const handleAddService = (e) => {
    e.preventDefault();
    if (newService.name && newService.rate > 0) {
      setServices([...services, { ...newService, id: Date.now(), total: newService.quantity * newService.rate }]);
      setNewService({ name: '', quantity: 1, rate: 0, category: '' });
    }
  };

  const handleRemoveService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  const calculateTotals = useMemo(() => {
    const subtotal = services.reduce((total, service) => total + (service.quantity * service.rate), 0);
    return {
      subtotal,
      totalAmount: subtotal,
    };
  }, [services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const servicesBill = {
      services,
      totalAmount: calculateTotals.totalAmount,
      subtotal: calculateTotals.subtotal,
      patientType: 'OPD',
      patient: patientId,
      patientInfo: {
        name: patient.name,
        phone: patient.contactNumber
      }
    };
    
    // Submit the servicesBill to your API
    console.log('Submitting service bill:', servicesBill);
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle response here
    }, 2000);
  };

  const handleGoBack = () => {
    navigate(-1);
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
              <Input
                id="serviceName"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                placeholder="Enter service name"
                required
              />
            </div>
            <div className="col-span-full sm:col-span-1 md:col-span-3 lg:col-span-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="quantity" className="hidden sm:block">Quantity *</Label>
                  <Input
                    type="number"
                    id="quantity"
                    value={newService.quantity}
                    onChange={(e) => setNewService({...newService, quantity: parseInt(e.target.value)})}
                    placeholder="Qty *"
                    required
                    min="1"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="rate" className="hidden sm:block">Rate</Label>
                  <Input
                    type="number"
                    id="rate"
                    value={newService.rate}
                    onChange={(e) => setNewService({...newService, rate: parseFloat(e.target.value)})}
                    placeholder="Rate"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="category" className="hidden sm:block">Category</Label>
                  <Input
                    id="category"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    placeholder="Category"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-full sm:col-span-1 flex items-center justify-center mt-2 sm:mt-0">
              <Button type="submit" variant="outline" size="sm" className="h-8 w-full sm:w-8 sm:p-0 mr-2">
                <Plus className="h-4 w-4 sm:inline" />
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-8 sm:p-0"
                onClick={() => setNewService({ name: '', quantity: 1, rate: 0, category: '' })}
              >
                <Trash2 className="h-4 w-4 sm:inline" />
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </form>
          <Separator className="my-2" />
          <h3 className="font-semibold text-lg mb-2">Added Services</h3>
          {services.length > 0 ? (
            <div className="sm:hidden">
              {services.map((service, index) => (
                <Card key={service.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{service.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Category: {service.category}</div>
                      <div>Quantity: {service.quantity}</div>
                      <div>Rate: ₹{service.rate.toLocaleString("en-IN")}</div>
                      <div>Total: ₹{(service.quantity * service.rate).toLocaleString("en-IN")}</div>
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
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={service.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{service.quantity}</TableCell>
                      <TableCell>{service.rate.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{(service.quantity * service.rate).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
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
            onClick={() => setServices([])} 
            disabled={isLoading} 
            className="w-1/2 sm:w-auto mr-2 sm:mr-0"
          >
            Reset
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="w-1/2 sm:w-auto"
          >
            {isLoading ? (
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
