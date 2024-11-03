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
import { revisitPatient } from "../../../redux/slices/patientSlice";
import { fetchBills } from "../../../redux/slices/BillingSlice";
import {
  fetchPatients,
  registerPatient,
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
  visit: {
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
    department: "",
    doctor: "",
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
    totalFee: "",
    amountPaid: "",
    discount: "",
    paymentMethod: "",
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

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);

  const [showBillModal, setShowBillModal] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [billData, setBillData] = useState(null);

  const handleInputChange = useCallback((e) => {
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
      if (['visit.totalFee', 'visit.amountPaid', 'visit.discount'].includes(id)) {
        const totalFee = Number(id === 'visit.totalFee' ? value : newState.visit.totalFee) || 0;
        const amountPaid = Number(id === 'visit.amountPaid' ? value : newState.visit.amountPaid) || 0;
        const discount = Number(id === 'visit.discount' ? value : newState.visit.discount) || 0;

        // If amount paid is being changed and it exceeds (totalFee - discount),
        // set it to (totalFee - discount)
        if (id === 'visit.amountPaid') {
          const maxAllowed = totalFee - discount;
          if (Number(value) > maxAllowed) {
            current[keys[keys.length - 1]] = maxAllowed.toString();
          }
        }
      }

      return newState;
    });
  }, []);

  const handleSelectChange = useCallback(
    (id, value) => handleInputChange({ target: { id, value } }),
    [handleInputChange]
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.dateOfBirth && !formData.age)
      newErrors.age = "Date of birth or age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    
    // Payment validation
    const totalFee = Number(formData.visit.totalFee) || 0;
    const amountPaid = Number(formData.visit.amountPaid) || 0;
    const discount = Number(formData.visit.discount) || 0;

    if (totalFee < 0) newErrors.totalFee = "Total fee cannot be negative";
    if (amountPaid < 0) newErrors.amountPaid = "Amount paid cannot be negative";
    if (discount < 0) newErrors.discount = "Discount cannot be negative";
    if (discount > totalFee) newErrors.discount = "Discount cannot exceed total fee";
    if (amountPaid > (totalFee - discount)) 
      newErrors.amountPaid = "Amount paid cannot exceed total fee minus discount";
    if (amountPaid > 0 && !formData.visit.paymentMethod)
      newErrors.paymentMethod = "Payment method is required when amount is paid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (validateForm()) {
        const submissionData = {
          ...formData,
          dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toISOString()
            : null,
          age: parseInt(formData.age, 10),
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

        dispatch(registerPatient(submissionData))
          .unwrap()
          .then((response) => {
            toast({
              title: "Patient registered successfully",
              description: "The new patient has been added.",
              variant: "success",
            });
            
            setRegisteredPatient(response);
            setShowBillModal(true);
            
            dispatch(fetchPatients());
            dispatch(fetchBills());
            onOpenChange(false);
          })
          .catch((error) => {
            toast({
              title: "Failed to register patient",
              description: error.message || "There was an error registering the patient. Please try again.",
              variant: "destructive",
            });
          });
      }
    },
    [formData, validateForm, dispatch, toast, onOpenChange]
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
    setFormData((prevData) => ({
      ...initialFormData,
      visit: {
        ...initialFormData.visit,
        consultationAmount: consultationService
          ? consultationService.rate.toString()
          : "",
      },
    }));
  }, [onOpenChange, consultationService]);

  useEffect(() => {
    if (patientData) {
      setFormData({
        ...initialFormData,
        _id: patientData._id,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        contactNumber: patientData.contactNumber,
        registrationNumber: patientData.registrationNumber,
      });
    }
  }, [patientData]);

  useEffect(() => {
    console.log("open", open);
    if (!open) {
      console.log("closing");
      setFormData(initialFormData);
      setErrors(initialErrors);
      setTimeout(() => {
        document.body.style = "";
      }, 500);
    }
  }, [open]);

  useEffect(() => {
    if (servicesStatus === "idle") {
      dispatch(fetchServices());
    }
  }, [dispatch, servicesStatus]);

  // Modify this useEffect to run when 'open' changes
  useEffect(() => {
    if (open && consultationService) {
      setFormData((prevData) => ({
        ...prevData,
        visit: {
          ...prevData.visit,
          totalFee: consultationService.rate.toString(),
          amountPaid: consultationService.rate.toString(),
        },
      }));
    }
  }, [open, consultationService]);

  // Add this new useEffect for cleanup
  useEffect(() => {
    return () => {
      document.body.style = "";
    };
  }, []);

  // Add this useEffect to handle auto-selection
  useEffect(() => {
    if (departments.length === 1) {
      handleSelectChange("visit.department", departments[0]._id);
    }
    if (doctors.length === 1) {
      handleSelectChange("visit.doctor", doctors[0]._id);
    }
  }, [departments, doctors, handleSelectChange]);

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
            <DialogDescription className="hidden md:block">
              Register new patient
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
                        onValueChange={(value) => handleSelectChange("visit.department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={departments.length === 1 ? departments[0].name : "Department"} />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department._id} value={department._id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative hidden sm:block">
                      <Select
                        id="visit.doctor"
                        value={formData.visit.doctor}
                        onValueChange={(value) => handleSelectChange("visit.doctor", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={doctors.length === 1 ? `Dr. ${doctors[0].name}` : "Assigned Doctor"} />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              Dr. {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                          <MemoizedInput
                            label="Amount Paid (₹)"
                            id="visit.amountPaid"
                            value={formData.visit.amountPaid}
                            onChange={handleInputChange}
                            error={errors.amountPaid}
                          />

                          <Select
                            id="visit.paymentMethod"
                            value={formData.visit.paymentMethod}
                            onValueChange={(value) =>
                              handleSelectChange("visit.paymentMethod", value)
                            }
                          >
                            <SelectTrigger className={`w-full ${errors.paymentMethod ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Payment Method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Card">Card</SelectItem>
                              <SelectItem value="Due">Due</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          
                        </div>
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
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
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
