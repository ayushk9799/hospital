import React, { useState, useEffect } from 'react'
import { format, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, parseISO, isBefore, subMonths } from 'date-fns'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import { Calendar } from "../components/ui/calendar"
import { 
  ChevronDown, 
  Search, 
  UserPlus, 
  FileDown, 
  Filter,
  Calendar as CalendarIcon,
  X
} from 'lucide-react'
import { cn } from "../lib/utils"
import { useNavigate } from 'react-router-dom'
import PatientRegistration from '../components/custom/registration/OPDRegDialog'
import IPDRegDialog from '../components/custom/registration/IPDRegDialog'
import { useSelector } from 'react-redux'

// Sample patient data


const DateRangePicker = ({ from, to, onSelect, onSearch, onCancel }) => {
  const [open, setOpen] = useState(false)

  const handleSearch = () => {
    onSearch()
    setOpen(false)
  }

  const handleCancel = () => {
    onCancel()
    setOpen(false)
  }

  const today = new Date()
  const lastMonth = subMonths(today, 1)

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
                </>
              ) : (
                format(from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={lastMonth}
            selected={{ from, to }}
            onSelect={onSelect}
            numberOfMonths={2}
            disabled={(date) => isBefore(today, date)}
            toDate={today}
          />
          <div className="flex justify-end gap-2 p-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSearch}>Search</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Add this selector function at the top of your file, outside of the component

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null })
  const [activeTab, setActiveTab] = useState('OPD')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false)
  const [registrationType, setRegistrationType] = useState(null)

  // Use the useSelector hook to get the patients from the Redux store
  const patients = useSelector((state) => state.patients.patientlist);
  console.log(patients);
  const doctors = useSelector((state) => state.staff.doctors);
  const staff = useSelector((state) => state.staff.staffMembers);
   console.log(patients);
   console.log(doctors);
   console.log(staff);

  // Use useEffect to log the patients when the component mounts or when patientsFromRedux chang

  const filteredPatients = patients.filter(patient => {
    const nameMatch = patient.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    
    let dateMatch = true
    const visitDate = patient.bookingDate;
    const today = new Date()

    // switch (dateFilter) {
    //   case 'Today':
    //     dateMatch = isWithinInterval(visitDate, { start: startOfDay(today), end: endOfDay(today) })
    //     break
    //   case 'Yesterday':
    //     dateMatch = isWithinInterval(visitDate, { start: startOfDay(subDays(today, 1)), end: endOfDay(subDays(today, 1)) })
    //     break
    //   case 'LastWeek':
    //     dateMatch = isWithinInterval(visitDate, { start: startOfWeek(subDays(today, 7)), end: endOfDay(today) })
    //     break
    //   case 'Custom':
    //     if (dateRange.from && dateRange.to) {
    //       dateMatch = isWithinInterval(visitDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })
    //     }
    //     break
    // }

    return nameMatch && dateMatch
  })

  const PatientTable = ({ patients, type }) => {
    const navigate = useNavigate()

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Doctor</TableHead>
            {type === 'IPD' && (
              <>
                <TableHead>Date of Admission</TableHead>
                <TableHead>Date of Discharge</TableHead>
              </>
            )}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.bookingNumber}>
                <TableCell>{patient.bookingNumber}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate(`/patients/${patient.patient._id}`)}
                >
                  {patient.patient.name}
                </Button>
              </TableCell>
              <TableCell>{patient.bookingDate}</TableCell>
              <TableCell>{patient.timeSlot?.start} - {patient.timeSlot?.end}</TableCell>
              <TableCell>{patient.patient.contactNumber}</TableCell>
              <TableCell>{patient.patient.gender}</TableCell>
              <TableCell>{patient.doctor?.name || '--'}</TableCell>
              {type === 'IPD' && (
                <>
                  <TableCell>{patient.dateOfAdmission || '--'}</TableCell>
                  <TableCell>{patient.dateOfDischarge || '--'}</TableCell>
                </>
              )}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/edit`)}>Edit Patient</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/appointments/schedule/${patient.id}`)}>Schedule Appointment</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete Patient</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange)
    setDateFilter('Custom')
  }

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null })
    setDateFilter('All')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Patient List</CardTitle>
        <CardDescription>Manage and view patient information</CardDescription>
      </CardHeader>
      <CardContent>
        <PatientRegistration 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          registrationType={registrationType}
        />
        <IPDRegDialog
          open={isIPDDialogOpen}
          onOpenChange={setIsIPDDialogOpen}
        />
        <Tabs defaultValue="OPD" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="OPD">OPD</TabsTrigger>
            <TabsTrigger value="IPD">IPD</TabsTrigger>
          </TabsList>
          <div className="flex flex-col space-y-4 mb-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
                 {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <Filter className="mr-2 h-4 w-4" /> 
                    {filterStatus === 'All' ? 'Filter' : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setFilterStatus('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilterStatus('Active')}>Active</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilterStatus('Admitted')}>Admitted</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilterStatus('Discharged')}>Discharged</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilterStatus('Critical')}>Critical</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilterStatus('Pending')}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" /> 
                    {dateFilter === 'All' ? 'All Time' : dateFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Time Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setDateFilter('Today')}>Today</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDateFilter('Yesterday')}>Yesterday</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDateFilter('This Week')}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDateFilter('All')}>All Time</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDateFilter('Custom')}>Custom Range</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {dateFilter === 'Custom' && (
            <DateRangePicker
              from={tempDateRange.from}
              to={tempDateRange.to}
              onSelect={(range) => setTempDateRange(range)}
              onSearch={handleDateRangeSearch}
              onCancel={handleDateRangeCancel}
            />
          )}
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Patient
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => {
                    setRegistrationType('OPD')
                    setIsDialogOpen(true)
                  }}>
                    OPD
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setIsIPDDialogOpen(true)
                  }}>
                    IPD
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>
          
        </div>
          <TabsContent value="OPD">
            <PatientTable patients={filteredPatients.filter(p => p.type === 'OPD')} type="OPD" />
          </TabsContent>
          <TabsContent value="IPD">
            <PatientTable patients={filteredPatients.filter(p => p.type === 'IPD')} type="IPD" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}