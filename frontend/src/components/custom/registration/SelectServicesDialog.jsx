import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Separator } from "../../ui/separator";
import { Input } from "../../ui/input";
import { Search, X } from "lucide-react";

const SelectServicesDialog = ({
  isOpen,
  onClose,
  services,
  selectedServices,
  onServicesChange,
}) => {
  const [localSelectedServices, setLocalSelectedServices] = useState(
    selectedServices.map((id) => {
      const service = services.find((s) => s._id === id);
      return {
        id: id,
        rate: service?.rate || 0,
      };
    })
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLocalSelectedServices(
      selectedServices.map((id) => {
        const service = services.find((s) => s._id === id);
        return {
          id: id,
          rate: service?.rate || 0,
        };
      })
    );
  }, [selectedServices, services]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aSelected = localSelectedServices.some((s) => s.id === a._id);
      const bSelected = localSelectedServices.some((s) => s.id === b._id);
      if (aSelected === bSelected) {
        return a.name.localeCompare(b.name);
      }
      return aSelected ? -1 : 1;
    });
  }, [services, localSelectedServices]);

  const filteredServices = useMemo(() => {
    return [...services].filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleCheckboxChange = useCallback((service) => {
    setLocalSelectedServices((prevSelected) => {
      if (prevSelected.some((s) => s.id === service._id)) {
        return prevSelected.filter((s) => s.id !== service._id);
      }
      return [...prevSelected, { id: service._id, rate: service.rate || 0 }];
    });
  }, []);

  const handleRateChange = useCallback((serviceId, newRate) => {
    setLocalSelectedServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, rate: Number(newRate) }
          : service
      )
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
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Select Services
          </DialogTitle>
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
                <TableHead className="text-right w-24">Rate</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="h-[50vh] pr-4">
            <Table>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No services found. Please add services in the{" "}
                        <b>Surgery Category</b> to the services list.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => {
                    const selectedService = localSelectedServices.find(
                      (s) => s.id === service._id
                    );
                    return (
                      <TableRow
                        key={service._id}
                        className={selectedService ? "bg-muted" : ""}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={!!selectedService}
                            onCheckedChange={() =>
                              handleCheckboxChange(service)
                            }
                            className="h-5 w-5"
                          />
                        </TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell className="hidden md:block">
                          {service.category}
                        </TableCell>
                        <TableCell className="text-right p-0">
                          {selectedService ? (
                            <input
                              type="number"
                              value={selectedService.rate}
                              onChange={(e) =>
                                handleRateChange(service._id, e.target.value)
                              }
                              className="w-24 text-right p-2 border-0 bg-transparent focus:outline-none focus:ring-0"
                            />
                          ) : (
                            <span className="px-4">{service.rate || 0}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <div className="text-right font-bold">
          Total: ₹
          {localSelectedServices
            .reduce((sum, service) => sum + (service.rate || 0), 0)
            .toLocaleString("en-IN")}
        </div>
        <Separator />
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
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
