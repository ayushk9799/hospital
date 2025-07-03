import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { addPayment, deletePayment } from "../../../redux/slices/BillingSlice";
import { useToast } from "../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { AlertCircle, CreditCard, MoreVertical, Trash2 } from "lucide-react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import PaymentReceipt from "../print/PaymentReceipt";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { formatCurrency } from "../../../assets/Data";
import EditPaymentDialog from "./EditPaymentDialog";

// Helper function to get current IST date and time
const getCurrentISTDateTime = () => {
  // Get current date in local timezone
  const now = new Date();
  
  // Get IST time string
  const istString = now.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
  });
  
  // Parse the IST string back to Date object
  const istDate = new Date(istString);
  
  return {
    date: istDate.toISOString().split('T')[0],
    time: istDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
  };
};

// Helper function to convert IST to UTC
const convertISTtoUTC = (date, time) => {
  // Create a date object in IST timezone
  const istDateString = `${date}T${time}`;
  const istDate = new Date(istDateString);
  
  // Convert to UTC
  const utcDate = new Date(istDate.toLocaleString('en-US', {
    timeZone: 'UTC',
    timeZoneName: 'short'
  }));
  
  return utcDate;
};

// Helper function to convert UTC to IST for display
const getISTDateTime = (utcDate) => {
  return new Date(utcDate).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata'
  });
};

const PaymentDialog = ({ isOpen, setIsOpen, billData, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState(getCurrentISTDateTime().date);
  const [paymentTime, setPaymentTime] = useState(getCurrentISTDateTime().time);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [amountError, setAmountError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPermissionErrorDialog, setShowPermissionErrorDialog] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get user data from Redux store
  const userData = useSelector((state) => state.user.userData);
  // Check if user has delete_payments permission
  const canDeletePayments = userData?.permissions?.includes("delete_payments");

  useEffect(() => {
    if (isOpen) {
      const { date, time } = getCurrentISTDateTime();
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentDate(date);
      setPaymentTime(time);
      setAmountError("");
    }
  }, [isOpen]);

  // Calculate total amount and due amount
  const totalAmount = billData?.totalAmount || 0;
  const paidAmount = billData?.amountPaid || 0;
  const dueAmount = totalAmount - paidAmount;
  const isFullyPaid = dueAmount <= 0;

  const handleAddPayment = () => {
    if (!paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsDeleting(false);

    // Convert IST to UTC before sending to server
    const utcDateTime = convertISTtoUTC(paymentDate, paymentTime);

    const payment = {
      amount: parseFloat(paymentAmount),
      paymentMethod,
      createdAt: utcDateTime.toISOString(),
    };

    dispatch(addPayment({ billId: billData._id, payment }))
      .unwrap()
      .then((updatedBill) => {
        toast({
          title: "Payment added successfully",
          description: `Payment of ₹${paymentAmount} has been added successfully.`,
          variant: "success",
        });
        if (onPaymentSuccess) {
          onPaymentSuccess(updatedBill);
        }
        setIsOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to add payment: ${error.message}`,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSetDueAmount = () => {
    setPaymentAmount(dueAmount.toFixed(2));
  };

  const handlePaymentAmountChange = (e) => {
    const amount = e.target.value;
    setPaymentAmount(amount);
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    if (canDeletePayments) {
      setIsDeleteDialogOpen(true);
    } else {
      setShowPermissionErrorDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!paymentToDelete || !billData) return;

    setIsDeleting(true);
    dispatch(
      deletePayment({ billId: billData._id, paymentId: paymentToDelete._id })
    )
      .unwrap()
      .then((updatedBill) => {
        toast({
          title: "Payment Deleted",
          description: "The payment has been successfully deleted.",
          variant: "success",
        });

        // Update the parent component with new bill data
        if (onPaymentSuccess) {
          onPaymentSuccess(updatedBill);
        }

        setPaymentToDelete(null);
        setIsDeleteDialogOpen(false);

        setIsOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Error Deleting Payment",
          description: error.message || "Failed to delete the payment.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedBill) => {
    setIsEditDialogOpen(false);
    setSelectedPayment(null);
    if (onPaymentSuccess) {
      onPaymentSuccess(updatedBill);
    }
  };

  const isPaymentValid =
    paymentAmount &&
    paymentMethod &&
    !amountError &&
    parseFloat(paymentAmount) > 0;
  if (!billData) return null;

  // Add payment method options
  const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-lg px-[14px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Payment
            </DialogTitle>
            <DialogDescription>Manage payments for the bill.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="sm:hidden">
                Total:{" "}
                <span className="text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </span>
              <span className="sm:hidden">
                Due:{" "}
                <span className="text-red-600">
                  {formatCurrency(dueAmount)}
                </span>
              </span>
              <span className="hidden sm:inline">
                Total Amount:{" "}
                <span className="text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </span>
              <span className="hidden sm:inline">
                Due Amount:{" "}
                <span className="text-red-600">
                  {formatCurrency(dueAmount)}
                </span>
              </span>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2 pt-4">

            <div className="space-y-1">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <div className="relative">
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={handlePaymentAmountChange}
                  placeholder="Enter amount"
                  className={`pr-10 ${amountError ? "border-red-500" : ""}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleSetDueAmount}
                  title="Set Due Amount"
                >
                  <CreditCard className="h-4 w-4" />
                </Button>
              </div>
              {amountError && (
                <p className="text-xs text-red-500 mt-1">{amountError}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                onValueChange={setPaymentMethod}
                value={paymentMethod}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>

            <div className="space-y-1 pt-4">
              <Label htmlFor="paymentDateTime">Payment Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={getCurrentISTDateTime().date}
                  className="flex-1"
                />
                <Input
                  id="paymentTime"
                  type="time"
                  value={paymentTime}
                  onChange={(e) => setPaymentTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">Recent Payments</h4>
              {billData?.payments?.length > 0 && (
                <PaymentReceipt
                  payments={billData.payments}
                  billData={billData}
                  styleData={true}
                />
              )}
            </div>
            {billData?.payments && billData?.payments?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Date</TableHead>
                      {!isMobile && (
                        <TableHead className="w-[80px]">Time</TableHead>
                      )}
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billData.payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs">
                          {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                            timeZone: 'Asia/Kolkata',
                          })}
                        </TableCell>
                        {!isMobile && (
                          <TableCell className="text-xs">
                            {new Date(payment.createdAt).toLocaleString('en-US', {
                              timeZone: 'Asia/Kolkata',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })}
                          </TableCell>
                        )}
                        <TableCell className="text-xs font-medium">
                          {formatCurrency(payment?.amount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {payment.paymentMethod}
                        </TableCell>
                        <TableCell className="text-xs">
                          <PaymentReceipt payment={payment} billData={billData} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(payment)}
                              >
                                Edit Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(payment)}
                              >
                                Delete Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-gray-500 py-4">
                <AlertCircle size={18} />
                <span>No recent payments found</span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex-col-reverse gap-2  sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            {
              <Button
                onClick={handleAddPayment}
                disabled={isLoading || !isPaymentValid}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Processing..." : "Add Payment"}
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      {selectedPayment && (
        <EditPaymentDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          payment={selectedPayment}
          billData={billData}
          onSuccess={handleEditSuccess}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              payment of{" "}
              <span className="font-semibold">
                ₹
                {paymentToDelete?.amount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>{" "}
              made via{" "}
              <span className="font-semibold">
                {paymentToDelete?.paymentMethod}
              </span>{" "}
              on{" "}
              <span className="font-semibold">
                {paymentToDelete
                  ? new Date(paymentToDelete.createdAt).toLocaleDateString(
                      "en-IN"
                    )
                  : ""}
                .
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Yes, delete payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showPermissionErrorDialog}
        onOpenChange={setShowPermissionErrorDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permission Denied</AlertDialogTitle>
            <AlertDialogDescription>
              You do not have the required permissions to delete payments.
              Please contact an administrator if you believe this is an error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowPermissionErrorDialog(false)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentDialog;
