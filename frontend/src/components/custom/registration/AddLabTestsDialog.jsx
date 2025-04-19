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
  console.log(labData);
  const [existingTests, setExistingTests] = useState(labData?.labTests || []);
  console.log(existingTests);
  const [newTests, setNewTests] = useState([]);
  const [testsToRemove, setTestsToRemove] = useState([]);
  const [formData, setFormData] = useState({
    paymentInfo: {
      paymentMethod: [],
      amountPaid: 0,
      additionalDiscount: "",
    },
  });

  const [discountPercentage, setDiscountPercentage] = useState(0);
  console.log(testsToRemove);
  useEffect(() => {
    if (labData?.labTests) {
      setExistingTests(labData.labTests);
    }
  }, [labData]);

  // Calculate payment info directly
  const newTestsTotal = newTests.reduce(
    (sum, test) => sum + (test.price || 0),
    0
  );
  const amountToReduce = testsToRemove.reduce((sum, test) => {
    return sum + (test?.price || 0);
  }, 0);
  console.log(amountToReduce);
  // Updated calculations to properly handle discounts
  const previousDiscount = labData?.paymentInfo?.additionalDiscount || 0;
  const previousTotal =
    (labData?.paymentInfo?.totalAmount || 0) - previousDiscount;
  const amountPaid = labData?.paymentInfo?.amountPaid || 0;
  const previousBalanceDue = previousTotal - amountPaid;

  // Calculate new combined total with current discount
  const currentDiscount =
    parseFloat(formData.paymentInfo.additionalDiscount) || 0;
  const combinedTotalBeforeDiscount =
    (labData?.paymentInfo?.totalAmount -
      labData?.paymentInfo?.additionalDiscount || 0) +
    newTestsTotal -
    amountToReduce;
  const combinedTotal = combinedTotalBeforeDiscount - currentDiscount;
  const totalBalanceDue = combinedTotal - amountPaid;

  // Add useEffect to reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setNewTests([]);
      setTestsToRemove([]);
    }
  }, [isOpen]);

  const handleTestSelection = (selectedTests) => {
    console.log(selectedTests);
    const existingTestId = existingTests
      .filter(
        (test) => !testsToRemove.map((test) => test._id).includes(test._id)
      )
      .map((test) => test._id);
    const newSelectedTests = selectedTests
      .filter((test) => !existingTestId.includes(test._id))
      .map((test) => ({
        name: test.name,
        price: test.rate || test.price||0,
      }));
    setNewTests(newSelectedTests);
  };

  const handleRemoveTest = (testId, isExisting = false) => {
    if (isExisting) {
      const test = existingTests.find((t) => t._id === testId);
      if (test.reportStatus === "Completed") {
        toast({
          title: "Error",
          description: "Cannot remove completed tests",
          variant: "destructive",
        });
        return;
      }
      setTestsToRemove((prev) => [...prev, test]);
    } else {
      setNewTests(newTests.filter((test) => test.name !== testId.name));
    }
  };

  console.log(newTests);

  const handleUndoRemove = (testId) => {
    setTestsToRemove((prev) => prev.filter((test) => test._id !== testId));
  };

  const handlePaymentMethodChange = (newMethods) => {
    setFormData((prev) => {
      const existingPayments = prev.paymentInfo.paymentMethod.reduce(
        (acc, pm) => {
          acc[pm.method] = pm.amount;
          return acc;
        },
        {}
      );

      const updatedPaymentMethods = newMethods.map((method) => ({
        method: method.name,
        amount: existingPayments[method.name] || "",
      }));

      return {
        ...prev,
        paymentInfo: {
          ...prev.paymentInfo,
          paymentMethod: updatedPaymentMethods,
        },
      };
    });
  };

  const handleAmountPaidChange = (method, amount) => {
    setFormData((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        paymentMethod: prev.paymentInfo.paymentMethod.map((pm) =>
          pm.method === method ? { ...pm, amount: parseFloat(amount) || 0 } : pm
        ),
        amountPaid: prev.paymentInfo.paymentMethod
          .map((pm) =>
            pm.method === method ? parseFloat(amount) || 0 : pm.amount || 0
          )
          .reduce((sum, amount) => sum + amount, 0),
      },
    }));
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;

    // Check if the input contains a percentage symbol
    if (value.includes("%")) {
      const percentageValue = parseFloat(value.replace("%", ""));
      setDiscountPercentage(percentageValue);
      if (!isNaN(percentageValue)) {
        const discountAmount =
          (combinedTotalBeforeDiscount * percentageValue) / 100;
        setFormData((prev) => ({
          ...prev,
          paymentInfo: {
            ...prev.paymentInfo,
            additionalDiscount: Number(discountAmount),
          },
        }));
      }
    } else {
      setDiscountPercentage(0);
      setFormData((prev) => ({
        ...prev,
        paymentInfo: {
          ...prev.paymentInfo,
          additionalDiscount: value ? Number(value) : "",
        },
      }));
    }
  };

  const calculateTotalPayable = () => {
    const totalAmount = combinedTotal;
    const discount = parseFloat(formData.paymentInfo.additionalDiscount) || 0;
    return Math.max(0, totalAmount - discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTests.length === 0 && testsToRemove.length === 0) {
      toast({
        title: "Error",
        description: "Please add new tests or select tests to remove",
        variant: "destructive",
      });
      return;
    }

    // Validate that we're not removing all tests
    const remainingTestsCount =
      existingTests.length - testsToRemove.length + newTests.length;
    if (remainingTestsCount === 0) {
      toast({
        title: "Error",
        description: "Cannot remove all tests from a lab registration",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(
        addLabTests({
          id: labData._id,
          labTests: newTests.length > 0 ? newTests : undefined,
          testsToRemove: testsToRemove.length > 0 ? testsToRemove : undefined,
          paymentInfo: {
            totalAmount: newTestsTotal,
            additionalDiscount: formData.paymentInfo.additionalDiscount,
            amountPaid: formData.paymentInfo.amountPaid,
            paymentMethod: formData.paymentInfo.paymentMethod,
          },
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Tests updated successfully",
        variant: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="max-w-[1000px]" onOpenAutoFocus={(e)=>e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update Lab Tests</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Column - Test Selection */}
            <div className="space-y-4">
              <div className="relative">
                <MultiSelectInput
                  suggestions={testsList}
                  selectedValues={[
                    ...existingTests.filter(
                      (test) =>
                        !testsToRemove
                          .map((test) => test._id)
                          .includes(test._id)
                    ),
                    ...newTests,
                  ]}
                  setSelectedValues={handleTestSelection}
                  placeholder="Select lab tests"
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="flex flex-wrap gap-2">
                  {/* Existing Tests - With remove button */}
                  {existingTests.map((test) => {
                    const isMarkedForRemoval = testsToRemove
                      .map((test) => test._id)
                      .includes(test._id);
                    return (
                      <Badge
                        key={test.name}
                        variant="secondary"
                        className={`flex items-center gap-1 ${
                          isMarkedForRemoval
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        }`}
                      >
                        <span>{test.name}</span>
                        <span className="font-semibold">₹{test.price}</span>
                        {test.reportStatus !== "Completed" &&
                          (isMarkedForRemoval ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              className="h-4  pl-2 hover:bg-transparent"
                              onClick={() => handleUndoRemove(test._id)}
                            >
                              Undo
                            </Button>
                          ) : (
                            <X
                              className="h-3 pl-2 cursor-pointer hover:text-destructive"
                              onClick={() => handleRemoveTest(test._id, true)}
                            />
                          ))}
                      </Badge>
                    );
                  })}

                  {/* New Tests - With remove button */}
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
                        onClick={() => handleRemoveTest(test)}
                      />
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Second Column - Payment Summary */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label>Previous Total</Label>
                  <span className="font-medium">₹{previousTotal}</span>
                </div>
                {newTestsTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <Label>New Tests Total</Label>
                    <span className="font-medium text-green-600">
                      +₹{newTestsTotal}
                    </span>
                  </div>
                )}
                {amountToReduce > 0 && (
                  <div className="flex justify-between items-center">
                    <Label>Tests Removed Total</Label>
                    <span className="font-medium text-destructive">
                      -₹{amountToReduce}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <Label>Combined Total</Label>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹{combinedTotalBeforeDiscount}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      (Previous + New - Removed)
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Discount</Label>
                  <div className="">
                    <Input
                      value={
                        discountPercentage
                          ? `${discountPercentage}%`
                          : formData.paymentInfo.additionalDiscount
                      }
                      onChange={handleDiscountChange}
                      placeholder="Enter amount or %"
                      className=" h-7 text-right text-red-600 font-medium border-0 p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Amount Paid</Label>
                  <span className="font-medium text-green-600">
                    ₹{amountPaid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Current Balance Due</Label>
                  <span className="font-medium text-destructive">
                    ₹{totalBalanceDue}
                  </span>
                </div>
                <div className="h-[1px] bg-border my-2" />
                <div
                  className={
                    formData.paymentInfo.paymentMethod.length > 1
                      ? "grid grid-cols-3 gap-1"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  <MultiSelectInput
                    suggestions={paymentMethods}
                    selectedValues={formData.paymentInfo.paymentMethod.map(
                      (pm) => ({
                        name: pm.method,
                      })
                    )}
                    setSelectedValues={handlePaymentMethodChange}
                    placeholder={
                      formData.paymentInfo.paymentMethod.length > 0
                        ? formData.paymentInfo.paymentMethod
                            .map((pm) => pm.method)
                            .join(", ")
                        : "Payment Method"
                    }
                    height={false}
                  />
                  {formData.paymentInfo.paymentMethod.length > 0 ? (
                    formData.paymentInfo.paymentMethod.map((pm) => (
                      <Input
                        key={pm.method}
                        type="number"
                        placeholder={`${pm.method} Amount`}
                        value={pm.amount || ""}
                        onChange={(e) =>
                          handleAmountPaidChange(pm.method, e.target.value)
                        }
                        className="bg-gray-50"
                      />
                    ))
                  ) : (
                    <Input
                      placeholder="Amount Paid"
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Label>Now Paying</Label>
                  <span className="font-medium text-green-600">
                    ₹{formData.paymentInfo.amountPaid}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                (newTests.length === 0 && testsToRemove.length === 0) ||
                isLoading
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Tests"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
