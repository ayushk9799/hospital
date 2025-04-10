import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  UserIcon,
  ChartLine,
  Activity,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DateRangePicker, convertFilterToDateRange } from "../assets/Data";
import { fetchDashboardData } from "../redux/slices/dashboardSlice";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  addDays,
  endOfMonth,
  isWithinInterval,
  format,
  eachDayOfInterval,
  isSameDay,
  formatDistanceToNow,
} from "date-fns";
import { Pill } from "lucide-react";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useMediaQuery } from "../hooks/use-media-query";

const hasFinancialViewPermission = (userData) => {
  return userData?.permissions?.includes("view_financial") || false;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const { dashboardData, dashboardDataStatus } = useSelector(
    (state) => state.dashboard
  );
  const { patientlist } = useSelector((state) => state.patients);
  const [dateFilter, setDateFilter] = useState("Today");
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: null,
    to: null,
  });

  //

  const filteredData = useMemo(() => {
    if (typeof dashboardData !== "object" || dashboardData === null) {
      return { currentValue: [] };
    }

    const dataArray = Object.values(dashboardData);

    if (dateFilter === "Custom") {
      if (!selectedDateRange.from || !selectedDateRange.to) {
        return { currentValue: [] };
      }

      const startDate = startOfDay(selectedDateRange.from);
      const endDate = endOfDay(selectedDateRange.to);

      const currentValue = dataArray.filter((item) => {
        const itemDate = new Date(item.date);
        return isWithinInterval(itemDate, { start: startDate, end: endDate });
      });

      return { currentValue };
    }

    const dates = convertFilterToDateRange(dateFilter);
    const startDate = new Date(dates.from);
    const endDate = new Date(dates.to);

    const currentValue = dataArray.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    return { currentValue };
  }, [dashboardData, dateFilter, selectedDateRange]);

  const dashboardTotals = useMemo(() => {
    if (!Array.isArray(filteredData.currentValue)) {
      return {
        totalRevenue: 0,
        totalPatients: 0,
        totalAppointments: 0,
        totalExpense: 0,
        paymentMethods: {},
      };
    }
    const totals = filteredData.currentValue.reduce(
      (acc, curr) => {
        acc.totalRevenue += curr.revenue || 0;
        acc.totalPatients += curr.visitCount || 0;
        acc.totalAppointments += curr.ipdCount || 0;

        // Calculate total expense from expenseTypeWise
        acc.totalExpense += Object.values(curr.expenseTypeWise || {}).reduce(
          (sum, { total }) => sum + (total || 0),
          0
        );

        // Combine payment methods from services and pharmacy
        const allPaymentMethods = [
          ...(curr.services?.paymentMethod || []),
          ...(curr.pharmacy?.paymentMethod || []),
        ];

        allPaymentMethods.forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.paymentMethods[methodName])
            acc.paymentMethods[methodName] = 0;
          acc.paymentMethods[methodName] += method.revenue || 0;
        });

        return acc;
      },
      {
        totalRevenue: 0,
        totalPatients: 0,
        totalAppointments: 0,
        totalExpense: 0,
        paymentMethods: {},
      }
    );
    return totals;
  }, [filteredData]);

  const weeklyPerformanceData = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 0 }); // 0 for Sunday
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 0 });

    const weekDays = eachDayOfInterval({
      start: startOfThisWeek,
      end: endOfThisWeek,
    });

    const weekData = weekDays.map((day) => ({
      date: day,
      formattedDate: format(day, "EEE"),
      patients: 0,
      revenue: 0,
    }));

    if (typeof dashboardData === "object" && dashboardData !== null) {
      Object.values(dashboardData).forEach((day) => {
        const dayDate = new Date(day.date);
        if (
          isWithinInterval(dayDate, {
            start: startOfThisWeek,
            end: endOfThisWeek,
          })
        ) {
          const index = weekData.findIndex((d) => isSameDay(d.date, dayDate));
          if (index !== -1) {
            weekData[index].revenue = day.revenue || 0;
            weekData[index].patients = day.totalAppointments || 0;
          }
        }
      });
    }

    //
    return weekData;
  }, [dashboardData]);

  const hasWeeklyData = weeklyPerformanceData.some(
    (day) => day.patients > 0 || day.revenue > 0
  );

  useEffect(() => {
    fetchData("Today");
  }, []);

  // useEffect(() => {
  //   if (dateFilter !== "Custom") {
  //     fetchData(dateFilter);
  //   }
  // }, [dateFilter]);

  const fetchData = (filter) => {
    let startDate, endDate;
    const today = new Date();
    let range;

    switch (filter) {
      case "Today":
        startDate = startOfDay(today);
        endDate = endOfDay(today);
        break;
      case "Yesterday":
        startDate = startOfDay(subDays(today, 1));
        endDate = endOfDay(subDays(today, 1));
        break;
      case "Last 7 Days":
        startDate = startOfDay(subDays(today, 6));
        endDate = endOfDay(today);
        range = "Last 7 Days";
        break;
      case "This Week":
        startDate = startOfWeek(today, { weekStartsOn: 0 });
        endDate = endOfWeek(today, { weekStartsOn: 0 });
        range = "This Week";
        break;
      case "This Month":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        range = "This Month";
        break;
      case "All":
        startDate = new Date(0); // Beginning of time
        endDate = today;
        range = "All";
        break;
      case "Custom":
        if (!tempDateRange.from || !tempDateRange.to) {
          console.warn("Invalid date range selected");
          return;
        }
        startDate = tempDateRange.from;
        endDate = addDays(tempDateRange.to, 1);
        break;
      default:
        startDate = startOfDay(subDays(today, 6));
        endDate = endOfDay(today);
    }

    if (!startDate || !endDate) {
      console.warn("Invalid date range");
      return;
    }
  
    const ISO_time = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      range: range,
    };
    dispatch(fetchDashboardData(ISO_time));
  };

  // Update the calculateCollections function
  const calculateCollections = useMemo(() => {
    if (!Array.isArray(filteredData.currentValue)) {
      return {
        ipdCollection: 0,
        opdCollection: 0,
        opdprocedureCollection: 0,
        pharmacyCollection: 0,
        laboratoryCollection: 0,
      };
    }

    return filteredData.currentValue.reduce(
      (acc, curr) => {
        acc.ipdCollection += curr.ipd?.revenue || 0;
        acc.opdCollection += curr.opd?.revenue || 0;
        acc.opdprocedureCollection += curr.opdProcedures?.revenue || 0;
        acc.pharmacyCollection += curr.pharmacy?.revenue || 0;
        acc.laboratoryCollection += curr.laboratory?.revenue || 0;
        return acc;
      },
      {
        ipdCollection: 0,
        opdCollection: 0,
        opdprocedureCollection: 0,
        pharmacyCollection: 0,
        laboratoryCollection: 0,
      }
    );
  }, [filteredData]);

  // Update the calculatePaymentMethods function
  const calculatePaymentMethods = useMemo(() => {
    if (!Array.isArray(filteredData.currentValue)) {
      return {
        ipdPayments: [],
        opdPayments: [],
        opdprocedurePayments: [],
        pharmacyPayments: [],
        laboratoryPayments: [],
      };
    }

    const payments = filteredData.currentValue.reduce(
      (acc, curr) => {
        // IPD payments
        (curr.ipd?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.ipdPayments[methodName]) acc.ipdPayments[methodName] = 0;
          acc.ipdPayments[methodName] += method.revenue || 0;
        });

        // OPD payments
        (curr.opd?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.opdPayments[methodName]) acc.opdPayments[methodName] = 0;
          acc.opdPayments[methodName] += method.revenue || 0;
        });

        // OPD Procedure payments
        (curr.opdProcedures?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.opdprocedurePayments[methodName])
            acc.opdprocedurePayments[methodName] = 0;
          acc.opdprocedurePayments[methodName] += method.revenue || 0;
        });

        // Pharmacy payments
        (curr.pharmacy?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.pharmacyPayments[methodName])
            acc.pharmacyPayments[methodName] = 0;
          acc.pharmacyPayments[methodName] += method.revenue || 0;
        });

        // Laboratory payments
        (curr.laboratory?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.laboratoryPayments[methodName])
            acc.laboratoryPayments[methodName] = 0;
          acc.laboratoryPayments[methodName] += method.revenue || 0;
        });

        return acc;
      },
      {
        ipdPayments: {},
        opdPayments: {},
        opdprocedurePayments: {},
        pharmacyPayments: {},
        laboratoryPayments: {},
      }
    );

    const chartColors = {
      Cash: "hsl(var(--chart-1))",
      UPI: "hsl(var(--chart-2))",
      Card: "hsl(var(--chart-3))",
      Others: "hsl(var(--chart-4))",
    };

    return {
      ipdPayments: Object.entries(payments.ipdPayments).map(
        ([method, value]) => ({
          method,
          value,
          fill: chartColors[method] || "hsl(var(--chart-4))",
        })
      ),
      opdPayments: Object.entries(payments.opdPayments).map(
        ([method, value]) => ({
          method,
          value,
          fill: chartColors[method] || "hsl(var(--chart-4))",
        })
      ),
      opdprocedurePayments: Object.entries(payments.opdprocedurePayments).map(
        ([method, value]) => ({
          method,
          value,
          fill: chartColors[method] || "hsl(var(--chart-4))",
        })
      ),
      pharmacyPayments: Object.entries(payments.pharmacyPayments).map(
        ([method, value]) => ({
          method,
          value,
          fill: chartColors[method] || "hsl(var(--chart-4))",
        })
      ),
      laboratoryPayments: Object.entries(payments.laboratoryPayments).map(
        ([method, value]) => ({
          method,
          value,
          fill: chartColors[method] || "hsl(var(--chart-4))",
        })
      ),
    };
  }, [filteredData]);

  // First, add a new function to calculate total payment methods
  const calculateTotalPaymentMethods = useMemo(() => {
    const totalsByMethod = {};

    ["ipd", "opd", "opdprocedure", "pharmacy", "laboratory"].forEach((type) => {
      calculatePaymentMethods?.[`${type}Payments`]?.forEach((payment) => {
        if (!totalsByMethod[payment.method]) {
          totalsByMethod[payment.method] = 0;
        }
        totalsByMethod[payment.method] += payment.value || 0;
      });
    });

    return Object.entries(totalsByMethod).map(([method, value]) => ({
      method,
      value,
    }));
  }, [calculatePaymentMethods]);

  // Add this function to get the appropriate header text
  const getStatsHeaderText = () => {
    switch (dateFilter) {
      case "Today":
        return "Today's Stats";
      case "Yesterday":
        return "Yesterday's Stats";
      case "This Week":
        return "This Week's Stats";
      case "This Month":
        return "This Month's Stats";

      case "Custom":
        return "Custom Period Stats";
      default:
        return "Stats";
    }
  };

  const handleDateFilterChange = (newFilter) => {
    setDateFilter(newFilter);
    if (newFilter !== "Custom") {
      const newDateRange = convertFilterToDateRange(newFilter);
      setSelectedDateRange(newDateRange);
      fetchData(newFilter);
    }
  };

  const handleDateRangeSearch = () => {
    if (tempDateRange.from && tempDateRange.to) {
      setDateFilter("Custom");
      setSelectedDateRange(tempDateRange);
      fetchData("Custom");
    }
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateFilter("Today");
    fetchData("Today");
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section - More compact */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="font-bold text-xl text-gray-800">
            {getStatsHeaderText()}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Time Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("Today")}
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("Yesterday")}
              >
                Yesterday
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("This Week")}
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("This Month")}
              >
                This Month
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("Custom")}
              >
                Custom Range
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {dateFilter === "Custom" && (
          <div className="w-full sm:w-auto">
            <DateRangePicker
              from={tempDateRange?.from}
              to={tempDateRange?.to}
              onSelect={(range) => setTempDateRange(range)}
              onSearch={handleDateRangeSearch}
              onCancel={handleDateRangeCancel}
            />
          </div>
        )}
      </div>

      {/* Main Stats Grid - More efficient layout */}
      <div className="grid gap-4">
        {/* Patient Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-4">
          <Card
            className="bg-pink-100 shadow-sm lg:col-span-2 transition-all duration-200 
            hover:shadow-lg hover:scale-[1.02] hover:bg-pink-200 cursor-pointer"
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-pink-700" />
                <div>
                  <p className="text-2xl font-bold text-pink-700">
                    {dashboardTotals.totalPatients}
                  </p>
                  <p className="text-sm text-gray-600">OPD Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-orange-100 shadow-sm lg:col-span-2 transition-all duration-200 
            hover:shadow-lg hover:scale-[1.02] hover:bg-orange-200 cursor-pointer"
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-700" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {dashboardTotals.totalAppointments}
                  </p>
                  <p className="text-sm text-gray-600">IPD Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-purple-100 shadow-sm lg:col-span-3 transition-all duration-200 
            hover:shadow-lg hover:scale-[1.02] hover:bg-purple-200 cursor-pointer"
          >
            <CardContent className="p-3">
              <div className="flex gap-3">
                <ChartLine className="w-8 h-8 text-purple-700 shrink-0" />
                <div className="w-full">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div>
                      <p
                        className={`text-2xl font-bold text-purple-700 ${
                          !hasFinancialViewPermission(userData)
                            ? "blur-sm select-none"
                            : ""
                        }`}
                      >
                        {hasFinancialViewPermission(userData)
                          ? `₹${parseInt(
                              dashboardTotals.totalRevenue
                            ).toLocaleString()}`
                          : "₹XXXXX"}
                      </p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    {hasFinancialViewPermission(userData) && (
                      <div className="flex gap-2 flex-wrap justify-start lg:justify-end w-full lg:w-auto">
                        {calculateTotalPaymentMethods.map((payment) => (
                          <div
                            key={payment.method}
                            className="bg-purple-50 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-purple-100"
                          >
                            <p className="text-xs font-medium text-gray-600">
                              {payment.method}
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              ₹{parseInt(payment.value).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-blue-100 shadow-sm lg:col-span-3 transition-all duration-200 
            hover:shadow-lg hover:scale-[1.02] hover:bg-blue-200 cursor-pointer"
          >
            <CardContent className="p-3">
              <div className="flex gap-3">
                <ChartLine className="w-8 h-8 text-blue-700 shrink-0" />
                <div className="w-full">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div>
                      <p
                        className={`text-2xl font-bold text-blue-700 ${
                          !hasFinancialViewPermission(userData)
                            ? "blur-sm select-none"
                            : ""
                        }`}
                      >
                        {hasFinancialViewPermission(userData)
                          ? `₹${parseInt(
                              dashboardTotals.totalExpense
                            ).toLocaleString()}`
                          : "₹XXXXX"}
                      </p>
                      <p className="text-sm text-gray-600">Total Expense</p>
                    </div>

                    {hasFinancialViewPermission(userData) && (
                      <div className="flex gap-2 flex-wrap justify-start lg:justify-end w-full lg:w-auto">
                        {Object.entries(
                          filteredData.currentValue[0]?.expenseTypeWise || {}
                        ).map(
                          ([method, details]) =>
                            details.total > 0 && (
                              <div
                                key={method}
                                className="bg-blue-50 px-2 py-1 rounded-md transition-colors 
                                duration-200 hover:bg-blue-100"
                              >
                                <p className="text-xs font-medium text-gray-600">
                                  {method.charAt(0).toUpperCase() +
                                    method.slice(1)}
                                </p>
                                <p className="text-sm font-bold text-gray-700">
                                  ₹{parseInt(details.total).toLocaleString()}
                                </p>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {["IPD", "OPD", "OPD Procedure", "Pharmacy", "Laboratory"].map(
            (type, index) => (
              <Card
                key={type}
                className={`bg-${getBackgroundColor(index)}-100 shadow-sm 
                  transition-all duration-200 hover:shadow-lg hover:scale-[1.02] 
                  hover:bg-${getBackgroundColor(index)}-200 cursor-pointer`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Activity
                      className={`w-6 h-6 text-${getBackgroundColor(
                        index
                      )}-700`}
                    />
                    <div>
                      <p
                        className={`text-xl font-bold text-${getBackgroundColor(
                          index
                        )}-700 ${
                          !hasFinancialViewPermission(userData)
                            ? "blur-sm select-none"
                            : ""
                        }`}
                      >
                        {hasFinancialViewPermission(userData)
                          ? `₹${parseInt(
                              calculateCollections[
                                `${type
                                  .toLowerCase()
                                  .replace(/\s+/g, "")}Collection`
                              ]
                            ).toLocaleString()}`
                          : "₹XXXXX"}
                      </p>
                      <p className="text-xs text-gray-600">{type} Collection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Payment Methods Grid - More compact and efficient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {["IPD", "OPD", "OPD Procedure", "Pharmacy", "Laboratory"].map(
            (type) => (
              <Card
                key={type}
                className="shadow-sm transition-all duration-200 
                  hover:shadow-lg hover:scale-[1.02] hover:bg-gray-50"
              >
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm">{type} Payments</CardTitle>
                </CardHeader>
                <CardContent className="p-1">
                  {!hasFinancialViewPermission(userData) ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                      <AlertCircle className="w-8 h-8 mb-1" />
                      <p className="text-xs text-center">No permission</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {calculatePaymentMethods?.[
                        `${type?.replace(" ", "")?.toLowerCase()}Payments`
                      ]?.map((method) => (
                        <div
                          key={method.method}
                          className="bg-gray-50 p-2 rounded transition-colors 
                            duration-200 hover:bg-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">
                              {method.method}
                            </span>
                            <span className="text-sm font-bold">
                              ₹{parseInt(method.value).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Net Revenue Section */}
        {hasFinancialViewPermission(userData) && (
          <div className="mt-4">
            <Card className="max-w-2xl mx-auto shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold">
                  Net Amount Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Net Revenue Calculation */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹
                        {parseInt(
                          dashboardTotals.totalRevenue
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xl">-</div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-gray-600">Total Expense</p>
                      <p className="text-lg font-bold text-red-600">
                        ₹
                        {parseInt(
                          dashboardTotals.totalExpense
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xl">=</div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-gray-600">Net Revenue</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹
                        {parseInt(
                          dashboardTotals.totalRevenue -
                            dashboardTotals.totalExpense
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Total Payment Methods */}
                 
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for background colors
const getBackgroundColor = (index) => {
  const colors = ["blue", "green", "purple", "orange", "pink"];
  return colors[index];
};

export default Dashboard;
