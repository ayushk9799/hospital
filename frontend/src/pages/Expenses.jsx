import React, { useState, useEffect } from 'react'
import { format, isToday, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, parseISO } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Search, FileDown, Filter, ChevronDown, Plus, FileX, Calendar as CalendarIcon, X } from 'lucide-react'
import { DateRangePicker } from '../assets/Data'
import { useSelector, useDispatch } from 'react-redux'
import { fetchExpenses, deleteExpense } from '../redux/slices/expenseSlice'
import AddEditExpenseDialog from '../components/custom/expenses/AddEditExpenseDialog'
import { useToast } from '../hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import PaymentDialog from "../components/custom/expenses/PaymentDialog"

const sampleExpenses = [
  { id: 'E001', category: 'Supplies', description: 'Medical supplies', amount: 5000, date: '2023-03-15T10:30:00Z', status: 'Paid' },
  { id: 'E002', category: 'Utilities', description: 'Electricity bill', amount: 8000, date: '2023-03-14T14:45:00Z', status: 'Pending' },
  { id: 'E003', category: 'Salaries', description: 'Staff salaries', amount: 50000, date: '2023-03-13T09:00:00Z', status: 'Paid' },
  { id: 'E004', category: 'Equipment', description: 'New X-ray machine', amount: 200000, date: '2023-03-12T11:20:00Z', status: 'Pending' },
  { id: 'E005', category: 'Maintenance', description: 'Building repairs', amount: 15000, date: '2023-03-11T16:00:00Z', status: 'Paid' },
]

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, expensesStatus, deleteExpenseStatus } = useSelector((state) => state.expenses);
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tempDateRange, setTempDateRange] = useState({ from: null, to: null })
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState(null)
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);

  useEffect(() => {
    if(expensesStatus === "idle") {
      dispatch(fetchExpenses());
    }
  }, [dispatch, expensesStatus]);

  const filteredExpenses = expenses.filter(expense => {
    const descriptionMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    let dateMatch = true
    const expenseDate = new Date(expense.date)
    const today = new Date()

    switch (dateFilter) {
      case 'Today':
        dateMatch = isWithinInterval(expenseDate, { start: startOfDay(today), end: endOfDay(today) })
        break
      case 'Yesterday':
        dateMatch = isWithinInterval(expenseDate, { start: startOfDay(subDays(today, 1)), end: endOfDay(subDays(today, 1)) })
        break
      case 'This Week':
        dateMatch = isWithinInterval(expenseDate, { start: startOfWeek(today), end: endOfDay(today) })
        break
      case 'Custom':
        if (dateRange.from && dateRange.to) {
          dateMatch = isWithinInterval(expenseDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })
        }
        break
    }

    let statusMatch = true
    if (filterStatus !== 'All') {
      // Update status check
      const isPaid = expense.amount === expense.amountPaid
      statusMatch = (isPaid && filterStatus === 'Paid') || (!isPaid && filterStatus === 'Due')
    }

    return descriptionMatch && dateMatch && statusMatch
  })

  const getBadgeVariant = (amount, amountPaid) => {
    if (amount === amountPaid) {
      return "success"
    } else {
      return "destructive"
    }
  }

  const formatDate = (date) => {
    const expenseDate = new Date(date);
    return format(expenseDate, 'MMM dd, yyyy');
  }

  const handleDateRangeSearch = () => {
    setDateRange(tempDateRange)
    setDateFilter('Custom')
  }

  const handleDateRangeCancel = () => {
    setTempDateRange({ from: null, to: null })
    setDateFilter('All')
  }

  const handleAddExpense = () => {
    setExpenseToEdit(null)
    setIsAddEditDialogOpen(true)
  }

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense)
    setIsAddEditDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsAddEditDialogOpen(false)
    setExpenseToEdit(null)
  }

  const handleDelete = (expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    dispatch(deleteExpense(expenseToDelete._id))
      .unwrap()
      .then(() => {
        toast({
          title: "Expense deleted successfully",
          description: "The expense has been removed.",
          variant: "success",
        })
      })
      .catch((error) => {
        toast({
          title: "Failed to delete expense",
          description: error.message || "There was an error deleting the expense. Please try again.",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsDeleteDialogOpen(false)
        setExpenseToDelete(null)
      })
  }

  const handlePayments = (expense) => {
    setSelectedExpenseForPayment(expense);
    setIsPaymentDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Expenses List</CardTitle>
        <CardDescription>Manage and view hospital expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
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
            <Button variant="outline" onClick={handleAddExpense}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
            {/* <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button> */}
          </div>
        </div>
        {filteredExpenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Expense ID</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date & Time</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Created By</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{`E${expense._id?.slice(-6)}`}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(expense.amount, expense.amountPaid)}>
                      {expense.amount === expense.amountPaid ? 'Paid' : 'Due'}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.createdByName ?? 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditExpense(expense)}>Edit Expense</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePayments(expense)}>Payments</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(expense)}>Delete Expense</DropdownMenuItem>
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
            <p className="text-xl font-semibold text-gray-600">No expenses found</p>
            <p className="text-gray-500 mt-2">There are no expenses matching your search criteria.</p>
          </div>
        )}
      </CardContent>
      <AddEditExpenseDialog
        isOpen={isAddEditDialogOpen}
        onClose={handleCloseDialog}
        expenseToEdit={expenseToEdit}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteExpenseStatus === "loading"}
            >
              {deleteExpenseStatus === "loading" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        setIsOpen={setIsPaymentDialogOpen}
        expenseData={selectedExpenseForPayment}
      />
    </Card>
  )
}

export default Expenses