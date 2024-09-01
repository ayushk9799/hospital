import React, { useState } from "react";
import {
  Search,
  FileText,
  Info,
  HotelIcon,
  BedIcon,
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
import { Progress } from "../components/ui/progress";
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

// Updated sample room data without duplicates
const rooms = [
  {
    id: 101,
    type: "General",
    status: "Partially Occupied",
    beds: [
      { id: "A", status: "Occupied", patient: "John Doe", admissionDate: "2023-06-15", expectedDischarge: "2023-06-20" },
      { id: "B", status: "Available", patient: null, admissionDate: null, expectedDischarge: null },
    ],
  },
  {
    id: 102,
    type: "ICU",
    status: "Available",
    beds: [
      { id: "A", status: "Available", patient: null, admissionDate: null, expectedDischarge: null },
    ],
  },
  {
    id: 201,
    type: "Pediatric",
    status: "Fully Occupied",
    beds: [
      { id: "A", status: "Occupied", patient: "Jane Smith", admissionDate: "2023-06-14", expectedDischarge: "2023-06-18" },
      { id: "B", status: "Occupied", patient: "Tom Wilson", admissionDate: "2023-06-13", expectedDischarge: "2023-06-17" },
    ],
  },
  {
    id: 202,
    type: "General",
    status: "Cleaning",
    beds: [
      { id: "A", status: "Cleaning", patient: null, admissionDate: null, expectedDischarge: null },
      { id: "B", status: "Cleaning", patient: null, admissionDate: null, expectedDischarge: null },
    ],
  },
  {
    id: 301,
    type: "ICU",
    status: "Partially Occupied",
    beds: [
      { id: "A", status: "Occupied", patient: "Alice Johnson", admissionDate: "2023-06-16", expectedDischarge: "2023-06-22" },
      { id: "B", status: "Available", patient: null, admissionDate: null, expectedDischarge: null },
    ],
  },
];

export default function RoomManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredRooms = rooms.filter(
    (room) =>
      (room.id.toString().includes(searchTerm) ||
        room.beds.some(
          (bed) =>
            bed.patient &&
            bed.patient.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (filterType === "All" || room.type === filterType) &&
      (filterStatus === "All" || room.status === filterStatus)
  );

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(
    (room) =>
      room.status === "Fully Occupied" || room.status === "Partially Occupied"
  ).length;
  const availableRooms = rooms.filter(
    (room) => room.status === "Available"
  ).length;
  const maintenanceRooms = rooms.filter(
    (room) => room.status === "Cleaning" || room.status === "Maintenance"
  ).length;

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
                <TableHead>Admission Date</TableHead>
                <TableHead>Expected Discharge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.beds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell>{bed.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bed.status === "Occupied"
                          ? "default"
                          : bed.status === "Available"
                          ? "secondary"
                          : bed.status === "Cleaning"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {bed.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bed.patient || "-"}</TableCell>
                  <TableCell>{bed.admissionDate || "-"}</TableCell>
                  <TableCell>{bed.expectedDischarge || "-"}</TableCell>
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
      {/* <h1 className="text-3xl font-bold">Room Management Dashboard</h1> */}

      <div className="grid grid-cols-5 gap-4">
        {/* basic rooms data */}
        <div className="grid grid-cols-3 col-span-2 gap-4">
          <Card className="bg-pink-100 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <HotelIcon className="w-10 h-10 text-pink-600" />
                  <p className="text-2xl font-bold text-pink-600">{availableRooms}</p>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                  <p className="text-xs text-green-600 mt-1">
                    Out of {totalRooms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-100 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <BedIcon className="w-10 h-10 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">104</p>
                  <p className="text-sm text-gray-600">Beds Available</p>
                  <p className="text-xs text-green-600 mt-1">
                    Out of 450
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-100 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <BedIcon className="w-10 h-10 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">104</p>
                  <p className="text-sm text-gray-600">Beds Available</p>
                  <p className="text-xs text-green-600 mt-1">
                    Out of 450
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Department Occupancy */}
        <div className="col-span-3">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Department Occupancy</CardTitle>
              <CardDescription>Current occupancy by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "General", occupancy: 85 },
                  { name: "ICU", occupancy: 92 },
                  { name: "Pediatric", occupancy: 60 },
                  { name: "Personal", occupancy: 60 },
                ].map((dept, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {dept.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dept.occupancy}%
                      </p>
                    </div>
                    <Progress value={dept.occupancy} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setFilterStatus} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Fully Occupied">Fully Occupied</SelectItem>
                  <SelectItem value="Partially Occupied">
                    Partially Occupied
                  </SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Beds</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.id}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        room.status === "Fully Occupied"
                          ? "default"
                          : room.status === "Partially Occupied"
                          ? "warning"
                          : room.status === "Available"
                          ? "secondary"
                          : room.status === "Cleaning"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.beds.length}</TableCell>
                  <TableCell>
                    <BedDetailsDialog room={room} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
