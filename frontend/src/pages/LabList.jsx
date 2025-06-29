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
  DialogTrigger,
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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLabForEdit, setSelectedLabForEdit] = useState(null);
  const [labToDelete, setLabToDelete] = useState(null);
  const [showTestCountDialog, setShowTestCountDialog] = useState(false);
  const [testCounts, setTestCounts] = useState({});
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
        setFilteredTests(filtered);
      } else {
        // If no local results, search in backend
        dispatch(searchLabRegistrations(searchTerm));
      }
    } else {
      setFilteredTests(registrations);
      dispatch(clearSearchResults());
    }
  }, [searchTerm, registrations, dispatch]);

  // Add new useEffect to handle search results
  useEffect(() => {
    if (searchResults.length > 0) {
      setFilteredTests(searchResults);
    }
  }, [searchResults]);

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
    setOpenDropdownId(null);
  };

  const handleEdit = (test) => {
    setSelectedLabForEdit(test);
    setShowEditDialog(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (test) => {
    setLabToDelete(test);
    setOpenDropdownId(null);
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

  const handleShowTestCounts = () => {
    const counts = filteredTests.reduce((acc, registration) => {
      if (registration.labTests) {
        registration.labTests.forEach((test) => {
          acc[test.name] = (acc[test.name] || 0) + 1;
        });
      }
      return acc;
    }, {});
    setTestCounts(counts);
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

  const TestCountDialog = () => (
    <Dialog open={showTestCountDialog} onOpenChange={setShowTestCountDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Test Counts</DialogTitle>
          <DialogDescription>
            The number of times each test appears list.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(testCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );

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
              <CardTitle className="text-center sm:text-left">
                Laboratory Tests
              </CardTitle>
              <CardDescription className="hidden sm:block">
                Manage and view lab test records
              </CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Registration</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShowTestCounts}
              className="w-full sm:w-auto"
            >
              <ListChecks className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Test Counts</span>
              <span className="sm:hidden">Counts</span>
            </Button>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search using Lab Number, UHID No or Contact Number..."
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
            <div className="flex items-center gap-4 mb-4 text-sm">
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
        </div>

        {/* Status Legend */}

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
                  {dateFilter === "Today" && <TableHead>Sl.</TableHead>}
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
                    {dateFilter === "Today" && (
                      <TableCell className="font-medium">{index + 1}</TableCell>
                    )}
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
                      ₹
                      {(
                        test.paymentInfo?.totalAmount -
                        test.paymentInfo?.additionalDiscount
                      ).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ₹{test.paymentInfo.amountPaid?.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-bold text-red-600">
                      ₹{test.paymentInfo.balanceDue?.toLocaleString("en-IN")}
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
