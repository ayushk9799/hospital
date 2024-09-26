import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Plus, ListFilter, FileDown, Pencil, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { 
  fetchServices, 
  deleteService, 
  setDeleteServiceStatusIdle, 
  setCreateServiceStatusIdle, 
  setUpdateServiceStatusIdle 
} from '../redux/slices/serviceSlice';
import AddServiceDialog from '../components/custom/services/AddServiceDialog';
import EditServiceDialog from '../components/custom/services/EditServiceDialog';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const Services = () => {
  const dispatch = useDispatch();
  const { services, servicesStatus, deleteServiceStatus, createServiceStatus, updateServiceStatus } = useSelector((state) => state.services);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (servicesStatus === "idle") {
      dispatch(fetchServices());
    }
  }, [servicesStatus, dispatch]);

  useEffect(() => {
    if (deleteServiceStatus === "succeeded") {
      toast({
        title: "Service deleted successfully",
        description: "The service has been successfully deleted.",
      });
    } else if (deleteServiceStatus === "failed") {
      toast({
        title: "Error deleting service",
        description: "There was an error deleting the service. Please try again.",
        variant: "destructive",
      });
    }
    return () => {
      dispatch(setDeleteServiceStatusIdle());
    }
  }, [deleteServiceStatus, dispatch, toast]);

  useEffect(() => {
    if (createServiceStatus === "succeeded") {
      toast({
        title: "Service added successfully",
        description: "The new service has been successfully added.",
      });
      setIsAddServiceDialogOpen(false);
    } else if (createServiceStatus === "failed") {
      toast({
        title: "Error adding service",
        description: "There was an error adding the service. Please try again.",
        variant: "destructive",
      });
    }
    return () => {
      dispatch(setCreateServiceStatusIdle());
    }
  }, [createServiceStatus, dispatch, toast]);

  useEffect(() => {
    if (updateServiceStatus === "succeeded") {
      toast({
        title: "Service updated successfully",
        description: "The service has been successfully updated.",
      });
      setIsEditServiceDialogOpen(false);
    } else if (updateServiceStatus === "failed") {
      toast({
        title: "Error updating service",
        description: "There was an error updating the service. Please try again.",
        variant: "destructive",
      });
    }
    return () => {
      dispatch(setUpdateServiceStatusIdle());
    }
  }, [updateServiceStatus, dispatch, toast]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
  };

  const handleEdit = (service) => {
    setServiceToEdit(service);
    setIsEditServiceDialogOpen(true);
  };

  const handleDelete = (service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteService(serviceToDelete._id));
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
    setDeleteConfirmation("");
  }

  const categories = ["All", ...new Set(services.map((service) => service.category))];

  const filteredServices = services
    .filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(service => categoryFilter === "All" || service.category === categoryFilter);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="font-semibold">Services</CardTitle>
        <CardDescription>Manage and view service information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search services..." value={searchTerm} onChange={handleSearch} className="pl-8" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {categoryFilter === "All" ? "Select category" : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem key={category} onClick={() => handleCategoryChange(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="mt-4 text-lg font-medium text-muted-foreground">No services found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className='capitalize'>{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>₹{service.rate.toFixed(2)}</TableCell>
                  <TableCell className="flex">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(service)}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <AddServiceDialog isOpen={isAddServiceDialogOpen} onClose={() => setIsAddServiceDialogOpen(false)} />
      <EditServiceDialog isOpen={isEditServiceDialogOpen} onClose={() => setIsEditServiceDialogOpen(false)} service={serviceToEdit} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {serviceToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <p className="text-sm mb-1">Please type <span className="font-semibold">{serviceToDelete?.name}</span> to permanently delete the service.</p>
            <Input
              placeholder="Type service name"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmation !== serviceToDelete?.name}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default Services;