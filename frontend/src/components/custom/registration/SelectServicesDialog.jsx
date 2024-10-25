import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { ScrollArea } from '../../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Separator } from '../../ui/separator';
import { Input } from '../../ui/input';
import { Search, X } from 'lucide-react';

const SelectServicesDialog = ({ isOpen, onClose, services, selectedServices, onServicesChange }) => {
  const [localSelectedServices, setLocalSelectedServices] = useState(selectedServices);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLocalSelectedServices(selectedServices );
  }, [selectedServices]);


  useEffect(() => {
    const newTotal = services
      .filter(service => localSelectedServices.includes(service._id))
      .reduce((sum, service) => sum + service.rate, 0);
    setTotal(newTotal);
  }, [localSelectedServices, services]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aSelected = localSelectedServices.includes(a._id);
      const bSelected = localSelectedServices.includes(b._id);
      if (aSelected === bSelected) {
        return a.name.localeCompare(b.name);
      }
      return aSelected ? -1 : 1;
    });
  }, [services, localSelectedServices]);

  const filteredServices = useMemo(() => {
    return sortedServices.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedServices, searchTerm]);

  const handleCheckboxChange = useCallback((serviceId) => {
    setLocalSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  }, []);

  const handleApply = useCallback(() => {
    onServicesChange(localSelectedServices);
    onClose();
  }, [localSelectedServices, onServicesChange, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-[500px] xl:max-w-[600px] rounded-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Select Services</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8 pr-8 w-full"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead className="hidden md:block">Category</TableHead>
                <TableHead className="text-right pr-6">Rate</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="h-[50vh] pr-4">
            <Table>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow 
                    key={service._id}
                    className={localSelectedServices.includes(service._id) ? "bg-muted" : ""}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={localSelectedServices.includes(service._id)}
                        onCheckedChange={() => handleCheckboxChange(service._id)}
                        className="h-5 w-5"
                      />
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="hidden md:block">{service.category}</TableCell>
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
            Cancel
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectServicesDialog;
