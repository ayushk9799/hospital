import React, { useState } from "react";
import {
  Search,
  Info,
  HotelIcon,
  Plus,
  AlertCircle,
  Filter,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { emptyBeds } from "../redux/slices/roomSlice";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";

export default function RoomManagementDashboard() {
  const { rooms } = useSelector((state) => state.rooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const { toast } = useToast();

  const filteredRooms = rooms.filter(
    (room) =>
      (room.roomNumber.toString().includes(searchTerm) ||
        room.beds?.some(
          (bed) =>
            bed.patient &&
            bed.patient.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (filterType === "All" || room.type === filterType) &&
      (filterStatus === "All" || room.status === filterStatus)
  );

  const dispatch = useDispatch();
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedBeds(rooms.map((room) => room._id));
    } else {
      setSelectedBeds([]);
    }
  };

  const handleBedSelect = (roomId) => {
    setSelectedBeds((prev) => {
      if (prev.includes(roomId)) {
        const newSelection = prev.filter((id) => id !== roomId);
        setSelectAll(false);
        return newSelection;
      } else {
        const newSelection = [...prev, roomId];
        if (newSelection.length === rooms.length) {
          setSelectAll(true);
        }
        return newSelection;
      }
    });
  };

  const handleEmptyBeds = async () => {
    if (selectedBeds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one room to empty",
      });
      return;
    }

    try {
      const result = await dispatch(
        emptyBeds({
          roomIds: selectedBeds,
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Selected rooms emptied successfully",
      });
      setSelectedBeds([]);
      setSelectAll(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to empty rooms",
      });
    }
  };

  const handleEmptyAllBeds = async () => {
    try {
      const result = await dispatch(
        emptyBeds({
          roomIds: rooms.map((room) => room._id),
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "All rooms emptied successfully",
      });
      setSelectedBeds([]);
      setSelectAll(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to empty rooms",
      });
    }
  };

  const BedDetailsDialog = ({ room }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();

    const handleEmptyBed = async (bedId) => {
      try {
        const result = await dispatch(
          emptyBeds({
            roomIds: [room._id],
            bedIds: { [room._id]: [bedId] },
          })
        ).unwrap();

        toast({
          title: "Success",
          description: "Bed emptied successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to empty bed",
        });
      }
    };

    const handleEmptyAllBeds = async () => {
      try {
        const result = await dispatch(
          emptyBeds({
            roomIds: [room._id],
          })
        ).unwrap();

        toast({
          title: "Success",
          description: "All beds emptied successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to empty beds",
        });
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Bed Details - Room {room.roomNumber}</DialogTitle>
            <DialogDescription>
              Information about beds in Room {room.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="flex justify-end mb-4 px-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEmptyAllBeds}
              >
                Empty All Beds
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed Number</TableHead>
                  <TableHead>Status</TableHead>
                  {!isSmallScreen && <TableHead>Patient</TableHead>}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {room.beds.map((bed) => (
                  <TableRow key={bed.bedNumber}>
                    <TableCell className="font-medium">
                      {bed.bedNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bed.status === "Occupied"
                            ? "destructive"
                            : bed.status === "Available"
                            ? "success"
                            : bed.status === "Under Maintenance"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {bed.status}
                      </Badge>
                    </TableCell>
                    {!isSmallScreen && (
                      <TableCell>{bed.currentPatient?.name || "-"}</TableCell>
                    )}
                    <TableCell>
                      {bed.status === "Occupied" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEmptyBed(bed._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  const RoomCard = ({ room }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
            <p className="text-sm text-muted-foreground">Type: {room.type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                room.status === "Occupied"
                  ? "destructive"
                  : room.status === "Partially Available"
                  ? "warning"
                  : room.status === "Under Maintenance"
                  ? "destructive"
                  : "success"
              }
            >
              {room.status}
            </Badge>
            <BedDetailsDialog room={room} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <p className="text-sm text-muted-foreground">Beds: {room.capacity}</p>
          <p className="text-sm text-muted-foreground">
            Daily Rate: ₹{room?.ratePerDay || "N/A"}
          </p>
          <p className="text-sm text-muted-foreground">
            Current Occupancy: {room.currentOccupancy}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto p-0">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <CardTitle>Room List</CardTitle>
              <CardDescription>
                Manage and view room information
              </CardDescription>
            </div>
          </div>
          {isSmallScreen && (
            <Button
              // variant="outline"
              size="icon"
              onClick={() => navigate("/create-room")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <div className="flex w-full space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rooms..."
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
                        <Select
                          onValueChange={setFilterType}
                          defaultValue="All"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Room Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="ICU">ICU</SelectItem>
                            <SelectItem value="Operation Theater">
                              Operation Theater
                            </SelectItem>
                            <SelectItem value="Semi-Private">
                              Semi-Private
                            </SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={setFilterStatus}
                          defaultValue="All"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Room Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Partially Available">
                              Partially Available
                            </SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Under Maintenance">
                              Under Maintenance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <>
                  <Select onValueChange={setFilterType} defaultValue="All">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Operation Theater">
                        Operation Theater
                      </SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setFilterStatus} defaultValue="All">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Room Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Partially Available">
                        Partially Available
                      </SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Under Maintenance">
                        Under Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            {!isSmallScreen && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate("/create-room")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Room
                </Button>
              </div>
            )}
          </div>
          {filteredRooms.length > 0 ? (
            isSmallScreen ? (
              <div>
                {filteredRooms.map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[15%]">Room Number</TableHead>
                      <TableHead className="w-[20%]">Type</TableHead>
                      <TableHead className="w-[20%]">Status</TableHead>
                      <TableHead className="w-[15%]">Daily Rate(₹)</TableHead>
                      <TableHead className="w-[15%]">Beds</TableHead>
                      <TableHead className="w-[15%]">
                        Current Occupancy
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room._id}>
                        <TableCell className="font-medium">
                          {room.roomNumber}
                        </TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              room.status === "Occupied"
                                ? "destructive"
                                : room.status === "Partially Available"
                                ? "warning"
                                : room.status === "Under Maintenance"
                                ? "destructive"
                                : "success"
                            }
                          >
                            {room.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{room?.ratePerDay || "N/A"}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.currentOccupancy}</TableCell>
                        <TableCell className="text-right">
                          <BedDetailsDialog room={room} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No rooms found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
