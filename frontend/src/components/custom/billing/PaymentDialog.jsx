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
import { AlertCircle, CreditCard, Trash2 } from "lucide-react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import PaymentReceipt from "../print/PaymentReceipt";
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

const PaymentDialog = ({ isOpen, setIsOpen, billData, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [amountError, setAmountError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPermissionErrorDialog, setShowPermissionErrorDialog] =
    useState(false);

  // Get user data from Redux store
  const userData = useSelector((state) => state.user.userData);
  // Check if user has delete_payments permission
  const canDeletePayments = userData?.permissions?.includes("delete_payments");

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount("");
      setPaymentMethod("");
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

    const payment = {
      amount: parseFloat(paymentAmount),
      paymentMethod,
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

  const isPaymentValid =
    paymentAmount &&
    paymentMethod &&
    !amountError &&
    parseFloat(paymentAmount) > 0;
  if (!billData) return null;

  // Add payment method options
  const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-[425px] max-h-[90vh] overflow-y-auto rounded-lg px-[14px]">
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
                ₹
                {totalAmount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
            <span className="sm:hidden">
              Due:{" "}
              <span className="text-red-600">
                ₹
                {dueAmount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
            <span className="hidden sm:inline">
              Total Amount:{" "}
              <span className="text-primary">
                ₹
                {totalAmount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
            <span className="hidden sm:inline">
              Due Amount:{" "}
              <span className="text-red-600">
                ₹
                {dueAmount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
          </div>

          <Separator />

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
                // disabled={isFullyPaid}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleSetDueAmount}
                title="Set Due Amount"
                // disabled={isFullyPaid}
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
              //disabled={isFullyPaid}
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
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-IN"
                        )}
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString(
                            "en-IN",
                            { hour: "numeric", minute: "numeric", hour12: true }
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-xs font-medium">
                        ₹
                        {payment?.amount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-xs">
                        {payment.paymentMethod}
                      </TableCell>
                      <TableCell className="text-xs">
                        <PaymentReceipt payment={payment} billData={billData} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(payment)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isDeleting}
                          title="Delete Payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
    </Dialog>
  );
};

export default PaymentDialog;
