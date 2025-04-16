import React, { useState, useCallback, useEffect } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegistrationAndIPDNumbers } from "../../../redux/slices/patientSlice";
import { fetchBills } from "../../../redux/slices/BillingSlice";
import {
  fetchPatients,
  registerPatient,
  opdRevisit,
} from "../../../redux/slices/patientSlice";
import PatientInfoForm from "./PatientInfoForm";
import VisitDetailsForm from "./VisitDetailsForm";
import VitalsForm from "./VitalsForm";
import InsuranceForm from "./InsuranceForm";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Checkbox } from "../../ui/checkbox";
import { useMediaQuery } from "../../../hooks/use-media-query";
import MemoizedInput from "./MemoizedInput";
import { fetchServices } from "../../../redux/slices/serviceSlice";
import OPDBillTokenModal from "./OPDBillTokenModal";
import MultiSelectInput from "../MultiSelectInput";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];
const initialFormData = {
  name: "",
  registrationNumber: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  contactNumber: "",
  email: "",
  address: "",
  bloodType: "",
  patientType: "OPD",
  upgradegenReg: false,
  visit: {
    consultationType: "new",
    reasonForVisit: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      oxygenSaturation: "",
      respiratoryRate: "",
    },
    bookingDate: new Date()
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .reverse()
      .join("-"),
    timeSlot: {
      start: "",
      end: "",
    },
    guardianName: "",
    relation: "",
    department: "",
    doctor: "",
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
    totalFee: "",
    discount: "",
    paymentMethod: [],
  },
};

const initialErrors = {};

export default function OPDRegDialog({ open, onOpenChange, patientData }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector(
    (state) => state.patients.registerPatientStatus
  );
  const { services, servicesStatus } = useSelector((state) => state.services);

  const consultationService = services.find((service) =>
    service.name.toLowerCase().includes("consultation")
  );
  const consultationFeeSettings = useSelector(
    (state) => state.consultationFees
  );

  const { doctorWiseFee, consultationTypes } = consultationFeeSettings;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);

  const [showBillModal, setShowBillModal] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [billData, setBillData] = useState(null);

  const [searchedPatient, setSearchedPatient] = useState(null);

  const [generatedRegNumber, setGeneratedRegNumber] = useState(null);

  const handleInputChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => {
        const keys = id.split(".");
        let newState = { ...prev };
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        // Real-time validation for payment fields
        if (
          ["visit.totalFee", "visit.amountPaid", "visit.discount"].includes(id)
        ) {
          const totalFee =
            Number(id === "visit.totalFee" ? value : newState.visit.totalFee) ||
            0;
          const amountPaid =
            Number(
              id === "visit.amountPaid" ? value : newState.visit.amountPaid
            ) || 0;
          const discount =
            Number(id === "visit.discount" ? value : newState.visit.discount) ||
            0;

          // Real-time error updates for payment validation
          const newErrors = { ...errors };

          if (discount > totalFee) {
            newErrors.discount = "Discount cannot exceed total fee";
          } else {
            delete newErrors.discount;
          }

          const maxAllowed = totalFee - discount;

          // Reset amount paid if discount makes it invalid
          if (id === "visit.discount" && amountPaid > maxAllowed) {
            newState.visit.amountPaid = maxAllowed.toString();
            delete newErrors.amountPaid;
          } else if (amountPaid > maxAllowed) {
            newErrors.amountPaid = `Cannot exceed ₹${maxAllowed} (Total - Discount)`;
            if (id === "visit.amountPaid") {
              current[keys[keys.length - 1]] = maxAllowed.toString();
            }
          } else {
            delete newErrors.amountPaid;
          }

          setErrors(newErrors);
        }

        return newState;
      });
    },
    [errors]
  );

  const handleSelectChange = useCallback(
    (id, value) => handleInputChange({ target: { id, value } }),
    [handleInputChange]
  );
  const handleAmountPaidChange = (method, amount) => {
    setFormData((prev) => ({
      ...prev,
      visit: {
        ...prev.visit,
        paymentMethod: prev.visit.paymentMethod.map((pm) =>
          pm.method === method ? { ...pm, amount } : pm
        ),
      },
    }));
  };
  useEffect(() => {
    const amount = formData.visit.paymentMethod.reduce(
      (sum, pm) => sum + (pm.amount ? parseFloat(pm.amount) : 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      visit: {
        ...prev.visit,
        amountPaid: amount,
      },
    }));
  }, [formData.visit.paymentMethod]);
  const handlePaymentMethodChange = (newMethods) => {
    setFormData((prev) => {
      // Get existing payment methods with their amounts
      const existingPayments = prev.visit.paymentMethod.reduce((acc, pm) => {
        acc[pm.method] = pm.amount;
        return acc;
      }, {});

      // Create new payment method array preserving existing amounts
      const updatedPaymentMethods = newMethods.map((method) => ({
        method: method.name,
        amount: existingPayments[method.name] || "",
      }));

      return {
        ...prev,
        visit: {
          ...prev.visit,
          paymentMethod: updatedPaymentMethods,
          amountPaid: updatedPaymentMethods.reduce(
            (sum, pm) => sum + (Number(pm.amount) || 0),
            0
          ),
        },
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.dateOfBirth && !formData.age)
      newErrors.age = "Date of birth or age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.visit.department)
      newErrors.department = "Department selection is required";
    if (!formData.visit.doctor)
      newErrors.doctor = "Doctor selection is required";

    // Payment validation
    const totalFee = Number(formData.visit.totalFee) || 0;
    const amountPaid = formData.visit.paymentMethod.reduce(
      (sum, pm) => sum + (Number(pm.amount) || 0),
      0
    );
    const discount = Number(formData.visit.discount) || 0;

    if (totalFee < 0) newErrors.totalFee = "Total fee cannot be negative";
    if (discount < 0) newErrors.discount = "Discount cannot be negative";
    if (discount > totalFee)
      newErrors.discount = "Discount cannot exceed total fee";
    if (amountPaid > totalFee - discount)
      newErrors.amountPaid = `Total payments (${amountPaid}) cannot exceed ${
        totalFee - discount
      } (Total - Discount)`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Add validation for registration number
      if (
        formData.registrationNumber === generatedRegNumber?.registrationNumber
      ) {
        formData.upgradegenReg = true;
      }

      if (validateForm()) {
        const submissionData = {
          ...formData,
          dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toISOString()
            : null,
          age: Number(formData.age, 10),
          lastVisit: formData.visit.bookingDate,
          lastVisitType: formData.patientType,
          visit: {
            ...formData.visit,
            bookingDate: formData.visit.bookingDate,
            vitals: Object.fromEntries(
              Object.entries(formData.visit.vitals).map(([key, value]) =>
                key === "bloodPressure"
                  ? [key, value]
                  : [key, parseFloat(value)]
              )
            ),
          },
        };

        // Choose the appropriate action based on whether this is a revisit
        const sourceData = searchedPatient || patientData;
        const action = sourceData
          ? opdRevisit({
              patientId: sourceData._id,
              visit: submissionData,
            })
          : registerPatient(submissionData);

        dispatch(action)
          .unwrap()
          .then((response) => {
            toast({
              title: patientData
                ? "Patient revisit recorded successfully"
                : "Patient registered successfully",
              description: patientData
                ? "The patient visit has been recorded."
                : "The new patient has been added.",
              variant: "success",
            });
            setRegisteredPatient(response);
            setShowBillModal(true);

            dispatch(
              fetchPatients({
                startDate: new Date()
                  .toLocaleDateString("en-IN")
                  .split("/")
                  .reverse()
                  .join("-"),
              })
            );
            dispatch(fetchBills());
            onOpenChange(false);
          })
          .catch((error) => {
            toast({
              title: patientData
                ? "Failed to record revisit"
                : "Failed to register patient",
              description:
                error.message || "There was an error. Please try again.",
              variant: "destructive",
            });
          });
      }
    },
    [formData, validateForm, dispatch, toast, onOpenChange, patientData]
  );

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const handleDialogClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      document.body.style = "";
    }, 500);
  }, [onOpenChange, consultationService]);

  useEffect(() => {
    if (patientData || searchedPatient) {
      const sourceData = searchedPatient || patientData;

      const tempGuardianName =
        sourceData?.visits[0]?.guardianName ||
        sourceData?.admissionDetails[0]?.guardianName ||
        "";
      const tempRelation =
        sourceData?.visits[0]?.relation ||
        sourceData?.admissionDetails[0]?.relation ||
        "";

      setFormData((prev) => ({
        ...prev,
        _id: sourceData._id,
        name: sourceData.name,
        age: sourceData.age,
        gender: sourceData.gender,
        contactNumber: sourceData.contactNumber,
        registrationNumber: sourceData.registrationNumber,
        address: sourceData.address,
        visit: {
          ...formData.visit,
          guardianName: tempGuardianName,
          relation: tempRelation,
        },
        // Add any other fields you want to prefill
      }));
    }
  }, [patientData, searchedPatient]);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors(initialErrors);
      setTimeout(() => {
        document.body.style = "";
      }, 500);
    }
  }, [open]);
  const getConsultationFee = (doctorId, consultationType) => {
    // First check doctor-specific consultation type fees
    if (doctorId && consultationType) {
      const doctorFee = consultationFeeSettings.doctorWiseFee.find(
        (fee) => fee.doctor._id === doctorId
      );
      if (
        doctorFee &&
        doctorFee.consultationType?.[consultationType] !== undefined
      ) {
        return doctorFee.consultationType?.[consultationType];
      }
    }

    // Then check master fees for doctor
    if (doctorId) {
      const masterDoctorFee =
        consultationFeeSettings.masterConsultationFeesDoctor?.[doctorId];
      if (masterDoctorFee !== -1) {
        return masterDoctorFee;
      }
    }

    // Finally check master fees for consultation type
    if (consultationType) {
      const masterTypeFee =
        consultationFeeSettings.masterConsultationFeesType?.[consultationType];

      if (masterTypeFee !== -1) {
        return masterTypeFee;
      }
    }

    // Default fallback
    return -1;
  };
  // Modify this useEffect to run when 'open' changes
  useEffect(() => {
    if (open) {
      const fee = getConsultationFee(
        formData.visit.doctor,
        formData.visit.consultationType
      );
      setFormData((prevData) => ({
        ...prevData,
        visit: {
          ...prevData.visit,
          totalFee:
            fee === -1 || fee === undefined || fee === null
              ? consultationService.rate.toString() || ""
              : fee.toString(),
        },
      }));
    }
  }, [open, formData.visit.doctor, formData.visit.consultationType]);

  useEffect(() => {
    return () => {
      document.body.style = "";
    };
  }, []);

  // Add this useEffect to handle auto-selection
  useEffect(() => {
    if (departments.length === 1) {
      handleSelectChange("visit.department", departments[0].name);
    }
    if (doctors.length === 1) {
      handleSelectChange("visit.doctor", doctors[0]._id);
    }
  }, [departments, doctors, handleSelectChange, open]);

  useEffect(() => {
    if (!open) {
      setSearchedPatient(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && !patientData && !searchedPatient) {
      dispatch(fetchRegistrationAndIPDNumbers())
        .unwrap()
        .then((numbers) => {
          setGeneratedRegNumber({
            registrationNumber: numbers.registrationNumber,
          });

          setFormData((prev) => ({
            ...prev,
            registrationNumber: numbers.registrationNumber,
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch numbers:", error);
        });
    }
  }, [open, dispatch, patientData, searchedPatient]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(ev) => {
          handleDialogClose(ev);
        }}
      >
        <DialogContent className="md:max-w-[1000px] md:min-h-[60vh] md:max-h-[60vh] overflow-y-auto md:overflow-y-hidden w-[95vw] p-4 md:p-6 gap-0 md:gap-4 rounded-lg">
          <DialogHeader>
            <DialogTitle className="mb-2 md:mb-0">
              Patient Registration
            </DialogTitle>
            <DialogDescription className="hidden md:flex justify-between">
              <p>Register new patient</p>
              {searchedPatient && searchedPatient.lastVisit && (
                <p className="text-black font-semibold">
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
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="h-full md:h-[calc(70vh-100px)]"
          >
            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic-info">
                  {isMobile ? "Basic" : "Basic Information"}
                </TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
              </TabsList>
              <TabsContent value="basic-info">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* First column */}
                  <div className="space-y-4">
                    <PatientInfoForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSelectChange={handleSelectChange}
                      errors={errors}
                      consultationFeeSettings={consultationFeeSettings}
                      setSearchedPatient={setSearchedPatient}
                    />
                  </div>

                  {/* Second column */}
                  <div className="space-y-4">
                    <VisitDetailsForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSelectChange={handleSelectChange}
                      errors={errors}
                    />
                  </div>

                  {/* Third column - Payment and Address section */}
                  <div className="space-y-4">
                    <div className="relative hidden sm:block">
                      <Select
                        id="visit.department"
                        value={formData.visit.department}
                        onValueChange={(value) =>
                          handleSelectChange("visit.department", value)
                        }
                      >
                        <SelectTrigger
                          className={errors.department ? "border-red-500" : ""}
                        >
                          <SelectValue
                            placeholder={
                              departments.length === 1
                                ? departments[0].name
                                : "Department"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              key={department._id}
                              value={department.name}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.department}
                        </p>
                      )}
                    </div>
                    <div className="relative hidden sm:block">
                      <Select
                        id="visit.doctor"
                        value={formData.visit.doctor}
                        onValueChange={(value) =>
                          handleSelectChange("visit.doctor", value)
                        }
                      >
                        <SelectTrigger
                          className={errors.doctor ? "border-red-500" : ""}
                        >
                          <SelectValue
                            placeholder={
                              doctors.length === 1
                                ? `${doctors[0].name}`
                                : "Assigned Doctor"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.doctor && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.doctor}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-6 pt-2 md:pt-1">
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-4">
                          <MemoizedInput
                            label="Total Fee (₹)"
                            id="visit.totalFee"
                            value={formData.visit.totalFee}
                            onChange={handleInputChange}
                            error={errors.totalFee}
                          />
                          <MemoizedInput
                            label="Discount (₹)"
                            id="visit.discount"
                            value={formData.visit.discount}
                            onChange={handleInputChange}
                            error={errors.discount}
                          />
                        </div>

                        <div
                          className={
                            formData.visit.paymentMethod.length > 1
                              ? "grid grid-cols-3 gap-1"
                              : "grid grid-cols-2 gap-2"
                          }
                        >
                          <MultiSelectInput
                            id="visit.paymentMethod"
                            label="Payment Method"
                            suggestions={paymentMethods}
                            placeholder={`${
                              formData.visit.paymentMethod.length > 0
                                ? formData.visit.paymentMethod
                                    .map((pm) => pm.method)
                                    .join(", ")
                                : "Payment Method"
                            }`}
                            selectedValues={formData.visit.paymentMethod.map(
                              (pm) => ({
                                name: pm.method,
                              })
                            )}
                            setSelectedValues={handlePaymentMethodChange}
                          />
                          {formData.visit.paymentMethod.length > 0 ? (
                            formData.visit.paymentMethod.map((pm) => (
                              <MemoizedInput
                                key={pm.method}
                                id={`visit.${pm.method}`}
                                label={`${pm.method} Amount`}
                                value={pm.amount.toLocaleString("en-IN")}
                                onChange={(e) => {
                                  handleAmountPaidChange(
                                    pm.method,
                                    e.target.value
                                  );
                                }}
                                className="bg-gray-50"
                                error={errors[`payment.${pm.method}`]}
                              />
                            ))
                          ) : (
                            <MemoizedInput
                              key="Rajiv"
                              id="invalid"
                              label={`Amount Paid`}
                              disabled={true}
                              className="bg-gray-50"
                            />
                          )}
                        </div>
                        {errors.amountPaid && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.amountPaid}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vitals">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <VitalsForm
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                    errors={errors}
                  />
                </div>
              </TabsContent>

              <TabsContent value="insurance">
                <InsuranceForm
                  formData={formData.visit}
                  handleSelectChange={handleSelectChange}
                  errors={errors}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <div className="w-full flex flex-row justify-between sm:justify-end sm:space-x-2 space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
                  tabIndex={-1}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
                  tabIndex={-1}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registerPatientStatus === "loading"}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
                >
                  {registerPatientStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Registering...
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

      <OPDBillTokenModal
        isOpen={showBillModal}
        setIsOpen={setShowBillModal}
        patientData={registeredPatient}
      />
    </>
  );
}
