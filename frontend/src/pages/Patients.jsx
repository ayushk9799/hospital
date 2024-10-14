import React, { useState ,useEffect} from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";
import { useSelector, useDispatch } from "react-redux";
import { DateRangePicker } from "../assets/Data";
import { fetchBills } from "../redux/slices/BillingSlice";
import { setSelectedPatient } from "../redux/slices/patientSlice";
import { startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns";
import { format } from "date-fns";
import { fetchPatients } from "../redux/slices/patientSlice";

// Add this selector function at the top of your file, outside of the component

export default function Patients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("OPD");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);

  // Use the useSelector hook to get the patients from the Redux store
  const {patientlist:patients,status} = useSelector((state) => state.patients);
  const { bills ,billsStatus} = useSelector((state) => state.bills);
  
  useEffect(()=>{
    if(status==="idle"){
      dispatch(fetchPatients())
    }
  },[status, dispatch])
  // Use useEffect to log the patients when the component mounts or when patientsFromRedux chang
useEffect(()=>{
  if(billsStatus==="idle"){
    dispatch(fetchBills())
  }
},[billsStatus, dispatch])

  // Add this effect to refetch patients when the status changes
 
  const filteredPatients = patients.filter((patient) => {
    const nameMatch = patient.patient?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let dateMatch = true;
    // Parse the date string in the format "DD-MM-YYYY"
    const visitDate = patient.bookingDate;

    const today = new Date();

    switch (dateFilter) {
      case "Today":
        dateMatch = isWithinInterval(visitDate, {
          start: startOfDay(today),
          end: endOfDay(today),
        });
        break;
      case "Yesterday":
        dateMatch = isWithinInterval(visitDate, {
          start: startOfDay(subDays(today, 1)),
          end: endOfDay(subDays(today, 1)),
        });
        break;
      case "This Week":
        dateMatch = isWithinInterval(visitDate, {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today),
        });
        break;
      case "Custom":
        if (dateRange.from && dateRange.to) {
          dateMatch = isWithinInterval(visitDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        }
        break;
      case "All":
      default:
        dateMatch = true;
    }

    return nameMatch && dateMatch;
  });

  const handleExistingBills = (patient) => {
    const billID = patient.bills.services[0];
    dispatch(setSelectedPatient(patient));
    const bill = bills.find((bill) => bill._id === billID);
    navigate(`/billings/edit/${billID}`, { state: { billData: bill } });
    // ;
  };

  const createServiceBill = (patient) => {
    dispatch(setSelectedPatient(patient));
    navigate("/billings/create-service-bill");
  };

  const PatientTable = ({ patients, type }) => {
    const navigate = useNavigate();

    const handleDischarge = (patient) => {
      navigate(`/patients/discharge/${patient._id}`, { state: { patient } });
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
            <TableHead>S.No</TableHead>
            <TableHead>Name</TableHead>
            {type === "IPD" && (
              <>
                <TableHead>Room</TableHead>
                <TableHead>Admit Date</TableHead>
                <TableHead>Discharge Date</TableHead>
                <TableHead>Status</TableHead>
              </>
            )}
            {type === "OPD" && <TableHead>Date</TableHead>}
            {type === "OPD" && <TableHead>Time Slot</TableHead>}
            <TableHead>Mobile</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Doctor</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.bookingNumber}>
              <TableCell>{patient.bookingNumber}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-black"
                  onClick={() => navigate(`/patients/${patient.patient._id}`)}
                >
                  {patient.patient.name}
                </Button>
              </TableCell>
              {type === "IPD" && (
                <>
                  <TableCell>
                    {patient.assignedRoom?.roomNumber || "--"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(patient.bookingDate), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell>
                    {patient.dateDischarged
                      ? format(new Date(patient.dateDischarged), "dd-MM-yyyy")
                      : "--"}
                  </TableCell>
                  <TableCell>{patient.status}</TableCell>
                </>
              )}
              {type === "OPD" && (
                <TableCell>
                  {format(new Date(patient.bookingDate), "dd-MM-yyyy")}
                </TableCell>
              )}
              {type === "OPD" && (
                <TableCell>
                  {patient.timeSlot?.start} - {patient.timeSlot?.end}
                </TableCell>
              )}
              <TableCell>{patient.patient.contactNumber}</TableCell>
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
                      onClick={() =>
                        navigate(`/patients/${patient.patient._id}`)
                      }
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExistingBills(patient)}
                    >
                      Existing Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => createServiceBill(patient)}
                    >
                      Create New Bill
                    </DropdownMenuItem>
                    {type === "IPD" && (
                      <DropdownMenuItem
                        onClick={() => handleDischarge(patient)}
                      >
                        {patient.status === "Discharged"
                          ? "View Discharge Summary"
                          : "Discharge Patient"}
                      </DropdownMenuItem>
                    )}
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Patient List</CardTitle>
        <CardDescription>Manage and view patient information</CardDescription>
      </CardHeader>
      <CardContent>
        <OPDRegDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <IPDRegDialog
          open={isIPDDialogOpen}
          onOpenChange={setIsIPDDialogOpen}
        />
        <Tabs
          defaultValue="OPD"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="OPD">OPD</TabsTrigger>
            <TabsTrigger value="IPD">IPD</TabsTrigger>
          </TabsList>
          <div className="flex flex-col space-y-4 mb-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      {filterStatus === "All" ? "Filter" : filterStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setFilterStatus("All")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterStatus("Active")}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterStatus("Admitted")}
                    >
                      Admitted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterStatus("Discharged")}
                    >
                      Discharged
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterStatus("Critical")}
                    >
                      Critical
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterStatus("Pending")}
                    >
                      Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter === "All" ? "All Time" : dateFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Time Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setDateFilter("Today")}>
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
                    <DropdownMenuItem onSelect={() => setDateFilter("All")}>
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("Custom")}>
                      Custom Range
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {dateFilter === "Custom" && (
                  <DateRangePicker
                    from={tempDateRange.from}
                    to={tempDateRange.to}
                    onSelect={(range) => setTempDateRange(range)}
                    onSearch={handleDateRangeSearch}
                    onCancel={handleDateRangeCancel}
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" /> Add Patient
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsDialogOpen(true);
                      }}
                    >
                      OPD
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsIPDDialogOpen(true);
                      }}
                    >
                      IPD
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" /> Export
                </Button> */}
              </div>
            </div>
          </div>
          <TabsContent value="OPD">
            <PatientTable
              patients={filteredPatients.filter((p) => p.type === "OPD")}
              type="OPD"
            />
          </TabsContent>
          <TabsContent value="IPD">
            <PatientTable
              patients={filteredPatients.filter((p) => p.type === "IPD")}
              type="IPD"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}