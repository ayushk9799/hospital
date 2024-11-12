import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBills, deleteBill } from "../redux/slices/BillingSlice";
import {
  format,
  isToday,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  addDays,
} from "date-fns";
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
import { Badge } from "../components/ui/badge";
import {
  Search,
  MoreVertical,
  Filter,
  ChevronDown,
  Plus,
  FileX,
  Calendar as CalendarIcon,
  X,
  ListFilter,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DateRangePicker } from "../assets/Data";
import ViewBillDialog from "../components/custom/billing/ViewBillDialog";
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
import { useToast } from "../hooks/use-toast";
import PaymentDialog from "../components/custom/billing/PaymentDialog";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";

const Billings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { bills, billsStatus } = useSelector((state) => state.bills);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [patientTypeFilter, setPatientTypeFilter] = useState("All");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const { toast } = useToast();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    if (billsStatus === "idle") {
      const today = new Date();
      const dateRangeParams = {
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(addDays(today, 1), "yyyy-MM-dd"),
      };
      dispatch(fetchBills({ dateRange: dateRangeParams }));
    }
  }, [dispatch, billsStatus]);

  useEffect(() => {
    if (location.state?.searchPatientId) {
      setSearchTerm(location.state.patientName || "");

      const patientBills = bills.filter(
        (bill) => bill.patientInfo._id === location.state.searchPatientId
      );

      if (patientBills.length > 0) {
        handleViewBill(patientBills[0]);
      }
    }
  }, [location.state, bills]);

  useEffect(() => {
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

    if (dateFilter !== "Custom" || (dateFilter === "Custom" && dateRange.from && dateRange.to)) {
      const dateRangeParams = getDateRange();
      dispatch(fetchBills({ dateRange: dateRangeParams }));
    }
  }, [dateFilter, dateRange, dispatch]);

  const getBillStatus = (bill) => {
    if (bill.amountPaid === bill.totalAmount) return "Paid";
    return "Due";
  };

  const filteredBills = bills.filter((bill) => {
    const nameMatch =
      bill.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.patientInfo.phone.includes(searchTerm);

    let dateMatch = true;
    const billDate = new Date(bill.createdAt);
    const today = new Date();

    switch (dateFilter) {
      case "Today":
        dateMatch = isWithinInterval(billDate, {
          start: startOfDay(today),
          end: endOfDay(today),
        });
        break;
      case "Yesterday":
        dateMatch = isWithinInterval(billDate, {
          start: startOfDay(subDays(today, 1)),
          end: endOfDay(subDays(today, 1)),
        });
        break;
      case "This Week":
        dateMatch = isWithinInterval(billDate, {
          start: startOfWeek(today),
          end: endOfDay(today),
        });
        break;
      case "Custom":
        if (dateRange.from && dateRange.to) {
          dateMatch = isWithinInterval(billDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        }
        break;
    }

    const status = getBillStatus(bill);
    let statusMatch = true;
    if (filterStatus !== "All") {
      statusMatch = status === filterStatus;
    }

    let patientTypeMatch = true;
    if (patientTypeFilter !== "All") {
      patientTypeMatch = bill.patientType === patientTypeFilter;
    }

    return nameMatch && dateMatch && statusMatch && patientTypeMatch;
  });

  const getBadgeVariant = (status) => {
    switch (status) {
      case "Due":
        return "destructive";
      case "Paid":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDateOrTime = (date) => {
    const billDate = new Date(date);
    if (isToday(billDate)) {
      return format(billDate, "h:mm a");
    }
    return format(billDate, "MMM dd, hh:mm a");
  };

  const handleDateRangeSearch = () => {
    if (tempDateRange.from && tempDateRange.to) {
      setDateRange(tempDateRange);
      setDateFilter("Custom");
    }
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateRange({ from: null, to: null });
    setDateFilter("Today");
    const today = new Date();
    const dateRangeParams = {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, 1), "yyyy-MM-dd"),
    };
    dispatch(fetchBills({ dateRange: dateRangeParams }));
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsViewDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditBill = (bill) => {
    navigate(`/billings/edit/${bill._id}`, { state: { billData: bill } });
    setOpenDropdownId(null);
  };

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setIsDeleteDialogOpen(true);
    setOpenDropdownId(null);
  };

  const confirmDelete = () => {
    dispatch(deleteBill(billToDelete._id))
      .unwrap()
      .then(() => {
        setIsDeleteDialogOpen(false);
        setBillToDelete(null);
        setDeleteConfirmation("");
        toast({
          title: "Bill deleted",
          description: `Bill of ${billToDelete.patientInfo.name} has been successfully deleted.`,
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to delete bill: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handlePayments = (bill) => {
    setSelectedBillForPayment(bill);
    setIsPaymentDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleDropdownOpenChange = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const BillCard = ({ bill }) => (
    <Card 
      className="mb-4 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => {
        // Prevent opening modal if clicking on dropdown menu
        if (!e.target.closest('.dropdown-trigger')) {
          handleViewBill(bill);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-stretch">
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-semibold capitalize">
                {bill.patientInfo.name}
              </h3>
              <Badge variant="outline" className="ml-2 text-xs">
                {bill.patientType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Bill ID: B{bill._id.slice(-6)}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground">Total:</p>
                <p className="font-sm">
                  ₹{bill.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground">Due:</p>
                <p className="font-sm text-red-500">
                  ₹
                  {(bill.totalAmount - bill.amountPaid).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2 items-center col-span-2">
                <p className="text-sm text-muted-foreground">Date:</p>
                <p className="font-sm">{formatDateOrTime(bill.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end ml-4">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 dropdown-trigger"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewBill(bill)}>
                    Print Bill
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditBill(bill)}>
                    Edit Bill
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePayments(bill)}>
                    Payments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteBill(bill)}
                  >
                    Delete Bill
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge variant={getBadgeVariant(getBillStatus(bill))}>
              {getBillStatus(bill)}
            </Badge>
            <div></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full mx-auto border-0 shadow-none">
      <CardHeader className="px-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Billing List</CardTitle>
            <CardDescription>
              Manage and view services billing information
            </CardDescription>
          </div>
          {isSmallScreen && (
            <Button
              className="hidden"
              variant="outline"
              size="icon"
              onClick={() => navigate("/billings/create-service-bill")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="flex w-full space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Filter className="mr-2 h-4 w-4" />
                            {filterStatus === "All" ? "Status" : filterStatus}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[200px]"
                        >
                          <DropdownMenuLabel>
                            Filter by Status
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setFilterStatus("All")}
                          >
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setFilterStatus("Paid")}
                          >
                            Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setFilterStatus("Due")}
                          >
                            Due
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {patientTypeFilter === "All"
                              ? "Patient Type"
                              : patientTypeFilter}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[200px]"
                        >
                          <DropdownMenuLabel>
                            Filter by Patient Type
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setPatientTypeFilter("All")}
                          >
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPatientTypeFilter("IPD")}
                          >
                            IPD
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPatientTypeFilter("OPD")}
                          >
                            OPD
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter === "Today" ? "Today" : dateFilter}
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
                          <DropdownMenuItem
                            onSelect={() => setDateFilter("All")}
                          >
                            All Time
                          </DropdownMenuItem>
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
                          onSelect={(range) => setTempDateRange(range)}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      {filterStatus === "All" ? "Status" : filterStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setFilterStatus("All")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilterStatus("Paid")}>
                      Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilterStatus("Due")}>
                      Due
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <ListFilter className="mr-2 h-4 w-4" />
                      {patientTypeFilter === "All"
                        ? "Patient Type"
                        : patientTypeFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>
                      Filter by Patient Type
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setPatientTypeFilter("All")}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPatientTypeFilter("IPD")}
                    >
                      IPD
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPatientTypeFilter("OPD")}
                    >
                      OPD
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter === "Today" ? "Today" : dateFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Time Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setDateFilter("Today")}>
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("Yesterday")}>
                      Yesterday
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("This Week")}>
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
              </>
            )}
          </div>
          {!isSmallScreen && (
            <div className=" hidden">
              <Button
                variant="outline"
                onClick={() => navigate("/billings/create-service-bill")}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Bill
              </Button>
            </div>
          )}
        </div>
        {filteredBills.length > 0 ? (
          isSmallScreen ? (
            <div>
              {filteredBills.map((bill) => (
                <BillCard key={bill._id} bill={bill} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Bill ID</TableHead>
                    <TableHead className="font-semibold">
                      Patient Name
                    </TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    {!isMediumScreen && (
                      <>
                        <TableHead className="font-semibold">
                          Patient Type
                        </TableHead>
                        <TableHead className="font-semibold">
                          Date & Time
                        </TableHead>
                      </>
                    )}
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Paid</TableHead>
                    <TableHead className="font-semibold">Due</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow 
                      key={bill._id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      onClick={(e) => {
                        // Prevent opening modal if clicking on dropdown menu
                        if (!e.target.closest('.dropdown-trigger')) {
                          handleViewBill(bill);
                        }
                      }}
                    >
                      <TableCell>B{bill._id.slice(-6)}</TableCell>
                      <TableCell>{bill.patientInfo.name}</TableCell>
                      <TableCell>{bill.patientInfo.phone}</TableCell>
                      {!isMediumScreen && (
                        <>
                          <TableCell>{bill.patientType}</TableCell>
                          <TableCell>
                            {formatDateOrTime(bill.createdAt)}
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        ₹{bill.amountPaid.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        ₹
                        {(bill.totalAmount - bill.amountPaid).toLocaleString(
                          "en-IN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(getBillStatus(bill))}>
                          {getBillStatus(bill)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          open={openDropdownId === bill._id}
                          onOpenChange={() =>
                            handleDropdownOpenChange(bill._id)
                          }
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 dropdown-trigger">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewBill(bill)}
                            >
                              Print Bill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditBill(bill)}
                            >
                              Edit Bill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePayments(bill)}
                            >
                              Payments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteBill(bill)}
                            >
                              Delete Bill
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <FileX className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-600">
              No bills found
            </p>
            <p className="text-gray-500 mt-2">
              There are no bills matching your search criteria.
            </p>
          </div>
        )}
      </CardContent>
      <ViewBillDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        billData={selectedBill}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Bill of {billToDelete?.patientInfo?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bill from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <p className="text-sm mb-1">
              Please type <span className="font-semibold">DELETE</span> to
              confirm.
            </p>
            <Input
              placeholder="Type DELETE"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmation !== "DELETE"}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        setIsOpen={setIsPaymentDialogOpen}
        billData={selectedBillForPayment}
      />
    </Card>
  );
};

export default Billings;
