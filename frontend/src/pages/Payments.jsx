import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
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
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { DateRangePicker } from "../assets/Data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import {
  CalendarIcon,
  Filter,
  Search,
  X,
  FileX,
  Printer,
  ListFilter,
  ChevronLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../redux/slices/paymentSlice";
import { setLoading } from "../redux/slices/loaderSlice";
import { Input } from "../components/ui/input";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import { fetchStaffMembers } from "../redux/slices/staffSlice";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, status } = useSelector((state) => state.payments);
  const { userData } = useSelector((state) => state.user);
  const { staffMembers } = useSelector((state) => state.staff);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("All");
  const [staffAccountFilter, setStaffAccountFilter] = useState({
    name: "All Staff",
    id: "",
  });
  const { toast } = useToast();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const componentRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case "Today":
        return {
          startDate: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
        };
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: new Date(yesterday.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(yesterday.setHours(23, 59, 59, 999)).toISOString(),
        };
      case "This Week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return {
          startDate: new Date(weekStart.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
        };
      case "Custom":
        if (dateRange.from && dateRange.to) {
          return {
            startDate: new Date(
              dateRange.from?.setHours(0, 0, 0, 0)
            ).toISOString(),
            endDate: new Date(
              dateRange.to?.setHours(23, 59, 59, 999)
            ).toISOString(),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const fetchPaymentsData = async () => {
    try {
      dispatch(setLoading(true));
      const dateRangeParams = getDateRange();
      if (dateRangeParams?.startDate && dateRangeParams?.endDate) {
        await dispatch(
          fetchPayments({
            startDate: dateRangeParams?.startDate,
            endDate: dateRangeParams?.endDate,
          })
        ).unwrap();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (status === "idle") {
      fetchPaymentsData();
    }
  }, [status]);

  useEffect(() => {
    // Handle filters from Statistics page
    if (location.state?.paymentCategoryFilter) {
      setPaymentCategoryFilter(location.state.paymentCategoryFilter);
    }
    if (location.state?.paymentTypeFilter) {
      setPaymentTypeFilter(location.state.paymentTypeFilter);
    }
    if (location.state?.dateFilter) {
      setDateFilter(location.state.dateFilter);
      if (location.state.dateRange && location.state.dateFilter === "Custom") {
        setDateRange(location.state.dateRange);
        setTempDateRange(location.state.dateRange);
      }
    }
  }, [location.state]);

  useEffect(() => {
    fetchPaymentsData();
  }, [dateFilter, dateRange, searchTerm]);

  useEffect(() => {
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange);
    setDateFilter("Custom");
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateFilter("Today");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const hasAllCollectionPermission = userData?.permissions?.includes(
        "view_otherscollection_all"
      );
      const hasTodayCollectionPermission = userData?.permissions?.includes(
        "view_otherscollection_for_just_today"
      );
      // 1. Permission Check (moved to the beginning)
      if (payment.createdBy?._id !== userData?._id && payment.createdBy?._id) {
        if (!hasAllCollectionPermission && !hasTodayCollectionPermission) {
          return false; // No permissions to view others' payments
        }
        if (hasTodayCollectionPermission && !hasAllCollectionPermission) {
          const today = new Date();
          const paymentDate = new Date(payment.createdAt);
          const isTodayPayment =
            paymentDate.getDate() === today.getDate() &&
            paymentDate.getMonth() === today.getMonth() &&
            paymentDate.getFullYear() === today.getFullYear();
          if (!isTodayPayment) {
            return false; // No permission to view others' payments for other days
          }
        }
      }
      // 2. Payment Category Filter
      if (
        paymentCategoryFilter !== "All" &&
        payment.paymentType?.name !== paymentCategoryFilter
      ) {
        return false;
      }

      // 3. Payment Type Filter
      if (paymentTypeFilter !== "All" && payment.type !== paymentTypeFilter) {
        return false;
      }

      // 4. Staff Account Filter
      if (
        staffAccountFilter.id &&
        payment.createdBy?._id !== staffAccountFilter.id
      ) {
        return false;
      }

      // 5. Search Term Filter
      if (searchTerm) {
        const searchText = searchTerm.toLowerCase();
        const searchableFields = [
          payment.description,
          payment.paymentMethod,
          payment.paymentType?.name,
          payment.createdByName,
          payment.createdBy?.name,
          formatDate(payment.createdAt),
          formatTime(payment.createdAt),
          payment.amount?.toString(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchText)) {
          return false;
        }
      }

      return true; // Payment passed all filters
    });
  }, [
    payments,
    paymentTypeFilter,
    staffAccountFilter,
    searchTerm,
    userData,
    paymentCategoryFilter,
  ]);
  // Calculate totals based on filtered payments
  const totalCredit = filteredPayments
    .filter((p) => p.type === "Income")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalDebit = filteredPayments
    .filter((p) => p.type === "Expense")
    .reduce((acc, p) => acc + p.amount, 0);

  const netAmount = totalCredit - totalDebit;

  const methodTotals = useMemo(() => {
    const methods = {};
    filteredPayments.forEach((payment) => {
      if (!methods[payment.paymentMethod]) {
        methods[payment.paymentMethod] = { credit: 0, debit: 0 };
      }
      if (payment.type === "Income") {
        methods[payment.paymentMethod].credit += payment.amount;
      } else {
        methods[payment.paymentMethod].debit += payment.amount;
      }
    });
    return methods;
  }, [filteredPayments]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        resolve();
      });
    },
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 5mm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-section {
          display: block !important;
          padding: 5px;
        }
        .no-print {
          display: none !important;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
          padding: 10px;
        }
      }
    `,
  });

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
              <CardTitle>Payments List</CardTitle>
              <CardDescription>View and manage all payments</CardDescription>
            </div>
          </div>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 no-print"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-4 no-print">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
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
                    <div className="space-y-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {paymentCategoryFilter === "All"
                              ? "Payment Category"
                              : paymentCategoryFilter}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[200px]"
                        >
                          <DropdownMenuLabel>
                            Filter by Category
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setPaymentCategoryFilter("All")}
                          >
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPaymentCategoryFilter("IPD")}
                          >
                            IPD
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPaymentCategoryFilter("OPD")}
                          >
                            OPD
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              setPaymentCategoryFilter("OPDProcedure")
                            }
                          >
                            OPD Procedure
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              setPaymentCategoryFilter("Laboratory")
                            }
                          >
                            Laboratory
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <ListFilter className="mr-2 h-4 w-4" />
                              {paymentTypeFilter === "All"
                                ? "Payment Type"
                                : paymentTypeFilter}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[200px]"
                          >
                            <DropdownMenuLabel>
                              Filter by Payment Type
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => setPaymentTypeFilter("All")}
                            >
                              All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setPaymentTypeFilter("Income")}
                            >
                              Credit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setPaymentTypeFilter("Expense")}
                            >
                              Debit
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
                      </>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {staffAccountFilter.name === "All Staff"
                              ? "All Staff"
                              : staffAccountFilter.name}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[200px]"
                        >
                          <DropdownMenuLabel>
                            Filter by Staff Account
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              setStaffAccountFilter({
                                name: "All Staff",
                                id: "",
                              })
                            }
                          >
                            All Staff
                          </DropdownMenuItem>
                          {staffMembers?.map((staff) => (
                            <DropdownMenuItem
                              key={staff._id}
                              onSelect={() =>
                                setStaffAccountFilter({
                                  name: staff.name,
                                  id: staff._id,
                                })
                              }
                            >
                              {staff.name}
                            </DropdownMenuItem>
                          ))}
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
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <ListFilter className="mr-2 h-4 w-4" />
                      {paymentCategoryFilter === "All"
                        ? "Payment Category"
                        : paymentCategoryFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setPaymentCategoryFilter("All")}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentCategoryFilter("IPD")}
                    >
                      IPD
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentCategoryFilter("OPD")}
                    >
                      OPD
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentCategoryFilter("OPDProcedure")}
                    >
                      OPD Procedure
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentCategoryFilter("Laboratory")}
                    >
                      Laboratory
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <ListFilter className="mr-2 h-4 w-4" />
                      {paymentTypeFilter === "All"
                        ? "Payment Type"
                        : paymentTypeFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>
                      Filter by Payment Type
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setPaymentTypeFilter("All")}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentTypeFilter("Income")}
                    >
                      Income
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setPaymentTypeFilter("Expense")}
                    >
                      Expense
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter}
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

                {(userData?.permissions?.includes(
                  "view_otherscollection_all"
                ) ||
                  userData?.permissions?.includes(
                    "view_otherscollection_for_just_today"
                  )) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <ListFilter className="mr-2 h-4 w-4" />
                        {staffAccountFilter.name === "All Staff"
                          ? "All Staffs"
                          : staffAccountFilter.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuLabel>
                        Filter by Staff Account
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() =>
                          setStaffAccountFilter({
                            name: "All Staff",
                            id: "",
                          })
                        }
                      >
                        All Staff
                      </DropdownMenuItem>
                      {staffMembers?.map((staff) => (
                        <DropdownMenuItem
                          key={staff._id}
                          onSelect={() =>
                            setStaffAccountFilter({
                              name: staff.name,
                              id: staff._id,
                            })
                          }
                        >
                          {staff.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>

        <div ref={componentRef} className="print-content">
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-4 print:block hidden">
              Payments Report
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div
                className="hidden md:grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${
                    Object.keys(methodTotals).length + 3
                  }, minmax(0, 1fr))`,
                }}
              >
                <Card className="bg-blue-100">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">Total Credit</h3>
                    <p className="text-xl">
                      ₹
                      {Number(totalCredit?.toFixed(2))?.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-100">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">Total Debit</h3>
                    <p className="text-xl">
                      ₹{Number(totalDebit?.toFixed(2))?.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-100">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">Net Amount</h3>
                    <p className="text-xl">
                      ₹{Number(netAmount?.toFixed(2))?.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>

                {Object.entries(methodTotals).map(([method, totals]) => (
                  <Card key={method} className="bg-purple-100">
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1">{method}</h3>
                      <div className="flex justify-between text-sm">
                        <div className="text-green-600 font-bold text-xl">
                          +₹
                          {Number(totals.credit.toFixed(2)).toLocaleString(
                            "en-IN"
                          )}
                        </div>
                        <div className="text-red-600 font-bold text-xl">
                          -₹
                          {Number(totals.debit.toFixed(2)).toLocaleString(
                            "en-IN"
                          )}
                        </div>
                      </div>
                      <div className="text-xl text-center font-bold mt-1">
                        Net: ₹
                        {Number(
                          (totals.credit - totals.debit).toFixed(2)
                        ).toLocaleString("en-IN")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile view for summary cards */}
              <div className="grid md:hidden gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-blue-100">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm">Total Credit</h3>
                      <p className="text-xl">
                        ₹
                        {Number(totalCredit?.toFixed(2))?.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-100">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm">Total Debit</h3>
                      <p className="text-xl">
                        ₹
                        {Number(totalDebit?.toFixed(2))?.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-green-100">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">Net Amount</h3>
                    <p className="text-xl">
                      ₹{Number(netAmount?.toFixed(2))?.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(methodTotals).map(([method, totals]) => (
                    <Card key={method} className="bg-purple-100">
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-1">{method}</h3>
                        <div className="flex justify-between text-sm">
                          <div className="text-green-600 font-bold text-xl">
                            +₹
                            {Number(totals.credit.toFixed(2)).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                          <div className="text-red-600 font-bold text-xl">
                            -₹
                            {Number(totals.debit.toFixed(2)).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                        <div className="text-xl text-center font-bold mt-1">
                          Net: ₹
                          {Number(
                            (totals.credit - totals.debit).toFixed(2)
                          ).toLocaleString("en-IN")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {filteredPayments.length > 0 ? (
              <>
                {/* Table view for larger screens */}
                <div className="hidden md:block rounded-md border">
                  <Table className="border-2 border-gray-200">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>
                            {formatDate(payment.createdAt)}{" "}
                            {formatTime(payment.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.type === "Income"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {payment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="font-medium">
                            {payment.description ||
                              (payment.associatedInvoiceOrId
                                ? payment.associatedInvoiceOrId
                                : "") +
                                " " +
                                payment.paymentType?.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{payment.amount?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {payment.createdByName ||
                              payment.createdBy?.name ||
                              "--"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Card view for mobile screens */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filteredPayments.map((payment) => (
                    <Card key={payment._id} className="p-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              payment.type === "Income"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {payment.type}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}{" "}
                            {formatTime(payment.createdAt)}
                          </p>
                        </div>
                        <p className="text-base font-bold">
                          ₹
                          {Number(payment.amount?.toFixed(2)).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-500">Method:</span>
                          <span>{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-500">Description:</span>
                          <span className="text-right">
                            {payment.description ||
                              payment.associatedInvoiceOrId ||
                              payment.paymentType?.name}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-500">Created By:</span>
                          <span>
                            {payment.createdByName ||
                              payment.createdBy?.name ||
                              "--"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <FileX className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-600">
                  No payments found
                </p>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Payments;
