import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
import { addLabPayment } from "../../../redux/slices/labSlice";
import { useToast } from "../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { AlertCircle, CreditCard } from "lucide-react";
import { useMediaQuery } from "../../../hooks/use-media-query";
import PaymentReceipt from "../print/PaymentReceipt";

const LabPaymentDialog = ({ isOpen, setIsOpen, labData }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount("");
      setPaymentMethod("");
      setAmountError("");
    }
    else{
    
            document.body.style.pointerEvents = "";
            document.body.style = "";
      
            setTimeout(() => {
              document.body.style.pointerEvents = "";
              document.body.style = "";
            }, 300);
          
      
        
    }
    return () => {
        document.body.style.pointerEvents = "";
        document.body.style = "";
      };
  }, [isOpen]);

  // Calculate total amount and due amount
  const totalAmount = labData?.paymentInfo?.totalAmount || 0;
  const paidAmount = labData?.paymentInfo?.amountPaid || 0;
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

    const payment = {
      method: paymentMethod,
      amount: parseFloat(paymentAmount),
    };

    dispatch(addLabPayment({ labId: labData._id, payment }))
      .unwrap()
      .then(() => {
        toast({
          title: "Payment added successfully",
          description: `Payment of ₹${paymentAmount} has been added successfully.`,
          variant: "success",
        });
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

    if (parseFloat(amount) > dueAmount) {
      setAmountError(
        `Amount cannot exceed the due amount of ₹${dueAmount.toFixed(2)}`
      );
    } else {
      setAmountError("");
    }
  };

  const isPaymentValid =
    paymentAmount &&
    paymentMethod &&
    !amountError &&
    parseFloat(paymentAmount) > 0;

  if (!labData) return null;

  const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-[425px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Payment
          </DialogTitle>
          <DialogDescription>
            Add payment for lab registration.
          </DialogDescription>
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
                disabled={isFullyPaid}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleSetDueAmount}
                title="Set Due Amount"
                disabled={isFullyPaid}
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
              disabled={isFullyPaid}
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
            {labData?.payments && labData?.payments?.length > 0 && (
              <PaymentReceipt
                payments={labData.payments}
                billData={labData}
                styleData={true}
              />
            )}
          </div>
          {labData?.payments &&
          labData?.payments?.length > 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labData.payments?.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs">
                        {new Date(payment.createdAt).toLocaleDateString("en-IN")}
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
                        <PaymentReceipt 
                          payment={payment} 
                          billData={labData} 
                        />
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

        <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          {isFullyPaid ? (
            <Button
              disabled
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
            >
              Fully Paid
            </Button>
          ) : (
            <Button
              onClick={handleAddPayment}
              disabled={isLoading || !isPaymentValid}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Processing..." : "Add Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LabPaymentDialog;
