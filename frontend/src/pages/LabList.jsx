import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLabRegistrations,
  updateTestStatus,
  searchLabRegistrations,
  clearSearchResults,
  deleteLabRegistration,
} from "../redux/slices/labSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  X,
  UserX,
  MoreVertical,
  ChevronLeft,
  Loader2,
  ListChecks,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { useMediaQuery } from "../hooks/use-media-query";
import { Badge } from "../components/ui/badge";
import { DateRangePicker } from "../assets/Data";
import LabRegDialog from "../components/custom/registration/LabRegDialog";
import LabDetailsModal from "../components/custom/registration/LabDetailsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
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

import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import LabPaymentDialog from "../components/custom/registration/LabPaymentDialog";
import LabEditDialog from "../components/custom/registration/LabEditDialog";
import { useToast } from "../hooks/use-toast";
import { formatCurrency } from "../assets/Data";

export default function LabList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTestForStatus, setSelectedTestForStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedLabForPayment, setSelectedLabForPayment] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLabForEdit, setSelectedLabForEdit] = useState(null);
  const [labToDelete, setLabToDelete] = useState(null);
  const [showTestCountDialog, setShowTestCountDialog] = useState(false);
  const [testCounts, setTestCounts] = useState({});
  const [testFilter, setTestFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const { toast } = useToast();
  const {
    registrations,
    searchResults,
    updateTestStatus: updateStatus,
    error,
  } = useSelector((state) => state.lab);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [filteredTests, setFilteredTests] = useState([]);
  const [unfilteredTests, setUnfilteredTests] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUpdating = updateStatus === "loading";

  // Add testsList - you should replace this with your actual test list from your app's state/config
 
 
  useEffect(() => {
    fetchTests();
  }, [dateFilter, dateRange, dispatch]);

  const fetchTests = async () => {
    const dateRangeParams = getDateRange();
    if (dateRangeParams) {
      dispatch(fetchLabRegistrations(dateRangeParams));
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = registrations.filter(
        (test) =>
          test.labNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.registrationNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          test.contactNumber?.includes(searchTerm) ||
          test.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length > 0) {
        setUnfilteredTests(filtered);
      } else {
        // If no local results, search in backend
        dispatch(searchLabRegistrations(searchTerm));
      }
    } else {
      setUnfilteredTests(registrations);
      dispatch(clearSearchResults());
    }
  }, [searchTerm, registrations, dispatch]);

  // Add new useEffect to handle search results
  useEffect(() => {
    if (searchResults.length > 0) {
      setUnfilteredTests(searchResults);
    }
  }, [searchResults]);

  useEffect(() => {
    let finalFiltered = [...unfilteredTests];

    if (testFilter) {
      finalFiltered = finalFiltered.filter((reg) =>
        reg.labTests.some((test) => test.name === testFilter)
      );
    }

    if (paymentStatusFilter === "Paid") {
      finalFiltered = finalFiltered.filter(
        (reg) => reg.paymentInfo?.balanceDue <= 0
      );
    } else if (paymentStatusFilter === "Due") {
      finalFiltered = finalFiltered.filter(
        (reg) => reg.paymentInfo?.balanceDue > 0
      );
    }

    setFilteredTests(finalFiltered);
  }, [testFilter, unfilteredTests, paymentStatusFilter]);

  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case "Today":
        return {
          startDate: format(today, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: format(yesterday, "yyyy-MM-dd"),
          endDate: format(yesterday, "yyyy-MM-dd"),
        };
      case "This Week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return {
          startDate: format(weekStart, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
      case "Custom":
        if (dateRange.from && dateRange.to) {
          return {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-yellow-600";
      case "Pending":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Sample Collected":
        return "text-[#f5a158]";
      case "Registered":
        return "text-[#b51616]";
      default:
        return "text-black-600";
    }
  };

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange);
    setDateFilter("Custom");
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateFilter("Today");
  };

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setShowDetailsModal(true);
  };

  const handleTestClick = (registration, test) => {
    setSelectedTestForStatus({ registration, test });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (selectedTestForStatus) {
      try {
        const response = await dispatch(
          updateTestStatus({
            registrationId: selectedTestForStatus.registration._id,
            testName: selectedTestForStatus.test.name,
            newStatus,
          })
        ).unwrap();

        if (response.success) {
          // Only close modal and reset state after successful update
          setShowStatusModal(false);
          setSelectedTestForStatus(null);
        }
      } catch (error) {
        console.error("Failed to update test status:", error);
      }
    }
  };

  const handlePayments = (test) => {
    setSelectedLabForPayment(test);
    setShowPaymentDialog(true);
  };

  const handleEdit = (test) => {
    setSelectedLabForEdit(test);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (test) => {
    setLabToDelete(test);
  };

  const handleDeleteConfirm = async () => {
    if (labToDelete) {
        setIsDeleting(true);
       dispatch(deleteLabRegistration(labToDelete._id)).unwrap().then(() => {
          toast({
            title: "Success",
            description: "Lab registration deleted successfully",
            variant: "success",
          });
        }).catch((er) => {
        toast({
          title: "Error",
          description: er.message || "Something went wrong",
          variant: "destructive",
        });
      }).finally(() => {
        setIsDeleting(false);
        setLabToDelete(null);
      });
    }
  };

  const handleTestCountClick = (testName) => {
    setTestFilter(testName);
    setShowTestCountDialog(false);
  };

  const handleShowTestCounts = () => {
    const summary = filteredTests.reduce((acc, registration) => {
      const { labTests, paymentInfo } = registration;

      if (!labTests || !paymentInfo) {
        return acc;
      }

      const {
        totalAmount = 0,
        additionalDiscount = 0,
        amountPaid = 0,
      } = paymentInfo;

      if (totalAmount === 0) {
        return acc;
      }

      const totalDiscountedAmount = totalAmount - additionalDiscount;

      labTests.forEach((test) => {
        const testName = test.name;
        if (!acc[testName]) {
          acc[testName] = { count: 0, total: 0, collected: 0, due: 0 };
        }

        acc[testName].count += 1;

        const testPrice = test.price || 0;
        const testProportion = testPrice / totalAmount;
        const testDiscount = additionalDiscount * testProportion;
        const testDiscountedPrice = testPrice - testDiscount;

        acc[testName].total += testDiscountedPrice;

        if (totalDiscountedAmount > 0) {
          const paidProportion = amountPaid / totalDiscountedAmount;
          const testCollected = testDiscountedPrice * paidProportion;
          acc[testName].collected += testCollected;
          acc[testName].due += testDiscountedPrice - testCollected;
        }
      });

      return acc;
    }, {});

    setTestCounts(summary);
    setShowTestCountDialog(true);
  };

  const TestCard = ({ test, index }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            {dateFilter === "Today" && (
              <p className="text-sm text-gray-500 mb-1">Sl No: {index + 1}</p>
            )}
            <h3 className="font-semibold">{test.patientName}</h3>
            <p className="text-sm text-gray-500">Lab No: {test.labNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                test.status === "Completed"
                  ? "success"
                  : test.status === "In Progress"
                  ? "warning"
                  : "destructive"
              }
            >
              {test.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(test)}>
                  Print Bills
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePayments(test)}>
                  Payments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate("/lab", { state: { patientData: test } })
                  }
                >
                  Make Report
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleEdit(test)}>
                  Edit Registration
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(test)}
                  className="text-red-500"
                >
                  Delete Registration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Date: </span>
            {format(new Date(test.bookingDate), "dd/MM/yyyy")}
          </div>
          <div>
            <span className="text-gray-500">Tests: </span>
            {test.labTests.map((t, index) => (
              <span key={index}>
                <button
                  onClick={() => handleTestClick(test, t)}
                  className={`${getReportStatusColor(
                    t.reportStatus
                  )} hover:underline cursor-pointer`}
                >
                  {t.name}
                </button>
                {index < test.labTests.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
          <div>
            <span className="text-gray-500">Amount: </span>₹
            {test.paymentInfo.totalAmount.toLocaleString("en-IN")}
          </div>
          {test.referredBy && (
            <div>
              <span className="text-gray-500">Referred By: </span>
              {test.referredBy.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TestStatusModal = () => (
    <Dialog
      open={showStatusModal}
      onOpenChange={(open) => {
        // Only allow closing if not currently updating
        if (!isUpdating) {
          setShowStatusModal(open);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Test Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup
            defaultValue={selectedTestForStatus?.test.reportStatus}
            onValueChange={handleStatusUpdate}
            disabled={isUpdating}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Registered"
                id="registered"
                disabled={isUpdating}
              />
              <Label
                htmlFor="registered"
                className={`${
                  isUpdating ? "opacity-50" : ""
                } ${getReportStatusColor("Registered")}`}
              >
                Registered
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Sample Collected"
                id="collected"
                disabled={isUpdating}
              />
              <Label
                htmlFor="collected"
                className={`${
                  isUpdating ? "opacity-50" : ""
                } ${getReportStatusColor("Sample Collected")}`}
              >
                Sample Collected
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Completed"
                id="completed"
                disabled={isUpdating}
              />
              <Label
                htmlFor="completed"
                className={`${
                  isUpdating ? "opacity-50" : ""
                } ${getReportStatusColor("Completed")}`}
              >
                Completed
              </Label>
            </div>
          </RadioGroup>
          {isUpdating && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const TestCountDialog = () => {
    const totals = Object.values(testCounts).reduce(
      (acc, curr) => {
        acc.count += curr.count;
        acc.total += curr.total;
        acc.collected += curr.collected;
        acc.due += curr.due;
        return acc;
      },
      { count: 0, total: 0, collected: 0, due: 0 }
    );
    return (
      <Dialog open={showTestCountDialog} onOpenChange={setShowTestCountDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Test Wise Summary</DialogTitle>
            <DialogDescription>
              Summary of test counts, collections, and dues. Click a row to
              filter.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Test Name</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead className="text-right">Collected (₹)</TableHead>
                  <TableHead className="text-right">Due (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(testCounts)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([name, data]) => (
                    <TableRow
                      key={name}
                      onClick={() => handleTestCountClick(name)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium pr-4">{name}</TableCell>
                      <TableCell className="text-right pr-4">
                        {data.count}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        {formatCurrency(data.total)}
                      </TableCell>
                      <TableCell className="text-right pr-4 text-green-600">
                        {formatCurrency(data.collected)}
                      </TableCell>
                      <TableCell className="text-right pr-4 text-red-600">
                        {formatCurrency(data.due)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {totals.count}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totals.total)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totals.collected)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(totals.due)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hidden sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="w-full sm:w-auto">
              <CardTitle className="text-center sm:text-left text-2xl">
                Laboratory Tests
              </CardTitle>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{dateFilter}</span>
                  <span className="sm:hidden">Date</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setDateFilter("Today")}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDateFilter("Yesterday")}>
                  Yesterday
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDateFilter("This Week")}>
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDateFilter("Custom")}>
                  Custom Range
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{paymentStatusFilter}</span>
                  <span className="sm:hidden">Status</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setPaymentStatusFilter("All")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaymentStatusFilter("Paid")}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaymentStatusFilter("Due")}>
                  Due
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={handleShowTestCounts}
              className="w-full sm:w-auto"
            >
              <ListChecks className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Summary/Filter</span>
              <span className="sm:hidden">Summary</span>
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Registration</span>
              <span className="sm:hidden">New</span>
            </Button>
            {dateFilter === "Custom" && (
              <div className="col-span-2 sm:col-span-1">
                <DateRangePicker
                  from={tempDateRange.from}
                  to={tempDateRange.to}
                  onSelect={(range) => setTempDateRange(range)}
                  onSearch={handleDateRangeSearch}
                  onCancel={handleDateRangeCancel}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
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
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Test Status:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#b51616]"></span>
              <span>Registered</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f5a158]"></span>
              <span>Sample Collected</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <LabRegDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <LabDetailsModal
          isOpen={showDetailsModal}
          setShowModal={setShowDetailsModal}
          labData={selectedTest}
          hospitalInfo={hospitalInfo}
        />
        <TestStatusModal />
        <TestCountDialog />
        <LabPaymentDialog
          isOpen={showPaymentDialog}
          setIsOpen={setShowPaymentDialog}
          labData={selectedLabForPayment}
        />

        <LabEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          labData={selectedLabForEdit}
        />

        <AlertDialog
          open={!!labToDelete}
          onOpenChange={(open) => {
            if (!isDeleting && !open) {
              setLabToDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                lab registration for {labToDelete?.patientName} (Lab No:{" "}
                {labToDelete?.labNumber}) and all associated payment records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setLabToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col space-y-4 mb-4">
          {testFilter && (
          <div className="flex items-center">
            <Badge variant="success">
              {testFilter}
              <button
                className="ml-1 rounded-full p-0.5 hover:bg-background"
                onClick={() => setTestFilter(null)}
              >
                <X className="h-3 w-3 hover:text-red-500" />
              </button>
            </Badge>
          </div>
        )}
        </div>

        {isSmallScreen ? (
          filteredTests.length > 0 ? (
            <div className="space-y-4">
              {filteredTests.map((test, index) => (
                <TestCard key={test._id} test={test} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <UserX className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-600">
                No tests found
              </p>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl.</TableHead>
                  <TableHead>Lab No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Reg. Date</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test, index) => (
                  <TableRow key={test._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{test.labNumber}</TableCell>
                    <TableCell className="font-bold">
                      {`${test.patientName} ${
                        test.registrationNumber
                          ? `(${test.registrationNumber})`
                          : ""
                      }`}
                    </TableCell>
                    <TableCell>{test.contactNumber}</TableCell>
                    <TableCell>
                      {format(new Date(test.bookingDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-bold">
                      {test.labTests.map((t, index) => (
                        <span key={index}>
                          <button
                            onClick={() => handleTestClick(test, t)}
                            className={`${getReportStatusColor(
                              t.reportStatus
                            )} hover:underline cursor-pointer`}
                          >
                            {t.name}
                          </button>
                          {index < test.labTests.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${getStatusColor(test.status)} font-bold`}
                      >
                        {test.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-black">
                      {formatCurrency(
                        test.paymentInfo?.totalAmount -
                        test.paymentInfo?.additionalDiscount
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(test.paymentInfo.amountPaid)}
                    </TableCell>
                    <TableCell className="font-bold text-red-600">
                      {formatCurrency(test.paymentInfo.balanceDue)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(test)}
                          >
                            Print Bills
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePayments(test)}
                          >
                            Payments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate("/lab", { state: { patientData: test } })
                            }
                          >
                            Make Report
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleEdit(test)}>
                            Edit Registration
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(test)}
                            className="text-red-500"
                          >
                            Delete Registration
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
