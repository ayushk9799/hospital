import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLabRegistrations,
  updateTestStatus,
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
  Filter,
  Calendar as CalendarIcon,
  X,
  UserX,
  MoreVertical,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useMediaQuery } from "../hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
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
} from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";

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

  const {
    registrations,
    registrationsStatus,
    error,
    updateTestStatus: updateStatus,
  } = useSelector((state) => state.lab);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [filteredTests, setFilteredTests] = useState([]);

  const isUpdating = updateStatus === "loading";

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
    const filtered = registrations.filter(
      (test) =>
        test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.labNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.contactNumber?.includes(searchTerm) ||
        test.labTests?.some((t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredTests(filtered);
  }, [searchTerm, registrations]);

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

  const TestCard = ({ test }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
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
                className={`${isUpdating ? "opacity-50" : ""} ${getReportStatusColor(
                  "Registered"
                )}`}
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
                className={`${isUpdating ? "opacity-50" : ""} ${getReportStatusColor(
                  "Sample Collected"
                )}`}
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
                className={`${isUpdating ? "opacity-50" : ""} ${getReportStatusColor(
                  "Completed"
                )}`}
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

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>Laboratory Tests</CardTitle>
              <CardDescription>
                Manage and view lab test records
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Registration
          </Button>
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

        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
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

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter}
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
                <DateRangePicker
                  from={tempDateRange.from}
                  to={tempDateRange.to}
                  onSelect={(range) => setTempDateRange(range)}
                  onSearch={handleDateRangeSearch}
                  onCancel={handleDateRangeCancel}
                />
              )}
            </div>
          </div>
        </div>

        {isSmallScreen ? (
          filteredTests.length > 0 ? (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <TestCard key={test._id} test={test} />
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
                  <TableHead>Lab Number</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell>{test.labNumber}</TableCell>
                    <TableCell>{test.patientName}</TableCell>
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
                    <TableCell>
                      ₹{test.paymentInfo.totalAmount.toLocaleString("en-IN")}
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
                            onClick={() =>
                              navigate("/lab", { state: { patientData: test } })
                            }
                          >
                            Make Report
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => handleExistingBills(test)}
                          >
                            Print Bill
                          </DropdownMenuItem> */}
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
