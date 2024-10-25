import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { ScrollArea } from '../../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { useDispatch, useSelector } from 'react-redux';
import { updateServiceBillCollections, fetchTemplates } from '../../../redux/slices/templatesSlice';
import { Separator } from '../../ui/separator';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';

const ManageServicesDialog = ({ isOpen, onClose, services }) => {
  const [selectedServices, setSelectedServices] = useState([]); // Ensure this is always an array
  const [total, setTotal] = useState(0); // New state for total
  const [searchTerm, setSearchTerm] = useState(""); // New state for search
  const dispatch = useDispatch();
  const { serviceBillCollections, status } = useSelector((state) => state.templates);

  useEffect(() => {
    setSelectedServices(serviceBillCollections || []); // Ensure serviceBillCollections is an array
  }, [serviceBillCollections]);

  useEffect(()=>{
    if(status==="idle"){
      dispatch(fetchTemplates());
    }
  }, [dispatch, status]);

  useEffect(() => {
    const newTotal = services
      .filter(service => selectedServices.includes(service._id))
      .reduce((sum, service) => sum + service.rate, 0);
    setTotal(newTotal);
  }, [selectedServices, services]); // Update total when selectedServices or services change

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = useCallback((serviceId) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  }, []);

  const handleApply = useCallback(() => {
    dispatch(updateServiceBillCollections({ service_collections: selectedServices }));
    onClose();
  }, [dispatch, selectedServices, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-[500px] xl:max-w-[600px] rounded-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Manage Services</DialogTitle>
        </DialogHeader>
        <div className=" relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8 w-full"
          />
        </div>
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead className="hidden md:block">Category</TableHead> {/* New column for category */}
                <TableHead className="text-right pr-6">Rate</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="h-[50vh] pr-4 ">
            <Table>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedServices.includes(service._id)}
                        onCheckedChange={() => handleCheckboxChange(service._id)}
                        className="h-5 w-5"
                      />
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="hidden md:block">{service.category}</TableCell> {/* New cell for category */}
                    <TableCell className="text-right font-semibold">₹{service.rate.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <Separator/>
        <div className="text-right font-bold md:text-lg text-md">
          Total: ₹{total.toLocaleString('en-IN')}
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageServicesDialog;
