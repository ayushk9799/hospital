import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Search,
  Plus,
  ListFilter,
  FileDown,
  Pencil,
  Trash,
  Settings,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { fetchServices, deleteService } from "../redux/slices/serviceSlice";
import AddServiceDialog from "../components/custom/services/AddServiceDialog";
import EditServiceDialog from "../components/custom/services/EditServiceDialog";
import { useToast } from "../hooks/use-toast";
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
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import ManageServicesDialog from "../components/custom/services/ManageServicesDialog"; // Import the new dialog component
import { useNavigate } from "react-router-dom";

const Services = () => {
  const dispatch = useDispatch();
  const { services, servicesStatus, deleteServiceStatus } = useSelector(
    (state) => state.services
  );
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isManageServicesDialogOpen, setIsManageServicesDialogOpen] =
    useState(false); // New state for manage dialog
  const navigate = useNavigate();

  useEffect(() => {
    if (servicesStatus === "idle") {
      dispatch(fetchServices());
    }
  }, [servicesStatus, dispatch]);

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
    dispatch(deleteService(serviceToDelete._id))
      .unwrap()
      .then(() => {
        toast({
          title: "Service deleted successfully",
          description: "The service has been removed.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to delete service",
          description:
            error.message ||
            "There was an error deleting the service. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
      });
  };

  const categories = [
    "All",
    ...new Set(services.map((service) => service.category)),
  ];

  const filteredServices = services
    .filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (service) =>
        categoryFilter === "All" || service.category === categoryFilter
    );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Card className="w-full mx-auto border-0 shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="font-semibold">Services</CardTitle>
              <CardDescription>
                Manage and view service information
              </CardDescription>
            </div>
          </div>
          {isSmallScreen && (
            <div className="flex space-x-2">
              <Button
                size="icon"
                onClick={() => setIsAddServiceDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsManageServicesDialogOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-2 mb-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="flex w-full space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8 w-full"
                />
              </div>
              {isSmallScreen && (
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isSmallScreen ? (
              <AnimatePresence>
                {isFilterExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden w-full"
                  >
                    <div className="pt-2 space-y-2">
                      <Select
                        onValueChange={(value) => handleCategoryChange(value)}
                        defaultValue="All"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <ListFilter className="mr-2 h-4 w-4" />
                    {categoryFilter === "All"
                      ? "Select category"
                      : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {!isSmallScreen && (
            <div className="flex-row-reverse space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddServiceDialogOpen(true)}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Service
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsManageServicesDialogOpen(true)}
                className="w-full md:w-auto"
              >
                <Settings className="mr-2 h-4 w-4" /> Manage
              </Button>
            </div>
          )}
        </div>
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No services found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="capitalize font-bold">
                      {service.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {service.category}
                    </TableCell>
                    <TableCell>
                      {service.rate
                        ? `${service.rate.toLocaleString("en-IN")}`
                        : ""}
                    </TableCell>
                    <TableCell className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <AddServiceDialog
        isOpen={isAddServiceDialogOpen}
        onClose={() => setIsAddServiceDialogOpen(false)}
      />
      <EditServiceDialog
        isOpen={isEditServiceDialogOpen}
        onClose={() => setIsEditServiceDialogOpen(false)}
        service={serviceToEdit}
      />
      <ManageServicesDialog
        isOpen={isManageServicesDialogOpen}
        onClose={() => setIsManageServicesDialogOpen(false)}
        services={services}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-[425px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete {serviceToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the
              service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto"
              onClick={confirmDelete}
              disabled={deleteServiceStatus === "loading"}
            >
              {deleteServiceStatus === "loading" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Services;
