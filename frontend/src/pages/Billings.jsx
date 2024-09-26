import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBills } from '../redux/slices/BillingSlice'
import { format, isToday, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, parseISO, isBefore, subMonths } from 'date-fns'
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Search, FileDown, Filter, ChevronDown, Plus, FileX, Calendar as CalendarIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DateRangePicker } from '../assets/Data'
import ViewBillDialog from "../components/custom/billing/ViewBillDialog"; // Update the import path

const Billings = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { bills, billsStatus } = useSelector((state) => state.bills)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null })
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if(billsStatus === 'idle'){
      dispatch(fetchBills())
    }
  }, [dispatch, billsStatus])

  const getBillStatus = (bill) => {
    if (bill.amountPaid === 0) return "Due"
    if (bill.amountPaid < bill.totalAmount) return "Partially Paid"
    return "Paid"
  }

  const filteredBills = bills.filter(bill => {
    const nameMatch = bill.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.patientInfo.phone.includes(searchTerm)
    
    let dateMatch = true
    const billDate = new Date(bill.createdAt)
    const today = new Date()

    switch (dateFilter) {
      case 'Today':
        dateMatch = isWithinInterval(billDate, { start: startOfDay(today), end: endOfDay(today) })
        break
      case 'Yesterday':
        dateMatch = isWithinInterval(billDate, { start: startOfDay(subDays(today, 1)), end: endOfDay(subDays(today, 1)) })
        break
      case 'This Week':
        dateMatch = isWithinInterval(billDate, { start: startOfWeek(today), end: endOfDay(today) })
        break
      case 'Custom':
        if (dateRange.from && dateRange.to) {
          dateMatch = isWithinInterval(billDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })
        }
        break
    }

    const status = getBillStatus(bill)
    let statusMatch = true
    if (filterStatus !== 'All') {
      statusMatch = status === filterStatus
    }

    return nameMatch && dateMatch && statusMatch
  })

  const getBadgeVariant = (status) => {
    switch (status) {
      case "Due":
        return "destructive"
      case "Partially Paid":
        return "warning"
      case "Paid":
        return "success"
      default:
        return "secondary"
    }
  }

  const getDueAmount = (bill) => {
    return (bill.totalAmount - bill.amountPaid).toFixed(2)
  }

  const formatDateOrTime = (date) => {
    const billDate = new Date(date);
    if (isToday(billDate)) {
      return format(billDate, 'h:mm a');
    }
    return format(billDate, 'dd/MM/yyyy h:mm a');
  }

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange)
    setDateFilter('Custom')
  }

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null })
    setDateFilter('All')
  }

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsViewDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Billing List</CardTitle>
        <CardDescription>Manage and view billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
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
                <DropdownMenuItem onSelect={() => setFilterStatus('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus('Paid')}>Paid</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus('Due')}>Due</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus('Partially Paid')}>Partially Paid</DropdownMenuItem>
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
            <Button variant="outline" onClick={() => navigate('/billings/create-service-bill')}>
              <Plus className="mr-2 h-4 w-4" /> Create Bill
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        {filteredBills.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Patient Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell>B{bill._id.slice(-6)}</TableCell>
                  <TableCell>{bill.patientInfo.name}</TableCell>
                  <TableCell>{bill.patientInfo.phone}</TableCell>
                  <TableCell>{bill.patientType}</TableCell>
                  <TableCell>{formatDateOrTime(bill.createdAt)}</TableCell>
                  <TableCell>₹{getDueAmount(bill)}</TableCell>
                  <TableCell>₹{bill.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(getBillStatus(bill))}>
                      {getBillStatus(bill)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewBill(bill)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/bills/${bill._id}/edit`)}>Edit Bill</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Bill</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <FileX className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-600">No bills found</p>
            <p className="text-gray-500 mt-2">There are no bills matching your search criteria.</p>
          </div>
        )}
      </CardContent>
      <ViewBillDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        billData={selectedBill}
      />
    </Card>
  )
}

export default Billings