import React, { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  ChevronDown,
  Search,
  UserPlus,
  Filter,
  Calendar as CalendarIcon,
  X,
  UserX,
  Phone,
  Clock,
  BedDouble,
  User,
  MoreVertical,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";
import { useSelector, useDispatch } from "react-redux";
import { convertTo12Hour, DateRangePicker } from "../assets/Data";
import { fetchBills } from "../redux/slices/BillingSlice";
import { setSelectedPatient } from "../redux/slices/patientSlice";
import {
  startOfDay,
  endOfDay,
  subDays,
  isWithinInterval,
  addDays,
} from "date-fns";
import { format } from "date-fns";
import { fetchPatients } from "../redux/slices/patientSlice";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../components/ui/badge";
import OPDPrescriptionPrint from "../components/custom/print/OPDPrescriptionPrint";
import ConsentFormPrint from "../components/custom/print/ConsentFormPrint";
import EditPatientDialog from "../components/custom/patients/EditPatientDialog";
import LabRegDialog from "../components/custom/registration/LabRegDialog";

export default function Patients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("OPD");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLabDialogOpen, setIsLabDialogOpen] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case "Today":
        return {
          startDate: format(today, "yyyy-MM-dd"),
          endDate: format(addDays(today, 1), "yyyy-MM-dd"),
        };
      case "Yesterday":
        return {
          startDate: format(subDays(today, 1), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
      case "This Week":
        return {
          startDate: format(subDays(today, 7), "yyyy-MM-dd"),
          endDate: format(addDays(today, 1), "yyyy-MM-dd"),
        };
      case "Custom":
        if (dateRange.from && dateRange.to) {
          return {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(addDays(dateRange.to, 1), "yyyy-MM-dd"),
          };
        }
        return null;
      case "All":
      default:
        return null;
    }
  };
  // Use the useSelector hook to get the patients from the Redux store
  const { patientlist: patients, status } = useSelector(
    (state) => state.patients
  );
  const { bills, billsStatus } = useSelector((state) => state.bills);

  useEffect(() => {
    if (status === "idle") {
      let date = getDateRange();
      dispatch(fetchPatients(date));
    }
  }, [status, dispatch]);
  // Use useEffect to log the patients when the component mounts or when patientsFromRedux chang
  useEffect(() => {
    if (billsStatus === "idle") {
      dispatch(fetchBills());
    }
  }, [billsStatus, dispatch]);

  // Add this effect to refetch patients when the status changes
  useEffect(() => {
    // Get date range based on filter
    if (
      dateFilter !== "Custom" ||
      (dateFilter === "Custom" && dateRange.from && dateRange.to)
    ) {
      const dateRangeParams = getDateRange();
      dispatch(fetchPatients(dateRangeParams));
    }
  }, [dateFilter, dateRange, dispatch]);

  const filteredPatients = patients.filter((patient) => {
    const nameMatch = patient.patient?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return nameMatch;
  });

  const handleExistingBills = (patient) => {
    const billID = patient.bills.services.at(-1);
    const bill = bills.find((bill) => bill._id === billID);
    navigate(`/billings/edit/${billID}`, { state: { billData: bill } });
  };

  const createServiceBill = (patient) => {
    dispatch(setSelectedPatient(patient));
    navigate("/billings/create-service-bill");
  };

  const handleDischarge = (patient) => {
    navigate(`/patients/discharge/${patient._id}`, { state: { patient } });
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleLabRegistration = (patient) => {
    setSelectedPatient(patient);
    setIsLabDialogOpen(true);
  };

  const PatientTable = ({ patients, type }) => {
    const navigate = useNavigate();

    const handleDischarge = (patient) => {
      navigate(`/patients/discharge/${patient._id}`, {
        state: { ignoreList: true, dischargeData: patient },
      });
    };

    const getStatusBadgeVariant = (status) => {
      switch (status.toLowerCase()) {
        case "admitted":
          return "default";
        case "discharged":
          return "secondary";
        case "critical":
          return "destructive";
        default:
          return "outline";
      }
    };

    if (patients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <UserX className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-600">
            No patients found
          </p>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {type === "OPD" && <TableHead>Sl. No</TableHead>}
            <TableHead>Name</TableHead>
            <TableHead>UHID No</TableHead>
            {type === "IPD" && (
              <>
                <TableHead>IPD Number</TableHead>
                <TableHead>Admit Date</TableHead>
                <TableHead>Discharge Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operation</TableHead>
              </>
            )}
            {type === "OPD" && <TableHead>Date & Time</TableHead>}
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              {type === "OPD" && <TableCell>{patient.bookingNumber}</TableCell>}
              <TableCell>
                <Button
                  variant="link"
                  className="p-0 h-auto font-bold text-black capitalize"
                  onClick={() =>
                    navigate(`/patient-overview/${patient.patient._id}`, {
                      state: { ID: patient._id },
                    })
                  }
                >
                  {patient.patient.name}
                </Button>
              </TableCell>
              <TableCell>{patient.registrationNumber || "--"}</TableCell>
              {type === "IPD" && (
                <>
                  <TableCell>{patient.ipdNumber || "N/A"}</TableCell>
                  {/* <TableCell>
                    {patient.assignedRoom?.roomNumber || "--"}
                  </TableCell> */}
                  <TableCell>
                    {format(new Date(patient.bookingDate), "dd MMM")}{" "}
                    {convertTo12Hour(patient?.bookingTime)}
                  </TableCell>
                  <TableCell>
                    {patient.dateDischarged
                      ? format(new Date(patient.dateDischarged), "dd-MM-yyyy")
                      : "--"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(patient.status)}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    {patient.operationName ? patient.operationName : "--"}
                  </TableCell>
                </>
              )}
              {type === "OPD" && (
                <TableCell>
                  {dateFilter === "Today"
                    ? format(new Date(patient.createdAt), "hh:mm a")
                    : format(new Date(patient.bookingDate), "dd-MM-yyyy")}
                </TableCell>
              )}
              <TableCell>{patient.patient.contactNumber}</TableCell>
              <TableCell>
                <div
                  className="max-w-[150px] truncate"
                  title={patient.patient.address || "--"}
                >
                  {patient.patient.address || "--"}
                </div>
              </TableCell>
              <TableCell>{patient.patient.gender}</TableCell>
              <TableCell>{patient.doctor?.name || "--"}</TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleExistingBills(patient)}
                    >
                      Bills
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditPatient(patient)}
                    >
                      Edit Patient
                    </DropdownMenuItem>
                    {patient.type === "OPD" && (
                      <DropdownMenuItem asChild>
                        <OPDPrescriptionPrint patient={patient} />
                      </DropdownMenuItem>
                    )}
                    {patient.type === "IPD" && (
                      <DropdownMenuItem asChild>
                        <ConsentFormPrint patient={{...patient,bookingTime:convertTo12Hour(patient?.bookingTime)}} />
                      </DropdownMenuItem>
                    )}
                    {patient.type === "IPD" && (
                      <DropdownMenuItem
                        onClick={() => handleDischarge(patient)}
                      >
                        {patient.status === "Discharged"
                          ? "View Discharge Summary"
                          : "Discharge Patient"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleLabRegistration(patient)}
                    >
                      Register Lab
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange);
    setDateFilter("Custom");
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateFilter("All");
  };

  const PatientCard = ({ patient }) => {
    const getStatusBadgeVariant = (status) => {
      switch (status.toLowerCase()) {
        case "admitted":
          return "default";
        case "discharged":
          return "secondary";
        case "critical":
          return "destructive";
        default:
          return "outline";
      }
    };

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center flex-grow">
                <span className="text-sm font-semibold text-primary mr-2">
                  #{patient.bookingNumber}
                </span>
                <h3
                  className="text-lg font-semibold capitalize cursor-pointer hover:text-primary"
                  onClick={() =>
                    navigate(`/patient-overview/${patient.patient._id}`, {
                      state: { ID: patient._id },
                    })
                  }
                >
                  {patient.patient.name}
                </h3>
              </div>
              <div className="flex items-center">
                {patient.type === "IPD" && (
                  <Badge
                    variant={getStatusBadgeVariant(patient.status)}
                    className="mr-2"
                  >
                    {patient.status}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleExistingBills(patient)}
                    >
                      Bills
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditPatient(patient)}
                    >
                      Edit Patient
                    </DropdownMenuItem>
                    {patient.type === "IPD" && (
                      <DropdownMenuItem
                        onClick={() => handleDischarge(patient)}
                      >
                        {patient.status === "Discharged"
                          ? "View Discharge Summary"
                          : "Discharge Patient"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleLabRegistration(patient)}
                    >
                      Register Lab
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              <div className="flex items-center col-span-2">
                <User className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">
                  UHID No: {patient.registrationNumber || "--"}
                </span>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">
                  {dateFilter === "Today"
                    ? format(new Date(patient.createdAt), "hh:mm a")
                    : format(new Date(patient.bookingDate), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">{patient.patient.contactNumber}</span>
              </div>
              <div className="flex items-center col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <span
                  className="text-sm truncate max-w-[200px]"
                  title={patient.patient.address || "--"}
                >
                  {patient.patient.address || "--"}
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm capitalize">
                  {patient.patient.gender}
                </span>
              </div>
              {patient.type === "IPD" && (
                <div className="flex items-center">
                  <BedDouble className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">
                    {patient.assignedRoom?.roomNumber || "Not assigned"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Card className="w-full border-none shadow-none">
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
              <CardTitle>Patient List</CardTitle>
              <CardDescription>
                Manage and view patient information
              </CardDescription>
            </div>
          </div>
          {isSmallScreen && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                  OPD
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsIPDDialogOpen(true)}>
                  IPD
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <OPDRegDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <IPDRegDialog
          open={isIPDDialogOpen}
          onOpenChange={setIsIPDDialogOpen}
        />
        <EditPatientDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          patientData={{
            ...selectedPatient?.patient,
            registrationNumber: selectedPatient?.registrationNumber,
            type: selectedPatient?.type,
            visitID: selectedPatient?._id,
            guardianName: selectedPatient?.guardianName,
            relation: selectedPatient?.relation,
          }}
        />
        <LabRegDialog
          open={isLabDialogOpen}
          onOpenChange={setIsLabDialogOpen}
          patientData={selectedPatient}
        />
        <Tabs
          defaultValue="OPD"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger
              className="data-[state=active]:bg-blue-400 data-[state=active]:text-white"
              value="OPD"
            >
              OPD
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-blue-400 data-[state=active]:text-white"
              value="IPD"
            >
              IPD
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col space-y-4 mb-4 mt-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                <div className="flex w-full space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter === "All" ? "All Time" : dateFilter}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-[200px]"
                            >
                              <DropdownMenuLabel>
                                Time Filter Options
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setDateFilter("Today")}
                              >
                                Today
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setDateFilter("Yesterday")}
                              >
                                Yesterday
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setDateFilter("This Week")}
                              >
                                This Week
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem
                                onSelect={() => setDateFilter("All")}
                              >
                                All Time
                              </DropdownMenuItem> */}
                              <DropdownMenuItem
                                onSelect={() => setDateFilter("Custom")}
                              >
                                Custom Range
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {dateFilter === "Custom" && (
                            <DateRangePicker
                              from={tempDateRange.from}
                              to={tempDateRange.to}
                              onSelect={(range) => {
                                setTempDateRange(range);
                              }}
                              onSearch={handleDateRangeSearch}
                              onCancel={handleDateRangeCancel}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <>
                    {/* */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFilter === "All" ? "All Time" : dateFilter}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>
                          Time Filter Options
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setDateFilter("Today")}
                        >
                          Today
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setDateFilter("Yesterday")}
                        >
                          Yesterday
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setDateFilter("This Week")}
                        >
                          This Week
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onSelect={() => setDateFilter("All")}>
                          All Time
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onSelect={() => setDateFilter("Custom")}
                        >
                          Custom Range
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {dateFilter === "Custom" && (
                      <DateRangePicker
                        from={tempDateRange?.from}
                        to={tempDateRange?.to}
                        onSelect={(range) => setTempDateRange(range)}
                        onSearch={handleDateRangeSearch}
                        onCancel={handleDateRangeCancel}
                      />
                    )}
                  </>
                )}
              </div>
              {!isSmallScreen && (
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Patient
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                        OPD
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setIsIPDDialogOpen(true)}
                      >
                        IPD
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
          <TabsContent value="OPD">
            {isSmallScreen ? (
              filteredPatients.filter((p) => p.type === "OPD").length > 0 ? (
                <div>
                  {filteredPatients
                    .filter((p) => p.type === "OPD")
                    .map((patient) => (
                      <PatientCard key={patient._id} patient={patient} />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <UserX className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-semibold text-gray-600">
                    No OPD patients found
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              )
            ) : (
              <PatientTable
                patients={filteredPatients.filter((p) => p.type === "OPD")}
                type="OPD"
              />
            )}
          </TabsContent>
          <TabsContent value="IPD">
            {isSmallScreen ? (
              filteredPatients.filter((p) => p.type === "IPD").length > 0 ? (
                <div>
                  {filteredPatients
                    .filter((p) => p.type === "IPD")
                    .map((patient) => (
                      <PatientCard key={patient._id} patient={patient} />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <UserX className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-semibold text-gray-600">
                    No IPD patients found
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              )
            ) : (
              <PatientTable
                patients={filteredPatients.filter((p) => p.type === "IPD")}
                type="IPD"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
