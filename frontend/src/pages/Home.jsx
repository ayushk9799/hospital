import React, { useState } from 'react'
import { 
  Bed, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  Search, 
  Filter,
  PlusCircle,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"

// Sample room data
const rooms = [
  { id: 101, type: 'General', status: 'Occupied', patient: 'John Doe', admissionDate: '2023-06-15', expectedDischarge: '2023-06-20' },
  { id: 102, type: 'ICU', status: 'Available', patient: null, admissionDate: null, expectedDischarge: null },
  { id: 103, type: 'General', status: 'Cleaning', patient: null, admissionDate: null, expectedDischarge: null },
  { id: 104, type: 'Pediatric', status: 'Occupied', patient: 'Jane Smith', admissionDate: '2023-06-14', expectedDischarge: '2023-06-18' },
  { id: 105, type: 'Maternity', status: 'Occupied', patient: 'Emily Brown', admissionDate: '2023-06-16', expectedDischarge: '2023-06-19' },
  { id: 106, type: 'ICU', status: 'Maintenance', patient: null, admissionDate: null, expectedDischarge: null },
  { id: 107, type: 'General', status: 'Available', patient: null, admissionDate: null, expectedDischarge: null },
  { id: 108, type: 'Pediatric', status: 'Occupied', patient: 'Tom Wilson', admissionDate: '2023-06-13', expectedDischarge: '2023-06-17' },
]

export default function RoomManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredRooms = rooms.filter(room => 
    (room.id.toString().includes(searchTerm) || (room.patient && room.patient.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterType === 'All' || room.type === filterType) &&
    (filterStatus === 'All' || room.status === filterStatus)
  )

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length
  const availableRooms = rooms.filter(room => room.status === 'Available').length
  const maintenanceRooms = rooms.filter(room => room.status === 'Maintenance').length

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Room Management Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedRooms}</div>
            <Progress value={(occupiedRooms / totalRooms) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRooms}</div>
            <Progress value={(availableRooms / totalRooms) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms in Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRooms}</div>
          </CardContent>
        </Card>
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
                  <SelectItem value="Maternity">Maternity</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setFilterStatus} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Room
              </Button>
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
                <TableHead>Patient</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Expected Discharge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.id}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      room.status === 'Occupied' ? 'default' :
                      room.status === 'Available' ? 'secondary' :
                      room.status === 'Cleaning' ? 'warning' :
                      'destructive'
                    }>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.patient || '-'}</TableCell>
                  <TableCell>{room.admissionDate || '-'}</TableCell>
                  <TableCell>{room.expectedDischarge || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}