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
  endOfMonth,
  isWithinInterval,
  format,
  eachDayOfInterval,
  isSameDay,
  formatDistanceToNow,
} from "date-fns";
import { Pill } from "lucide-react";
import { PieChart, Pie, Cell, Label } from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();
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

  const recentPatients = useMemo(() => {
    return [...patientlist]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map((patient) => ({
        _id: patient._id,
        name: patient.patient.name,
        time: formatDistanceToNow(new Date(patient.createdAt), {
          addSuffix: true,
        }),
        type: patient.type || "OPD",
        avatar: patient.patient.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      }));
  }, [patientlist]);

  //

  const filteredData = useMemo(() => {
    if (typeof dashboardData !== "object" || dashboardData === null) {
      // console.error("dashboardData is not an object:", dashboardData);
      return { currentValue: [], previousValue: [] };
    }

    const dataArray = Object.values(dashboardData);

    if (dateFilter === "Custom")
      return { currentValue: dataArray, previousValue: [] };
    const dates = convertFilterToDateRange(dateFilter);
    const startDate = new Date(dates.from);
    const endDate = new Date(dates.to);
    let previousStartDate, previousEndDate;

    if (dateFilter === "Today") {
      previousStartDate = startOfDay(subDays(startDate, 1));
      previousEndDate = endOfDay(subDays(endDate, 1));
    } else if (dateFilter === "Yesterday") {
      previousStartDate = startOfDay(subDays(startDate, 1));
      previousEndDate = endOfDay(subDays(endDate, 1));
    } else if (dateFilter === "This Week") {
      previousStartDate = startOfWeek(subDays(startDate, 7));
      previousEndDate = endOfWeek(subDays(endDate, 7));
    } else if (dateFilter === "This Month") {
      previousStartDate = startOfMonth(subDays(startDate, 30));
      previousEndDate = endOfMonth(subDays(endDate, 30));
    } else {
      previousStartDate = null;
      previousEndDate = null;
    }

    const currentValue = dataArray.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
    const previousValue =
      previousStartDate && previousEndDate
        ? dataArray.filter((item) => {
            const itemDate = new Date(item.date);
            return isWithinInterval(itemDate, {
              start: previousStartDate,
              end: previousEndDate,
            });
          })
        : [];
    return { currentValue, previousValue };
  }, [dashboardData, dateFilter]);

  const dashboardTotals = useMemo(() => {
    //

    if (!Array.isArray(filteredData.currentValue)) {
      // console.error("filteredData.currentValue is not an array:", filteredData.currentValue);
      return {
        totalRevenue: 0,
        totalPatients: 0,
        totalAppointments: 0,
        paymentMethods: {},
      };
    }

    const totals = filteredData.currentValue.reduce(
      (acc, curr) => {
        acc.totalRevenue += curr.revenue || 0;
        acc.totalPatients += curr.uniquePatientCount || 0;
        acc.totalAppointments += curr.totalAppointments || 0;

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
    if (dashboardDataStatus === "idle") {
      fetchData("Last 7 Days");
    }
  }, [dashboardDataStatus, dispatch]);

  useEffect(() => {
    if (dateFilter !== "Custom") {
      fetchData(dateFilter);
    }
  }, [dateFilter]);

  const fetchData = (filter) => {
    let startDate, endDate;
    const today = new Date();
    let range;

    switch (filter) {
      case "Today":
      case "Yesterday":
      case "Last 7 Days":
        startDate = startOfDay(subDays(today, 6));
        endDate = endOfDay(today);
        range = "Last 7 Days";
        break;
      case "This Week":
        startDate = startOfWeek(subDays(today, 7), { weekStartsOn: 0 });
        endDate = endOfWeek(today, { weekStartsOn: 0 });
        range = "This Week";
        break;
      case "This Month":
        startDate = startOfMonth(subDays(today, 30));
        endDate = endOfMonth(today);
        range = "This Month";
        break;
      case "All":
        startDate = new Date(0); // Beginning of time
        endDate = today;
        range = "All";
        break;
      case "Custom":
        startDate = selectedDateRange.from;
        endDate = selectedDateRange.to;
        break;
      default:
        startDate = startOfDay(subDays(today, 6));
        endDate = endOfDay(today);
    }

    const ISO_time = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      range: range,
    };

    dispatch(fetchDashboardData(ISO_time));
  };

  const calculatePercentageChanges = useMemo(() => {
    if (filteredData.currentValue && filteredData.previousValue) {
      const calculateChange = (key) => {
        const currentValue = filteredData.currentValue.reduce(
          (sum, day) => sum + (day[key] || 0),
          0
        );
        const previousValue = filteredData.previousValue.reduce(
          (sum, day) => sum + (day[key] || 0),
          0
        );

        if (previousValue === 0) return 100; // If previous value was 0, consider it as 100% increase

        const percentageChange =
          ((currentValue - previousValue) / previousValue) * 100;
        return percentageChange.toFixed(2);
      };

      return {
        totalRevenue: calculateChange("revenue"),
        serviceCollection: calculateChange("services.revenue"),
        pharmacyCollection: calculateChange("pharmacy.revenue"),
        totalPatients: calculateChange("uniquePatientCount"),
        totalAppointments: calculateChange("totalAppointments"),
      };
    }
    return {
      totalRevenue: null,
      serviceCollection: null,
      pharmacyCollection: null,
      totalPatients: null,
      totalAppointments: null,
    };
  }, [filteredData]);

  const getComparisonText = () => {
    switch (dateFilter) {
      case "Today":
        return "from yesterday";
      case "Yesterday":
        return "from day before";
      case "This Week":
        return "from last week";
      case "This Month":
        return "from last month";
      default:
        return "";
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
    setDateFilter("Custom");
    setSelectedDateRange(tempDateRange);
    fetchData("Custom");
  };

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setDateFilter("Today");
    fetchData("Today");
  };

  // Add this new function to calculate service and pharmacy collections
  const calculateCollections = useMemo(() => {
    if (!Array.isArray(filteredData.currentValue)) {
      return { serviceCollection: 0, pharmacyCollection: 0 };
    }

    return filteredData.currentValue.reduce(
      (acc, curr) => {
        acc.serviceCollection += curr.services?.revenue || 0;
        acc.pharmacyCollection += curr.pharmacy?.revenue || 0;
        return acc;
      },
      { serviceCollection: 0, pharmacyCollection: 0 }
    );
  }, [filteredData]);

  // Add this new function to calculate service and pharmacy payment methods
  const calculatePaymentMethods = useMemo(() => {
    if (!Array.isArray(filteredData.currentValue)) {
      return { servicePayments: [], pharmacyPayments: [] };
    }

    const payments = filteredData.currentValue.reduce(
      (acc, curr) => {
        // Service payments
        (curr.services?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.servicePayments[methodName])
            acc.servicePayments[methodName] = 0;
          acc.servicePayments[methodName] += method.revenue || 0;
        });

        // Pharmacy payments
        (curr.pharmacy?.paymentMethod || []).forEach((method) => {
          const methodName = method.method || "Others";
          if (!acc.pharmacyPayments[methodName])
            acc.pharmacyPayments[methodName] = 0;
          acc.pharmacyPayments[methodName] += method.revenue || 0;
        });

        return acc;
      },
      { servicePayments: {}, pharmacyPayments: {} }
    );

    const chartColors = {
      Cash: "hsl(var(--chart-1))",
      UPI: "hsl(var(--chart-2))",
      Card: "hsl(var(--chart-3))",
      Others: "hsl(var(--chart-4))",
    };

    return {
      servicePayments: Object.entries(payments.servicePayments).map(
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
    };
  }, [filteredData]);

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
      case "All":
        return "All Time Stats";
      case "Custom":
        return "Custom Period Stats";
      default:
        return "Stats";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <h2 className="font-bold text-xl text-gray-800">Dashboard</h2>
        <div className="flex items-center space-x-4">
          {dateFilter === "Custom" && (
            <DateRangePicker
              from={tempDateRange.from}
              to={tempDateRange.to}
              onSelect={(range) => setTempDateRange(range)}
              onSearch={handleDateRangeSearch}
              onCancel={handleDateRangeCancel}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter === "All" ? "All Time" : dateFilter}
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
              <DropdownMenuItem onSelect={() => handleDateFilterChange("All")}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleDateFilterChange("Custom")}
              >
                Custom Range
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Stats summary */}
        <div className="bg-white p-4 rounded-xl shadow w-1/2">
          <h2 className="font-bold text-xl text-violet-950 mb-2">
            {getStatsHeaderText()}
          </h2>
          <p className="text-gray-600 mb-2 text-sm">Patients summary</p>
          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-pink-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <UserIcon className="w-10 h-10 text-pink-600" />
                    <p className="text-2xl font-bold text-pink-600">
                      {dashboardTotals.totalPatients}
                    </p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    {calculatePercentageChanges.totalPatients !== null &&
                      dateFilter !== "Custom" &&
                      dateFilter !== "All" && (
                        <p
                          className={`text-xs ${
                            calculatePercentageChanges.totalPatients >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          } mt-1`}
                        >
                          {calculatePercentageChanges.totalPatients >= 0
                            ? "+"
                            : ""}
                          {calculatePercentageChanges.totalPatients}%{" "}
                          {getComparisonText()}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Calendar className="w-10 h-10 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardTotals.totalAppointments}
                    </p>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    {calculatePercentageChanges.totalAppointments !== null &&
                      dateFilter !== "Custom" &&
                      dateFilter !== "All" && (
                        <p
                          className={`text-xs ${
                            calculatePercentageChanges.totalAppointments >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          } mt-1`}
                        >
                          {calculatePercentageChanges.totalAppointments >= 0
                            ? "+"
                            : ""}
                          {calculatePercentageChanges.totalAppointments}%{" "}
                          {getComparisonText()}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <ChartLine className="w-10 h-10 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{parseInt(dashboardTotals.totalRevenue).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    {calculatePercentageChanges.totalRevenue !== null &&
                      dateFilter !== "Custom" &&
                      dateFilter !== "All" && (
                        <p
                          className={`text-xs ${
                            calculatePercentageChanges.totalRevenue >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          } mt-1`}
                        >
                          {calculatePercentageChanges.totalRevenue >= 0
                            ? "+"
                            : ""}
                          {calculatePercentageChanges.totalRevenue}%{" "}
                          {getComparisonText()}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          {/* Add new cards for Service and Pharmacy Collections */}
          <section className="grid gap-6 lg:grid-cols-2 mt-4">
            <Card className="bg-blue-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Activity className="w-10 h-10 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">
                      ₹
                      {parseInt(
                        calculateCollections.serviceCollection
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Service Collection</p>
                    {calculatePercentageChanges.serviceCollection !== null &&
                      dateFilter !== "Custom" &&
                      dateFilter !== "All" && (
                        <p
                          className={`text-xs ${
                            calculatePercentageChanges.serviceCollection >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          } mt-1`}
                        >
                          {calculatePercentageChanges.serviceCollection >= 0
                            ? "+"
                            : ""}
                          {calculatePercentageChanges.serviceCollection}%{" "}
                          {getComparisonText()}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Pill className="w-10 h-10 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      ₹
                      {parseInt(
                        calculateCollections.pharmacyCollection
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Pharmacy Collection</p>
                    {calculatePercentageChanges.pharmacyCollection !== null &&
                      dateFilter !== "Custom" &&
                      dateFilter !== "All" && (
                        <p
                          className={`text-xs ${
                            calculatePercentageChanges.pharmacyCollection >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          } mt-1`}
                        >
                          {calculatePercentageChanges.pharmacyCollection >= 0
                            ? "+"
                            : ""}
                          {calculatePercentageChanges.pharmacyCollection}%{" "}
                          {getComparisonText()}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Weekly Performance Graph */}
        <div className="w-1/2">
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>
                Patient visits and Revenue for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasWeeklyData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPerformanceData}>
                    <XAxis dataKey="formattedDate" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#60a5fa"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="patients"
                      fill="#2563eb"
                      name="Patients"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="revenue"
                      fill="#60a5fa"
                      name="Revenue (₹)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <AlertCircle className="w-12 h-12 mb-2" />
                  <p className="text-lg font-semibold">
                    No data available for this week
                  </p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New row for Payment Method Distribution */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Latest admitted patients</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPatients.length > 0 ? (
                <div className="space-y-5">
                  {recentPatients.map((patient, index) => (
                    <div key={patient._id} className="flex items-center">
                      <p className="font-semibold mr-5 text-xl">{index + 1}</p>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{patient.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {patient.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.time}
                        </p>
                      </div>
                      <Badge
                        className={`ml-auto ${
                          patient.type === "IPD"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {patient.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <AlertCircle className="w-12 h-12 mb-2" />
                  <p className="text-lg font-semibold">No recent patients</p>
                  <p className="text-sm">New patients will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Service Payment Methods */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Service Payment Methods</CardTitle>
            <CardDescription>
              Distribution of payment methods for services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculatePaymentMethods.servicePayments.length > 0 ? (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculatePaymentMethods.servicePayments}
                        dataKey="value"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={1}
                      >
                        {calculatePaymentMethods.servicePayments.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          )
                        )}
                        <Label
                          content={({ viewBox }) => {
                            const { cx, cy } = viewBox;
                            const total =
                              calculatePaymentMethods.servicePayments.reduce(
                                (sum, entry) => sum + entry.value,
                                0
                              );
                            return (
                              <text
                                x={cx}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                <tspan
                                  x={cx}
                                  y={cy}
                                  className="text-xl font-bold"
                                >
                                  ₹{parseInt(total).toLocaleString()}
                                </tspan>
                                <tspan x={cx} y={cy + 15} className="text-xs">
                                  Total
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-0 flex justify-center space-x-4">
                  {calculatePaymentMethods.servicePayments.map(
                    (entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: entry.fill }}
                        ></div>
                        <span className="text-xs">{entry.method}</span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">No payment data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Payment Methods */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Pharmacy Payment Methods</CardTitle>
            <CardDescription>
              Distribution of payment methods for pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculatePaymentMethods.pharmacyPayments.length > 0 ? (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculatePaymentMethods.pharmacyPayments}
                        dataKey="value"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={1}
                      >
                        {calculatePaymentMethods.pharmacyPayments.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          )
                        )}
                        <Label
                          content={({ viewBox }) => {
                            const { cx, cy } = viewBox;
                            const total =
                              calculatePaymentMethods.pharmacyPayments.reduce(
                                (sum, entry) => sum + entry.value,
                                0
                              );
                            return (
                              <text
                                x={cx}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                <tspan
                                  x={cx}
                                  y={cy}
                                  className="text-xl font-bold"
                                >
                                  ₹{parseInt(total).toLocaleString()}
                                </tspan>
                                <tspan x={cx} y={cy + 15} className="text-xs">
                                  Total
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-0 flex justify-center space-x-4">
                  {calculatePaymentMethods.pharmacyPayments.map(
                    (entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: entry.fill }}
                        ></div>
                        <span className="text-xs">{entry.method}</span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">No payment data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
