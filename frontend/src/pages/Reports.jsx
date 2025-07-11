import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { Plus, Filter, Eye, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ScrollArea } from "../components/ui/scroll-area";
// Sample staff data

export default function Reports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { staffMembers } = useSelector((state) => state.staff);
  const { userData } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const departments = useSelector((state) => state.departments.departments);
  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDepartment === "All" ||
        staff.department?.includes(filterDepartment)) &&
      (filterRole === "All" || staff.roles.includes(filterRole.toLowerCase()))
  );

  const checkPermissionAndNavigate = (
    path,
    action,
    requiredPermission,
    staff = null
  ) => {
    if (
      action === "view staff details" &&
      staff &&
      userData._id === staff._id
    ) {
      return true;
    }

    if (!userData.permissions?.includes(requiredPermission)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to " + action,
      });
      return false;
    }
    return true;
  };

  const handleStaffClick = (staff) => {
    if (
      checkPermissionAndNavigate(
        `/staff/${staff._id}`,
        "view staff details",
        "view_staff",
        staff
      )
    ) {
      navigate(`/staff/${staff._id}`, { state: { staffData: staff } });
    }
  };

  const handleEditStaff = (staff) => {
    if (checkPermissionAndNavigate("/addstaff", "edit staff", "edit_staff")) {
      navigate("/addstaff", { state: { editMode: true, staffData: staff } });
    }
  };

  const handleViewStaff = (staff) => {
    if (
      checkPermissionAndNavigate(
        `/staff/${staff._id}`,
        "view staff details",
        "view_staff",
        staff
      )
    ) {
      navigate(`/staff/${staff._id}`, { state: { staffData: staff } });
    }
  };

  const handleAddStaff = () => {
    if (
      checkPermissionAndNavigate("/addstaff", "add new staff", "create_staff")
    ) {
      navigate("/addstaff");
    }
  };

  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto p-0">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <CardTitle>Staff List</CardTitle>
              <CardDescription>
                Manage and view staff information
              </CardDescription>
            </div>
          </div>
          {isSmallScreen && (
            <Button size="icon" onClick={handleAddStaff}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <div className="flex w-full space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                {isSmallScreen && (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <Filter className="h-4 w-4" />
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
                          onValueChange={setFilterDepartment}
                          defaultValue="All"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Departments</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.name} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={setFilterRole}
                          defaultValue="All"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="technician">
                              Technician
                            </SelectItem>
                            <SelectItem value="admin">
                              Administrative
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <>
                  <Select
                    onValueChange={setFilterDepartment}
                    defaultValue="All"
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setFilterRole} defaultValue="All">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Roles</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="admin">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            {!isSmallScreen && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleAddStaff}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
              </div>
            )}
          </div>
          {filteredStaff.length > 0 ? (
            isSmallScreen ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <Card key={staff._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center space-x-4 cursor-pointer"
                          onClick={() => handleViewStaff(staff)}
                        >
                          <Avatar>
                            <AvatarFallback>
                              {staff?.name
                                .split(" ")
                                .filter(
                                  (n, i, arr) => i === 0 || i === arr.length - 1
                                )
                                .map((n) => n[0]?.toUpperCase())
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold hover:underline">
                              {staff.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {staff.roles.join(", ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {staff.department.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStaff(staff)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStaff(staff)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Name</TableHead>
                      <TableHead className="w-[20%]">Role</TableHead>
                      <TableHead className="w-[30%]">Department</TableHead>
                      <TableHead className="w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Avatar className="hidden md:block">
                              <AvatarFallback>
                                {staff?.name
                                  .split(" ")
                                  .filter(
                                    (n, i, arr) =>
                                      i === 0 || i === arr.length - 1
                                  )
                                  .map((n) => n[0]?.toUpperCase())
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="cursor-pointer hover:underline capitalize">
                              {staff.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{staff.roles.join(", ")}</TableCell>
                        <TableCell>{staff.department.join(", ")}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStaff(staff)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStaff(staff)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
