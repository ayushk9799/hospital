import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { fetchAllBabies } from "../redux/slices/babySlice";
import {
  ScrollArea,
  ScrollBar
} from "../components/ui/scroll-area";

const ViewAllBabies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Get babies from Redux store
  const { babies, status, error } = useSelector((state) => state.babies);

  // Fetch babies on component mount
  useEffect(() => {
    if(status === 'idle') {
        dispatch(fetchAllBabies());
    }
  }, [dispatch, babies]);
  

  // Filter babies based on search term and filters
  const filteredBabies = babies.filter((baby) => {
    const matchesSearch = baby.mother?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === "All" || baby.gender === filterGender;
    
    // Date filtering logic
    const birthDate = new Date(baby.dateOfBirth);
    const today = new Date();
    const isToday = birthDate.toDateString() === today.toDateString();
    const isThisWeek = (today - birthDate) / (1000 * 60 * 60 * 24) <= 7;
    const isThisMonth = 
      birthDate.getMonth() === today.getMonth() && 
      birthDate.getFullYear() === today.getFullYear();

    const matchesDate = 
      dateFilter === "All Time" ||
      (dateFilter === "Today" && isToday) ||
      (dateFilter === "This Week" && isThisWeek) ||
      (dateFilter === "This Month" && isThisMonth);

    return matchesSearch && matchesGender && matchesDate;
  });

  // Error state
  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">There are some problem try later</p>
      </div>
    );
  }

  const handleViewBaby = (baby) => {
    navigate(`/patients/${baby.ipdAdmission}/babies`, {
      state: { motherData: baby.mother }
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
                <p className="text-sm text-muted-foreground uppercase">Father:</p>
                <p className="font-sm">{baby.babyFatherName}</p>
              </div>
              <div className="flex gap-2 items-center col-span-2">
                <p className="text-sm text-muted-foreground">Birth:</p>
                <p className="font-sm">
                  {format(new Date(baby.dateOfBirth), "MMM dd, yyyy")} at {baby.timeOfBirth}
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
                  <CardTitle className="text-gray-800 text-2xl">Birth Records</CardTitle>
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
                    <Button variant="outline" className="border-gray-200 hover:bg-pink-50/50 bg-white">
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
                    <DropdownMenuItem onSelect={() => setFilterGender("Female")}>
                      Female
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-200 hover:bg-pink-50/50 bg-white">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {dateFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setDateFilter("All Time")}>
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("Today")}>
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("This Week")}>
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDateFilter("This Month")}>
                      This Month
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

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
                        <TableHead className="font-semibold text-gray-700">Birth ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mother's Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">UHID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                        <TableHead className="font-semibold text-gray-700">Weight</TableHead>
                        <TableHead className="font-semibold text-gray-700">Father's Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBabies.map((baby) => (
                        <TableRow key={baby._id} className="hover:bg-pink-50/50 transition-colors">
                          <TableCell>{baby.birthCounter}</TableCell>
                          <TableCell className="uppercase font-semibold text-gray-800">{baby.mother?.name}</TableCell>
                          <TableCell>{baby.mother?.registrationNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-pink-50/80 text-gray-700 border-pink-200">
                              {baby.gender}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {format(new Date(baby.dateOfBirth), "MMM dd, yyyy")} at {baby.timeOfBirth}
                          </TableCell>
                          <TableCell>{baby.weight}g</TableCell>
                          <TableCell className="uppercase">{baby.babyFatherName}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:text-pink-500">
                                  <ChevronDown className="h-4 w-4" />
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