import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addLabTests } from "../../../redux/slices/labSlice";
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
import { ScrollArea } from "../../ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";

import MultiSelectInput from "../MultiSelectInput";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];

export default function AddLabTestsDialog({
  isOpen,
  onClose,
  labData,
  testsList,
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [existingTests, setExistingTests] = useState(labData?.labTests || []);

  const [newTests, setNewTests] = useState([]);
  useEffect(() => {
    if (labData?.labTests) {
      setExistingTests(labData.labTests);
    }
  }, [labData]);

  const [paymentInfo, setPaymentInfo] = useState({
    totalAmount: labData?.paymentInfo?.totalAmount || 0,
    balanceDue: labData?.paymentInfo?.balanceDue || 0,
  });

  useEffect(() => {
    const newTestsTotal = newTests.reduce(
      (sum, test) => sum + (test.price || 0),
      0
    );
    setPaymentInfo((prev) => ({
      ...prev,
      totalAmount: newTestsTotal,
    }));
  }, [newTests]);

  // Add useEffect to reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setNewTests([]);
      setPaymentInfo({
        totalAmount: 0,
        balanceDue: 0,
      });
    }
  }, [isOpen]);

  const handleTestSelection = (selectedTests) => {
    const existingTestNames = existingTests.map((test) => test.name);
    const newSelectedTests = selectedTests
      .filter((test) => !existingTestNames.includes(test.name))
      .map((test) => ({
        name: test.name,
        price: testsList.find((t) => t.name === test.name)?.price || 0,
      }));
    setNewTests(newSelectedTests);
  };

  const handleRemoveTest = (testName) => {
    setNewTests(newTests.filter((test) => test.name !== testName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(
        addLabTests({
          id: labData._id,
          labTests: [...newTests],
          paymentInfo: {
            ...paymentInfo,
            balanceDue: paymentInfo.balanceDue + paymentInfo.totalAmount,
          },
        })
      ).unwrap();

      toast({
        title: "success",
        description: "Tests added successfully",
        variant: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Add Lab Tests</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Column - Test Selection */}
            <div className="space-y-4">
              <div className="relative">
                <MultiSelectInput
                  suggestions={testsList}
                  selectedValues={[...existingTests, ...newTests].map(
                    (test) => ({ name: test.name })
                  )}
                  setSelectedValues={handleTestSelection}
                  placeholder="Select lab tests"
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="flex flex-wrap gap-2">
                  {/* Existing Tests - No remove button and no price */}
                  {existingTests.map((test) => (
                    <Badge
                      key={test.name}
                      variant="secondary"
                      className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200"
                    >
                      <span>{test.name}</span>
                    </Badge>
                  ))}

                  {/* New Tests - With remove button and price */}
                  {newTests.map((test) => (
                    <Badge
                      key={test.name}
                      variant="secondary"
                      className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200"
                    >
                      <span>{test.name}</span>
                      <span className="font-semibold">₹{test.price}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTest(test.name)}
                      />
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Second Column - Payment Summary */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Previous Total</Label>
                  <span className="font-medium">
                    ₹{labData?.paymentInfo?.totalAmount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Amount Paid</Label>
                  <span className="font-medium text-green-600">
                    ₹{labData?.paymentInfo?.amountPaid || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>New Tests Total</Label>
                  <span className="font-medium">
                    ₹{paymentInfo.totalAmount}
                  </span>
                </div>
                <div className="h-[1px] bg-border my-2" />
                <div className="flex justify-between items-center">
                  <Label>Total Balance Due</Label>
                  <span className="font-medium text-destructive">
                    ₹{(paymentInfo.balanceDue || 0) + paymentInfo.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={newTests.length === 0 || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Tests"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
