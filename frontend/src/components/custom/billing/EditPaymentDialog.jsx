import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { editPayment } from "../../../redux/slices/BillingSlice";

const EditPaymentDialog = ({ isOpen, setIsOpen, payment, billData, onSuccess }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentTime, setPaymentTime] = useState("");
  
  // Get loading state from redux
  const { editPaymentStatus, error } = useSelector((state) => state.bills);
  const isLoading = editPaymentStatus === "loading";

  useEffect(() => {
    if (isOpen && payment) {
      const date = new Date(payment.createdAt);
      const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      
      setPaymentAmount(payment.amount.toString());
      setPaymentMethod(payment.paymentMethod);
      setPaymentDate(istDate.toISOString().split('T')[0]);
      setPaymentTime(istDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      }));
    }
  }, [isOpen, payment]);

  const handleEditPayment = async () => {
    if (!paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Convert IST to UTC
    const istDate = new Date(`${paymentDate}T${paymentTime}`);
    const utcDate = new Date(istDate.toLocaleString('en-US', {
      timeZone: 'UTC',
    }));

    const paymentData = {
      amount: parseFloat(paymentAmount),
      paymentMethod,
      createdAt: utcDate.toISOString(),
    };

    dispatch(editPayment({
      billId: billData._id,
      paymentId: payment._id,
      paymentData
    }))
    .unwrap()
    .then((updatedBill) => {
      toast({
        title: "Success",
        description: "Payment updated successfully",
        variant: "success",
      });
      if (onSuccess) {
        onSuccess(updatedBill);
      }
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: error || "Failed to edit payment",
        variant: "destructive",
      });
    });
  };

  const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-[400px] max-h-[90vh] overflow-y-auto rounded-lg px-[14px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="editPaymentAmount">Payment Amount</Label>
            <Input
              id="editPaymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="editPaymentMethod">Payment Method</Label>
            <Select
              onValueChange={setPaymentMethod}
              value={paymentMethod}
            >
              <SelectTrigger id="editPaymentMethod">
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

          <div className="space-y-1">
            <Label htmlFor="editPaymentDateTime">Payment Date & Time</Label>
            <div className="flex gap-2">
              <Input
                id="editPaymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="flex-1"
              />
              <Input
                id="editPaymentTime"
                type="time"
                value={paymentTime}
                onChange={(e) => setPaymentTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditPayment}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog; 