import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { updateServiceBillCollections, fetchTemplates } from '../../../redux/slices/templatesSlice';

const ManageServicesDialog = ({ isOpen, onClose, services }) => {
  const [selectedServices, setSelectedServices] = useState([]); // Ensure this is always an array
  const [total, setTotal] = useState(0); // New state for total
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
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-[500px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Manage Services</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {services.map((service) => (
            <div key={service._id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
              <Checkbox
                checked={selectedServices.includes(service._id)}
                onCheckedChange={() => handleCheckboxChange(service._id)}
                className="h-5 w-5"
              />
              <span className="flex-grow text-sm sm:text-base">{service.name}</span>
              <span className="text-sm sm:text-base font-semibold">₹{service.rate.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="text-right font-bold text-lg sm:text-xl mt-0">
          Total: ₹{total.toLocaleString('en-IN')}
        </div>
        <DialogFooter className="md:grid grid-cols-2 flex-col-reverse gap-2 mt-0">
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
