import React, { useState } from "react";
import {
  Search,
  FileText,
  Info,
  HotelIcon,
  BedIcon,
  Plus,
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
// import { Progress } from "../components/ui/progress";
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

// Updated sample room data without duplicates
import { useSelector } from "react-redux";

export default function RoomManagementDashboard() {
  const { rooms } = useSelector((state) => state.rooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();

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

  // const totalRooms = rooms.length;
  // const occupiedRooms = rooms.filter(
  //   (room) =>
  //     room.status === "Fully Occupied" || room.status === "Partially Occupied"
  // ).length;
  // const availableRooms = rooms.filter(
  //   (room) => room.status === "Available"
  // ).length;
  // const maintenanceRooms = rooms.filter(
  //   (room) => room.status === "Under Maintenance"
  // ).length;

  const BedDetailsDialog = ({ room }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bed Details - Room {room.id}</DialogTitle>
          <DialogDescription>
            Information about beds in Room {room.id}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.beds.map((bed) => (
                <TableRow key={bed.bednumber}>
                  <TableCell>{bed.bedNumber}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bed.status === "Occupied"
                          ? "default"
                          : bed.status === "Available"
                          ? "secondary"
                          : bed.status === "Under Maintenance"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {bed.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bed.currentPatient?.name || "-"}</TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto p-6 space-y-4 pt-2">
      <Card>
        <CardHeader>
          <CardTitle>Room List</CardTitle>
          <CardDescription>Manage and view room information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select onValueChange={setFilterType} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Operation Theater">Operation Theater</SelectItem>
                  <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setFilterStatus} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Partially Available">
                    Partially Available
                  </SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate("/create-room")}>
                <Plus className="mr-2 h-4 w-4" /> Add Room
              </Button>
              {/* <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Export
              </Button> */}
            </div>
          </div>
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <HotelIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-600">No rooms found</p>
              <p className="text-gray-500">
                {rooms.length === 0
                  ? "There are currently no rooms in the system."
                  : "No rooms match your current search or filter criteria."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Current Occupancy</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          room.status === "Occupied"
                            ? "default"
                            : room.status === "Partially Available"
                            ? "warning"
                            : room.status === "Under Maintenance"
                            ? "warning"
                            : "outline"
                        }
                        className={room.status === "Available" ? "bg-green-100 text-green-800 border-green-500" : ""}
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>₹{room?.ratePerDay || 'N/A'}</TableCell>
                    <TableCell>{room.currentOccupancy}</TableCell>
                    <BedDetailsDialog room={room} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
