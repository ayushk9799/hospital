import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
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
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Filter,
  ChevronDown,
  FileX,
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { fetchAllBabies } from "../redux/slices/babySlice";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { DateRangePicker } from "../assets/Data";

const ViewAllBabies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [dateFilter, setDateFilter] = useState("This Week");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Get babies from Redux store
  const { babies, status, error } = useSelector((state) => state.babies);

  // Function to fetch babies with filters
  const fetchBabiesWithFilters = () => {
    const filters = {};

    if (filterGender !== "All") {
      filters.gender = filterGender;
    }

    if (dateFilter === "Custom" && dateRange?.from) {
      filters.startDate = format(dateRange?.from, "yyyy-MM-dd");
      if (dateRange?.to) {
        filters.endDate = format(dateRange?.to, "yyyy-MM-dd");
      } else {
        filters.endDate = format(dateRange?.from, "yyyy-MM-dd"); // Single date
      }
    } else if (dateFilter === "Today") {
      const today = format(new Date(), "yyyy-MM-dd");
      filters.startDate = today;
      filters.endDate = today;
    } else if (dateFilter === "This Week") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      filters.startDate = format(weekStart, "yyyy-MM-dd");
      filters.endDate = format(new Date(), "yyyy-MM-dd");
    } else if (dateFilter === "This Month") {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filters.startDate = format(monthStart, "yyyy-MM-dd");
      filters.endDate = format(new Date(), "yyyy-MM-dd");
    }

    dispatch(fetchAllBabies(filters));
  };

  // Fetch babies on component mount and when filters change
  useEffect(() => {
    fetchBabiesWithFilters();
  }, [dispatch, filterGender, dateFilter, dateRange]);

  // Filter babies based on search term (client-side for name search)
  const filteredBabies = babies.filter((baby) => {
    const matchesSearch = baby.mother?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle date range search (when Apply is clicked)
  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange);
    setDateFilter("Custom");
    setShowCustomDatePicker(false);
  };

  // Handle date range cancel
  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null });
    setShowCustomDatePicker(false);
  };

  // Clear all date filters
  const clearDateFilters = () => {
    setDateFilter("This Week");
    setDateRange({ from: null, to: null });
    setTempDateRange({ from: null, to: null });
    setShowCustomDatePicker(false);
  };

  // Get display text for custom date filter
  const getCustomDateDisplayText = () => {
    if (dateRange?.from && dateRange?.to && dateRange?.from !== dateRange?.to) {
      return `${format(dateRange?.from, "MMM dd")} - ${format(
        dateRange?.to,
        "MMM dd, yyyy"
      )}`;
    } else if (dateRange?.from) {
      return format(dateRange?.from, "MMM dd, yyyy");
    }
    return "Custom";
  };

  // Error state
  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">There are some problem try later</p>
      </div>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading birth records...</p>
        </div>
      </div>
    );
  }

  const handleViewBaby = (baby) => {
    navigate(`/patients/${baby.ipdAdmission}/babies`, {
      state: { motherData: baby.mother },
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const BabyCard = ({ baby }) => (
    <Card className="mb-4 hover:bg-gradient-to-r from-pink-50/80 to-white transition-colors duration-200 cursor-pointer border border-pink-100/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-stretch">
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-semibold uppercase">
                Baby of {baby.mother.name}
              </h3>
              <Badge variant="outline" className="ml-2">
                {baby.gender}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Birth ID: {baby.birthCounter}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground">Weight:</p>
                <p className="font-sm">{baby.weight}g</p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground uppercase">
                  Father:
                </p>
                <p className="font-sm">{baby.babyFatherName}</p>
              </div>
              <div className="flex gap-2 items-center col-span-2">
                <p className="text-sm text-muted-foreground">Birth:</p>
                <p className="font-sm">
                  {format(new Date(baby.dateOfBirth), "MMM dd, yyyy")} at{" "}
                  {baby.timeOfBirth}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleViewBaby(baby)}>
                  View Details
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Print Certificate</DropdownMenuItem>
                <DropdownMenuItem>Edit Record</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-pink-50 to-blue-50">
      <ScrollArea className="h-full w-full">
        <Card className="w-full mx-auto border-0 shadow-none bg-transparent">
          <CardHeader className="px-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoBack}
                  className="hover:bg-pink-300"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <div>
                  <CardTitle className="text-gray-800 text-2xl">
                    Birth Records
                  </CardTitle>
                  {/* <CardDescription className="text-gray-600">
                    View and manage all birth records
                  </CardDescription> */}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by mother's name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 focus:border-pink-300 focus:ring-pink-200 bg-white"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-pink-50/50 bg-white"
                    >
                      <Filter className="mr-2 h-4 w-4 text-gray-500" />
                      {filterGender}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setFilterGender("All")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilterGender("Male")}>
                      Male
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterGender("Female")}
                    >
                      Female
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-pink-50/50 bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {dateFilter === "Custom"
                        ? getCustomDateDisplayText()
                        : dateFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDateFilter("Today");
                        setDateRange({ from: null, to: null });
                        setShowCustomDatePicker(false);
                      }}
                    >
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDateFilter("This Week");
                        setDateRange({ from: null, to: null });
                        setShowCustomDatePicker(false);
                      }}
                    >
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDateFilter("This Month");
                        setDateRange({ from: null, to: null });
                        setShowCustomDatePicker(false);
                      }}
                    >
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setShowCustomDatePicker(true);
                      }}
                    >
                      Custom Range
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {showCustomDatePicker && (
                  <DateRangePicker
                    from={tempDateRange?.from}
                    to={tempDateRange?.to}
                    onSelect={(range) => setTempDateRange(range)}
                    onSearch={handleDateRangeSearch}
                    onCancel={handleDateRangeCancel}
                  />
                )}
                {dateFilter === "Custom" && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearDateFilters}
                    className="border-gray-200 hover:bg-red-50 bg-white"
                    title="Clear date filter"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Custom Date Picker Section */}
            {/* The DateRangePicker component is now rendered inline */}

            {filteredBabies.length > 0 ? (
              isSmallScreen ? (
                <div>
                  {filteredBabies.map((baby) => (
                    <BabyCard key={baby._id} baby={baby} />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-pink-50 to-white">
                        <TableHead className="font-semibold text-gray-700">
                          Birth ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Mother's Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          UHID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Gender
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Date & Time
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Weight
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Father's Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBabies.map((baby) => (
                        <TableRow
                          key={baby._id}
                          className="hover:bg-pink-50/50 transition-colors"
                        >
                          <TableCell>{baby.birthCounter}</TableCell>
                          <TableCell className="uppercase font-semibold text-gray-800">
                            {baby.mother?.name}
                          </TableCell>
                          <TableCell>
                            {baby.mother?.registrationNumber}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={baby.gender === "Male" ? "bluish" : "pinkish"}
                            >
                              {baby.gender}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {format(new Date(baby.dateOfBirth), "MMM dd, yyyy")}{" "}
                            at {baby.timeOfBirth}
                          </TableCell>
                          <TableCell>{baby.weight}g</TableCell>
                          <TableCell className="uppercase">
                            {baby.babyFatherName}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:text-pink-500"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => handleViewBaby(baby)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>Print Certificate</DropdownMenuItem>
                                <DropdownMenuItem>Edit Record</DropdownMenuItem> */}
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
              <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-sm">
                <FileX className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-xl font-semibold text-gray-700">
                  No birth records found
                </p>
                <p className="text-gray-500 mt-2">
                  There are no birth records matching your search criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default ViewAllBabies;
