import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateLabRegistration,
  setUpdateRegistrationStatusIdle,
} from "../../../redux/slices/labSlice";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import MultiSelectInput from "../MultiSelectInput";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Label } from "../../ui/label";
import MemoizedInput from "./MemoizedInput";
import { Badge } from "../../ui/badge";
import { X, Trash2 } from "lucide-react";
import LabDetailsModal from "./LabDetailsModal";
import SearchSuggestion from "./CustomSearchSuggestion";
import { parseAge } from "../../../assets/Data";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];

export default function LabEditDialog({ open, onOpenChange, labData }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showLabDetailsModal, setShowLabDetailsModal] = useState(false);
  const [updatedLabData, setUpdatedLabData] = useState(null);
  const { updateRegistrationStatus, error } = useSelector((state) => state.lab);
  const labtestsTemplate = useSelector(
    (state) => state.templates.labTestsTemplate
  );
  const allLabTests = [...labtestsTemplate]
    ?.filter((test) => test?.status !== "inactive")
    .map((test) => ({
      name: test?.name || test,
      rate: test?.rate,
    }));
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    bloodType: "",
    patientType: "LAB",
    paymentInfo: {
      totalAmount: 0,
      amountPaid: 0,
      paymentMethod: [],
      additionalDiscount: "",
    },
    payments: [],
    referredByName: "",
    labTests: [],
    referredBy: {},
    department: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (labData) {
      setFormData({
        name: labData.patientName,
        registrationNumber: labData.registrationNumber,
        age: labData.age,
        gender: labData.gender,
        contactNumber: labData.contactNumber,
        address: labData.address,
        paymentInfo: labData.paymentInfo,
        payments: labData.payments || [],
        referredByName: labData.referredByName,
        referredBy: labData.referredBy,
        labTests: labData.labTests,
        department: labData.department,
        notes: labData.notes,
      });
    }
  }, [labData]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const keys = id.split(".");
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const [disountPercentage, setDiscountPercentage] = useState(0);
  const handleDiscountChange = (e) => {
    const value = e.target.value;

    if (value.includes("%")) {
      const percentageValue = parseFloat(value.replace("%", ""));
      setDiscountPercentage(percentageValue);
      if (!isNaN(percentageValue)) {
        const discountAmount =
          (formData.paymentInfo.totalAmount * percentageValue) / 100;
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
      handleInputChange(e);
    }
  };

  const calculateTotalPayable = () => {
    const totalAmount = formData.paymentInfo.totalAmount;
    const discount = parseFloat(formData.paymentInfo.additionalDiscount) || 0;
    return Math.max(0, totalAmount - discount);
  };

  const handleTestSelection = (selectedTests) => {
    const selectedTestDetails = selectedTests.map((test) => ({
      name: test.name,
      price:
        test.rate || allLabTests.find((t) => t.name === test.name)?.rate || 0,
    }));
    const totalAmount = selectedTestDetails.reduce(
      (sum, test) => sum + (test.price || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      labTests: selectedTestDetails,
      paymentInfo: {
        ...prev.paymentInfo,
        totalAmount,
      },
    }));
  };

  const handleRemoveTest = (testName) => {
    const updatedTests = formData.labTests.filter(
      (test) => test.name !== testName
    );

    const totalAmount = updatedTests.reduce(
      (sum, test) => sum + (test.price || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      labTests: updatedTests,
      paymentInfo: {
        ...prev.paymentInfo,
        totalAmount,
      },
    }));
  };

  const handleAddPayment = () => {
    setFormData((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        {
          paymentMethod: "Cash",
          amount: "",
          isNew: true,
        },
      ],
    }));
  };

  const handleRemovePayment = (index) => {
    setFormData((prev) => {
      const newPayments = [...prev.payments];
      newPayments.splice(index, 1);

      // Recalculate total amount paid
      const totalPaid = newPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      return {
        ...prev,
        payments: newPayments,
        paymentInfo: {
          ...prev.paymentInfo,
          amountPaid: totalPaid,
        },
      };
    });
  };

  const handlePaymentChange = (index, field, value) => {
    setFormData((prev) => {
      const newPayments = [...prev.payments];
      newPayments[index] = {
        ...newPayments[index],
        [field]: field === "amount" ? parseFloat(value) || 0 : value,
      };

      // Recalculate total amount paid
      const totalPaid = newPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      return {
        ...prev,
        payments: newPayments,
        paymentInfo: {
          ...prev.paymentInfo,
          amountPaid: totalPaid,
        },
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (formData.labTests.length === 0)
      newErrors.labTests = "At least one test must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const cleanedFormData = {
          ...formData,
          _id: labData._id,
        };

        const result = await dispatch(
          updateLabRegistration(cleanedFormData)
        ).unwrap();

        toast({
          title: "Update Successful",
          description: "Lab registration updated successfully",
          variant: "success",
        });

        setUpdatedLabData(result);
        setShowLabDetailsModal(true);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Update Failed",
          description: error || "Could not update lab registration",
          variant: "destructive",
        });
      }
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      document.body.style = "";
    }, 500);
  };

  useEffect(() => {
    if (!open) {
      setErrors({});
      setTimeout(() => {
        document.body.style = "";
      }, 500);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          className={`${isMobile ? "w-[95vw] p-4" : "max-w-[1000px]"} h-[${
            isMobile ? "70vh" : "60vh"
          }] overflow-visible px-4`}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Lab Registration</DialogTitle>
            <DialogDescription>Edit lab registration details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Column - Patient Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <MemoizedInput
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                  />
                  <MemoizedInput
                    id="registrationNumber"
                    label="UHID Number"
                    value={formData.registrationNumber}
                    disabled
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <MemoizedInput
                      id="age"
                      label="Age"
                      type="text"
                      value={formData.age}
                      onChange={handleInputChange}
                      error={errors.age}
                    />
                    <Select
                      id="gender"
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange({
                          target: { id: "gender", value },
                        })
                      }
                    >
                      <SelectTrigger
                        className={errors.gender ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <MemoizedInput
                    id="contactNumber"
                    label="Contact Number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    error={errors.contactNumber}
                  />
                </div>
              </div>

              {/* Second Column - Contact Information */}
              <div className="space-y-4">
                <Textarea
                  id="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="min-h-9 h-9 no-scrollbar"
                />
                <SearchSuggestion
                  suggestions={doctors.map((doctor) => ({
                    name: doctor.name,
                    _id: doctor._id,
                  }))}
                  value={formData.referredByName}
                  setValue={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      referredByName: value,
                      referredBy: {},
                    }));
                  }}
                  onSuggestionSelect={(selectedDoctor) => {
                    setFormData((prev) => ({
                      ...prev,
                      referredBy: {
                        _id: selectedDoctor?._id,
                        name: selectedDoctor?.name,
                      },
                      referredByName: selectedDoctor?.name,
                    }));
                  }}
                  placeholder={formData.referredBy?.name || "Referred By"}
                />
                <div className="flex gap-2 relative z-50">
                  <MultiSelectInput
                    suggestions={allLabTests}
                    selectedValues={formData.labTests.map((test) => ({
                      name: test.name,
                    }))}
                    setSelectedValues={handleTestSelection}
                    placeholder="Select lab tests"
                  />
                  {formData.labTests.length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50">
                      <div className="flex flex-wrap gap-1">
                        {formData.labTests.map((test, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {test.name + " " + "₹" + test.price}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTest(test.name)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Third Column - Payment Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <MemoizedInput
                    label="Amount (₹)"
                    id="paymentInfo.totalAmount"
                    value={formData.paymentInfo.totalAmount.toLocaleString(
                      "en-IN"
                    )}
                    disabled
                    className="bg-gray-50"
                  />
                  <MemoizedInput
                    label="Discount"
                    id="paymentInfo.additionalDiscount"
                    value={
                      disountPercentage
                        ? `${disountPercentage}%`
                        : formData.paymentInfo.additionalDiscount
                    }
                    onChange={handleDiscountChange}
                    error={errors.discount}
                  />
                  <MemoizedInput
                    label="Payable (₹)"
                    value={calculateTotalPayable().toLocaleString("en-IN")}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MemoizedInput
                    label="Amount Paid (₹)"
                    value={
                      formData.paymentInfo.amountPaid?.toLocaleString(
                        "en-IN"
                      ) || "0"
                    }
                    disabled
                    className="bg-gray-50"
                  />
                  <MemoizedInput
                    label="Balance Due (₹)"
                    value={(
                      calculateTotalPayable() -
                      (formData.paymentInfo.amountPaid || 0)
                    ).toLocaleString("en-IN")}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="">
                  <div className="flex justify-between items-center">
                    <Label>Payment History</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPayment}
                      className="py-1"
                    >
                      Add Payment
                    </Button>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2 space-y-2">
                    {formData.payments.map((payment, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Select
                          value={payment.paymentMethod}
                          onValueChange={(value) =>
                            handlePaymentChange(index, "paymentMethod", value)
                          }
                        >
                          <SelectTrigger className="w-[120px] h-8 text-sm">
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem
                                key={method.name}
                                value={method.name}
                                className="text-sm"
                              >
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) =>
                            handlePaymentChange(index, "amount", e.target.value)
                          }
                          className="w-[120px] h-8 text-sm"
                          placeholder="Amount"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePayment(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="w-full flex flex-row justify-between sm:justify-end sm:space-x-2 space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none">
                  {updateRegistrationStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showLabDetailsModal && hospitalInfo && (
        <LabDetailsModal
          isOpen={showLabDetailsModal}
          setShowModal={setShowLabDetailsModal}
          labData={updatedLabData}
          hospitalInfo={hospitalInfo}
        />
      )}
    </>
  );
}
