import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBills } from '../redux/slices/BillingSlice'
import { format, isToday, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Search, FileDown, Filter, ChevronDown, Plus, FileX, Calendar as CalendarIcon, X, ListFilter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DateRangePicker } from '../assets/Data'
import ViewBillDialog from "../components/custom/billing/ViewBillDialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog"
import { deleteBill } from '../redux/slices/BillingSlice'
import { useToast } from "../hooks/use-toast"
import PaymentDialog from "../components/custom/billing/PaymentDialog"

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [patientTypeFilter, setPatientTypeFilter] = useState('All')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const { toast } = useToast()

  useEffect(() => {
    if(billsStatus === 'idle') dispatch(fetchBills())
  }, [dispatch, billsStatus])

  const getBillStatus = (bill) => {
    if (bill.amountPaid === bill.totalAmount) return "Paid"
    return "Due"
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

    let patientTypeMatch = true
    if (patientTypeFilter !== 'All') {
      patientTypeMatch = bill.patientType === patientTypeFilter
    }

    return nameMatch && dateMatch && statusMatch && patientTypeMatch
  })

  const getBadgeVariant = (status) => {
    switch (status) {
      case "Due":
        return "destructive"
      case "Paid":
        return "success"
      default:
        return "secondary"
    }
  }

  const formatDateOrTime = (date) => {
    const billDate = new Date(date);
    if (isToday(billDate)) {
      return format(billDate, 'h:mm a');
    }
    return format(billDate, 'MMM dd, hh:mm a');
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

  const handleEditBill = (bill) => {
    navigate(`/billings/edit/${bill._id}`, { state: { billData: bill } });
  };

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteBill(billToDelete._id))
      .unwrap()
      .then(() => {
        setIsDeleteDialogOpen(false);
        setBillToDelete(null);
        setDeleteConfirmation("");
        toast({
          title: "Bill deleted",
          description: `Bill of ${billToDelete.patientInfo.name} has been successfully deleted.`,
          variant: "default",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to delete bill: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handlePayments = (bill) => {
    setSelectedBillForPayment(bill);
    setIsPaymentDialogOpen(true);
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
                  {filterStatus === 'All' ? 'Status' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setFilterStatus('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus('Paid')}>Paid</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus('Due')}>Due</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" /> 
                  {patientTypeFilter === 'All' ? 'Patient Type' : patientTypeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Patient Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPatientTypeFilter('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPatientTypeFilter('IPD')}>IPD</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPatientTypeFilter('OPD')}>OPD</DropdownMenuItem>
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
                <TableHead>Date & Time</TableHead>
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
                  <TableCell>₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditBill(bill)}>Edit Bill</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePayments(bill)}>Payments</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBill(bill)}>Delete Bill</DropdownMenuItem>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill of {billToDelete?.patientInfo?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bill from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <p className="text-sm mb-1">Please type <span className="font-semibold">DELETE</span> to confirm.</p>
            <Input
              placeholder="Type DELETE"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmation !== "DELETE"}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        setIsOpen={setIsPaymentDialogOpen}
        billData={selectedBillForPayment}
      />
    </Card>
  )
}

export default Billings