import React, { useState, useEffect, useRef } from "react";
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
import { CalendarIcon, Filter, Search, X, FileX, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../redux/slices/paymentSlice";
import { setLoading } from "../redux/slices/loaderSlice";
import { Input } from "../components/ui/input";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, status } = useSelector((state) => state.payments);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [filters, setFilters] = useState({ type: "all" });
  const { toast } = useToast();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const componentRef = useRef();

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
              dateRange.from.setHours(0, 0, 0, 0)
            ).toISOString(),
            endDate: new Date(
              dateRange.to.setHours(23, 59, 59, 999)
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
      await dispatch(
        fetchPayments({
          type: filters.type,
          startDate: dateRangeParams?.startDate,
          endDate: dateRangeParams?.endDate,
        })
      ).unwrap();
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
    fetchPaymentsData();
  }, [dateFilter, dateRange]);

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

  const filteredPayments = payments.filter((payment) => {
    let searchMatch =
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.associatedInvoiceOrId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filters.type !== "all") {
      searchMatch = payment.type === filters.type;
    }
    return searchMatch;
  });

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

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payments List</CardTitle>
            <CardDescription>View and manage all payments</CardDescription>
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
        {/* Top Filters and Search – not printed */}
        <div className="flex flex-col space-y-4 mb-4 no-print">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative">
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
                      <Select
                        value={filters.type}
                        onValueChange={(value) =>
                          setFilters({ ...filters, type: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Income">CREDIT</SelectItem>
                          <SelectItem value="Expense">DEBIT</SelectItem>
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter}
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
              <div className="flex gap-2">
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Income">CREDIT</SelectItem>
                    <SelectItem value="Expense">DEBIT</SelectItem>
                  </SelectContent>
                </Select>

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
              </div>
            )}
          </div>
        </div>

        <div ref={componentRef} className="print-content">
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-4 print:block hidden">
              Payments Report
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-100">
                <CardContent className="p-4">
                  <h3 className="font-semibold">Total Credit</h3>
                  <p className="text-2xl">
                    ₹
                    {payments
                      .filter((p) => p.type === "Income")
                      .reduce((acc, p) => acc + p.amount, 0)
                      .toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-red-100">
                <CardContent className="p-4">
                  <h3 className="font-semibold">Total Debit</h3>
                  <p className="text-2xl">
                    ₹
                    {payments
                      .filter((p) => p.type === "Expense")
                      .reduce((acc, p) => acc + p.amount, 0)
                      .toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-100">
                <CardContent className="p-4">
                  <h3 className="font-semibold">Net Amount</h3>
                  <p className="text-2xl">
                    ₹
                    {(
                      payments
                        .filter((p) => p.type === "Income")
                        .reduce((acc, p) => acc + p.amount, 0) -
                      payments
                        .filter((p) => p.type === "Expense")
                        .reduce((acc, p) => acc + p.amount, 0)
                    ).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {filteredPayments.length > 0 ? (
              <div className="rounded-md border">
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
                        <TableCell>
                          {payment.description ||
                            payment.associatedInvoiceOrId ||
                            "--"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{payment.createdByName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
