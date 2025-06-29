import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLabRegistration,
  setCreateRegistrationStatusIdle,
} from "../../../redux/slices/labSlice";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Search, Loader2, Info } from "lucide-react";
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
import BillModal from "./BillModal";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Backend_URL } from "../../../assets/Data";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { searchPatients } from "../../../redux/slices/patientSlice";
import MemoizedInput from "./MemoizedInput";
import { format, differenceInDays } from "date-fns";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import LabDetailsModal from "./LabDetailsModal";
import SearchSuggestion from "./CustomSearchSuggestion";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];

export default function LabRegDialog({ open, onOpenChange, patientData }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showLabDetailsModal, setShowLabDetailsModal] = useState(false);
  const [labRegistrationData, setLabRegistrationData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedPatient, setSearchedPatient] = useState(null);
  const { createRegistrationStatus, error } = useSelector((state) => state.lab);
  const labtestsTemplate = useSelector(
    (state) => state.templates.labTestsTemplate
  );
  const allLabTests = [...labtestsTemplate]
    ?.filter((test) => test.status === "active")
    .map((test) => ({
      name: test.name || test,
      rate: test.rate,
    }));
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);

  const initialFormData = {
    name: "",
    registrationNumber: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    guardianName: "",
    relation: "",
    bloodType: "",
    patientType: "LAB",
    paymentInfo: {
      totalAmount: 0,
      amountPaid: 0,
      paymentMethod: [],
      additionalDiscount: "",
    },
    upgradegenReg: false,
    referredByName: "",
    labTests: [],
    referredBy: {},
    department: departments.length === 1 ? departments[0].name : "",
    notes: "",
    bookingDate: new Date()
      .toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"),
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
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

  const handleAmountPaidChange = (method, amount) => {
    setFormData((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        paymentMethod: prev.paymentInfo.paymentMethod.map((pm) =>
          pm.method === method ? { ...pm, amount: parseFloat(amount) || 0 } : pm
        ),
      },
    }));
  };
  const [disountPercentage, setDiscountPercentage] = useState(0);
  const handleDiscountChange = (e) => {
    const value = e.target.value;

    // Check if the input contains a percentage symbol
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
      // Handle normal numerical input
      handleInputChange(e);
    }
  };

  const calculateTotalPayable = () => {
    const totalAmount = formData.paymentInfo.totalAmount;
    const discount = parseFloat(formData.paymentInfo.additionalDiscount) || 0;
    return Math.max(0, totalAmount - discount);
  };

  useEffect(() => {
    const amountPaid = formData.paymentInfo.paymentMethod.reduce(
      (sum, pm) => sum + (pm.amount || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, amountPaid },
    }));
  }, [formData.paymentInfo.paymentMethod]);

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

  const handleTestSelection = (selectedTests) => {
    const selectedTestDetails = selectedTests.map((test) => ({
      testId: test._id || test.name,
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
  const handleSearch = async () => {
    if (!formData.registrationNumber) return;
    setIsSearching(true);

    try {
      const response = await dispatch(
        searchPatients({searchQuery:formData.registrationNumber.trim()})
      ).unwrap();
      let data = response.results?.patients[0];
      if (response.results?.patients?.length > 0) {
        setSearchedPatient(data);
        const tempGuardianName =
          data.visits[0]?.guardianName ||
          data.admissionDetails[0]?.guardianName ||
          data.guardianDetails?.guardianName ||
          "";
        const tempRelation =
          data.visits[0]?.relation || data.admissionDetails[0]?.relation ||
          data.guardianDetails?.relation ||
          "";

        setFormData((prev) => ({
          ...prev,
          name: data.name,
          age: data.age,
          gender: data.gender,
          lastVisitType: data.lastVisitType,
          lastVisit: data.lastVisit,
          lastVisitId: (() => {
            const lastVisit = data.visits?.[data.visits?.length - 1];
            const lastAdmission =
              data.admissionDetails?.[data.admissionDetails?.length - 1];

            if (!lastVisit && !lastAdmission) return null;
            if (!lastVisit) return lastAdmission?._id;
            if (!lastAdmission) return lastVisit?._id;

            return new Date(lastVisit.bookingDate) >
              new Date(lastAdmission.bookingDate)
              ? lastVisit._id
              : lastAdmission._id;
          })(),
          contactNumber: data.contactNumber,
          address: data.address,
          guardianName: tempGuardianName,
          relation: tempRelation,
        }));
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not find patient with this registration number",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
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
        // Create a cleaned version of formData by removing empty values
        const cleanedFormData = Object.entries(formData).reduce(
          (acc, [key, value]) => {
            // Special handling for arrays
            if (Array.isArray(value)) {
              if (value.length > 0) {
                acc[key] = value;
              }
              return acc;
            }

            // Handle nested objects like paymentInfo
            if (value && typeof value === "object") {
              const cleanedNested = Object.entries(value).reduce(
                (nestedAcc, [nestedKey, nestedValue]) => {
                  // Handle arrays within nested objects
                  if (Array.isArray(nestedValue)) {
                    if (nestedValue.length > 0) {
                      nestedAcc[nestedKey] = nestedValue;
                    }
                  }
                  // Handle other nested values
                  else if (
                    nestedValue !== "" &&
                    nestedValue !== null &&
                    nestedValue !== undefined
                  ) {
                    nestedAcc[nestedKey] = nestedValue;
                  }
                  return nestedAcc;
                },
                {}
              );

              if (Object.keys(cleanedNested).length > 0) {
                acc[key] = cleanedNested;
              }
            }
            // Handle non-object values
            else if (value !== "" && value !== null && value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );
        const result = await dispatch(
          createLabRegistration(cleanedFormData)
        ).unwrap();
        toast({
          title: "Registration Successful",
          description: "Lab registration completed successfully",
          variant: "success",
        });
        setLabRegistrationData(result);
        setShowLabDetailsModal(true);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Registration Failed",
          description: error || "Could not complete lab registration",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSearchedPatient(null);
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      document.body.style = "";
    }, 500);
    setFormData(initialFormData);
    setSearchedPatient(null);
  };

  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value;
    const age = dateOfBirth
      ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
      : "";

    setFormData((prev) => ({
      ...prev,
      dateOfBirth,
      age: age.toString(),
    }));
  };

  const handleAgeChange = (e) => {
    const age = e.target.value;
    setFormData((prev) => ({
      ...prev,
      age,
      dateOfBirth: "",
    }));
  };

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors({});
      setSearchedPatient(null);
      setTimeout(() => {
        document.body.style = "";
      }, 500);
    }
  }, [open]);

  useEffect(() => {
    if (createRegistrationStatus === "succeeded") {
      toast({
        title: "Registration Successful",
        description: "Lab registration completed successfully",
        variant: "success",
      });
      setLabRegistrationData(labRegistrationData);
      setShowLabDetailsModal(true);
      onOpenChange(false);
      dispatch(setCreateRegistrationStatusIdle());
    } else if (createRegistrationStatus === "failed") {
      toast({
        title: "Registration Failed",
        description: error || "Could not complete lab registration",
        variant: "destructive",
      });
      dispatch(setCreateRegistrationStatusIdle());
    }
  }, [createRegistrationStatus, error, dispatch, toast, onOpenChange]);

  useEffect(() => {
    if (patientData) {
      setFormData((prev) => ({
        ...prev,
        name: patientData.patient.name,
        registrationNumber: patientData.registrationNumber,
        age: patientData.patient.age,
        gender: patientData.patient.gender,
        contactNumber: patientData.patient.contactNumber,
        address: patientData.patient.address,
        guardianName: patientData.patient.guardianDetails?.guardianName || "",
        relation: patientData.patient.guardianDetails?.relation || "",
        lastVisitType: patientData.type,
        lastVisit: patientData.bookingDate,
        lastVisitId: patientData._id,
      }));
      setSearchedPatient({
        ...patientData.patient,
        lastVisit: patientData.bookingDate,
        lastVisitType: patientData.type,
      });
    }
  }, [patientData]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={`${isMobile ? "w-[95vw] p-4" : "max-w-[1000px]"} h-[${
            isMobile ? "70vh" : "60vh"
          }] overflow-visible px-4`}
        >
          <DialogHeader>
            <DialogTitle>Lab Registration</DialogTitle>
            <DialogDescription className="hidden md:flex justify-between">
              <p>Register patient for laboratory tests</p>
              {searchedPatient && searchedPatient.lastVisit && (
                <span className="text-black font-semibold">
                  Last Visit:{" "}
                  {format(new Date(searchedPatient.lastVisit), "dd MMM yyyy")} [
                  <span
                    className={`capitalize ${
                      differenceInDays(
                        new Date(),
                        new Date(searchedPatient.lastVisit)
                      ) > 14
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {differenceInDays(
                      new Date(),
                      new Date(searchedPatient.lastVisit)
                    )}{" "}
                    days ago
                  </span>
                  ]
                </span>
              )}
            </DialogDescription>
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
                  <div className="relative">
                    <MemoizedInput
                      id="registrationNumber"
                      label="UHID Number"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MemoizedInput
                      id="age"
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={handleAgeChange}
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
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <Select
                    id="relation"
                    value={formData.relation}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { id: "relation", value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Husband">Husband</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Wife">Wife</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                  <MemoizedInput
                    id="guardianName"
                    label={formData.relation ? `${formData.relation}'s Name` : "Guardian's Name"}
                    value={formData.guardianName}
                    onChange={handleInputChange}
                  />
                </div>
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
                    }));
                  }}
                  onSuggestionSelect={(selectedDoctor) => {
                    setFormData((prev) => ({
                      ...prev,
                      referredBy: {
                        _id: selectedDoctor._id,
                        name: selectedDoctor.name,
                      },
                      referredByName: selectedDoctor.name,
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
                <div className="space-y-2"></div>
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

                <div
                  className={
                    formData.paymentInfo.paymentMethod.length > 1
                      ? "grid grid-cols-3 gap-1"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  <MultiSelectInput
                    id="paymentInfo.paymentMethod"
                    label="Payment Method"
                    suggestions={paymentMethods}
                    placeholder={
                      formData.paymentInfo.paymentMethod.length > 0
                        ? formData.paymentInfo.paymentMethod
                            .map((pm) => pm.method)
                            .join(", ")
                        : "Payment Method"
                    }
                    selectedValues={formData.paymentInfo.paymentMethod.map(
                      (pm) => ({
                        name: pm.method,
                      })
                    )}
                    setSelectedValues={handlePaymentMethodChange}
                    height={false}
                  />
                  {formData.paymentInfo.paymentMethod.length > 0 ? (
                    formData.paymentInfo.paymentMethod.map((pm) => (
                      <MemoizedInput
                        key={pm.method}
                        id={`payment.${pm.method}`}
                        label={`${pm.method} Amount`}
                        value={pm.amount}
                        onChange={(e) => {
                          handleAmountPaidChange(pm.method, e.target.value);
                        }}
                        className="bg-gray-50"
                      />
                    ))
                  ) : (
                    <MemoizedInput
                      key="empty"
                      id="payment.empty"
                      label="Amount Paid"
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="w-full flex flex-row justify-between sm:justify-end sm:space-x-2 space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none">
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Register"
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
          labData={labRegistrationData}
          hospitalInfo={hospitalInfo}
        />
      )}
    </>
  );
}
