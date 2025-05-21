import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import {
  editPatient,
  fetchVisitDetailsFull,
} from "../../../redux/slices/patientSlice";
import { useToast } from "../../../hooks/use-toast";
import PatientInfoForm from "../registration/PatientInfoForm";
import VisitDetailsForm from "../registration/VisitDetailsForm";
import VitalsForm from "../registration/VitalsForm";
import InsuranceForm from "../registration/InsuranceForm";
import MultiSelectInput from "../../custom/MultiSelectInput";
import MemoizedInput from "../registration/MemoizedInput";
import { FloatingLabelSelect } from "../registration/PatientInfoForm";
import { SelectItem } from "../../ui/select";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

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
  guardianName: "",
  relation: "",
  visit: {
    consultationType: "",
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
    referredBy: "",
    bookingDate: "",
    timeSlot: {
      start: "",
      end: "",
    },
    guardianName: "",
    relation: "",
    department: "",
    doctor: { id: "", name: "" },
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
    totalAmount: "",
    discount: "",
    paymentMethod: [],
    amountPaid: "",
  },
};

const initialErrors = {};

const EditPatientDialog = ({ open, setOpen, patientData }) => {
  const { editPatientStatus, visitDetailsFull, visitDetailsFullStatus } =
    useSelector((state) => state.patients);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [deletedPayments, setDeletedPayments] = useState([]);
  const [updatedPayments, setUpdatedPayments] = useState([]);
  const [newPayments, setNewPayments] = useState([]);
  const [originalPayments, setOriginalPayments] = useState([]);

  useEffect(() => {
    if (open && patientData?.visitID && patientData?.type) {
      dispatch(
        fetchVisitDetailsFull({
          id: patientData.visitID,
          type: patientData.type,
        })
      )
        .unwrap()
        .then((data) => {
          // Transform the fetched data to match formData structure
          setFormData((prev) => {
            const visitFields = [
              "consultationType",
              "reasonForVisit",
              "vitals",
              "referredBy",
              "bookingDate",
              "timeSlot",
              "guardianName",
              "relation",
              "department",
              "doctor",
              "insuranceDetails",
            ];
            const visit = { ...initialFormData.visit };
            visitFields.forEach((field) => {
              if (data[field] !== undefined && data[field] !== null) {
                if (field === "doctor") {
                  if (typeof data.doctor === "object" && data.doctor !== null) {
                    visit.doctor = {
                      id: data.doctor._id || data.doctor.id || "",
                      name: data.doctor.name || "",
                    };
                  } else {
                    visit.doctor = { id: "", name: "" };
                  }
                } else if (field === "department") {
                  visit.department = data.department || "";
                } else if (field === "vitals") {
                  visit.vitals = {
                    ...initialFormData.visit.vitals,
                    ...(data.vitals || {}),
                  };
                } else if (field === "insuranceDetails") {
                  visit.insuranceDetails = {
                    ...initialFormData.visit.insuranceDetails,
                    ...(data.insuranceDetails || {}),
                  };
                } else if (field === "timeSlot") {
                  visit.timeSlot = {
                    ...initialFormData.visit.timeSlot,
                    ...(data.timeSlot || {}),
                  };
                } else if (field === "bookingDate") {
                  let val = data.bookingDate;
                  if (val) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      visit.bookingDate = val;
                    } else {
                      const d = new Date(val);
                      if (!isNaN(d.getTime())) {
                        visit.bookingDate = d.toISOString().split("T")[0];
                      } else {
                        visit.bookingDate = "";
                      }
                    }
                  } else {
                    visit.bookingDate = "";
                  }
                } else {
                  visit[field] = data[field];
                }
              }
            });

            // Handle payment and bill data separately since it's nested
            if (
              data.bills &&
              data.bills.services &&
              data.bills.services.length > 0
            ) {
              const latestBill =
                data.bills.services[data.bills.services.length - 1];
              visit.totalAmount = latestBill.totalAmount || 0;
              visit.discount = latestBill.additionalDiscount || 0;
              visit.amountPaid = latestBill.amountPaid || 0;
              visit.billId = latestBill._id;

              // Transform payments into paymentMethod array and store original state
              if (latestBill.payments && latestBill.payments.length > 0) {
                const payments = latestBill.payments.map((payment) => ({
                  _id: payment._id,
                  method: payment.paymentMethod,
                  amount: payment.amount,
                }));
                visit.paymentMethod = payments;
                setOriginalPayments(payments);
              } else {
                visit.paymentMethod = [];
                setOriginalPayments([]);
              }
            } else {
              visit.totalAmount = 0;
              visit.discount = 0;
              visit.amountPaid = 0;
              visit.paymentMethod = [];
              setOriginalPayments([]);
            }

            return {
              ...prev,

              name: data.name || data.patient?.name || "",
              dateOfBirth: data.dateOfBirth || data.patient?.dateOfBirth || "",
              age: data.age || data.patient?.age || "",
              gender: data.gender || data.patient?.gender || "",
              contactNumber:
                data.contactNumber || data.patient?.contactNumber || "",
              email: data.email || data.patient?.email || "",
              address: data.address || data.patient?.address || "",
              bloodType: data.bloodType || data.patient?.bloodType || "",
              registrationNumber: data.registrationNumber || "",
              visit,
            };
          });

          // Reset payment tracking when dialog opens
          setDeletedPayments([]);
          setUpdatedPayments([]);
          setNewPayments([]);
        })
        .catch(() => {
          setFormData(initialFormData);
          setDeletedPayments([]);
          setUpdatedPayments([]);
          setNewPayments([]);
        });
    } else if (!open) {
      setFormData(initialFormData);
      setErrors({});
      setDeletedPayments([]);
      setUpdatedPayments([]);
      setNewPayments([]);
    }
  }, [open, patientData?.visitID, patientData?.type]);

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setErrors({});
  };

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
      return newState;
    });
  }, []);

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

  const handlePaymentMethodChange = (method, amount, index) => {
    const payment = formData.visit.paymentMethod[index];

    if (payment._id) {
      // This is an existing payment being updated
      setUpdatedPayments((prev) => {
        const existingUpdate = prev.find((p) => p._id === payment._id);
        const originalPayment = originalPayments.find(
          (p) => p._id === payment._id
        );

        // Only track as update if different from original
        if (
          method !== originalPayment.method ||
          amount !== originalPayment.amount
        ) {
          if (existingUpdate) {
            return prev.map((p) =>
              p._id === payment._id
                ? { ...p, method, amount: Number(amount) }
                : p
            );
          }
          return [
            ...prev,
            {
              _id: payment._id,
              method,
              amount: Number(amount),
            },
          ];
        }
        // If values match original, remove from updates
        return prev.filter((p) => p._id !== payment._id);
      });
    } else {
      // This is a new payment
      setNewPayments((prev) => {
        const existingNew = prev.find((p) => p.tempId === payment.tempId);
        if (existingNew) {
          return prev.map((p) =>
            p.tempId === payment.tempId
              ? { ...p, method, amount: Number(amount) }
              : p
          );
        }
        return [
          ...prev,
          { method, amount: Number(amount), tempId: payment.tempId },
        ];
      });
    }

    // Update form data
    setFormData((prev) => {
      const newPayments = [...prev.visit.paymentMethod];
      newPayments[index] = {
        ...newPayments[index],
        method,
        amount: Number(amount),
      };
      return {
        ...prev,
        visit: {
          ...prev.visit,
          paymentMethod: newPayments,
        },
      };
    });
  };

  const handleDeletePayment = (index) => {
    const payment = formData.visit.paymentMethod[index];

    if (payment._id) {
      // If it's an existing payment, add to deletedPayments
      setDeletedPayments((prev) => [...prev, payment._id]);
      // Remove from updatedPayments if it was there
      setUpdatedPayments((prev) => prev.filter((p) => p._id !== payment._id));
    } else {
      // If it's a new payment, remove from newPayments
      setNewPayments((prev) => prev.filter((p) => p.tempId !== payment.tempId));
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      visit: {
        ...prev.visit,
        paymentMethod: prev.visit.paymentMethod.filter((_, i) => i !== index),
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.dateOfBirth && !formData.age)
      newErrors.age = "Age or Date of birth is required";
    if (!formData.visit.department)
      newErrors.department = "Department selection is required";
    if (!formData.visit?.doctor?.id)
      newErrors.doctor = "Doctor selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const patientID = patientData?.patient?._id;
        const payload = {
          ...formData,
          type: patientData?.type,
          visitID: patientData?.visitID,
          visit: {
            ...formData.visit,
            deletedPayments,
            updatedPayments: updatedPayments.map((p) => ({
              _id: p._id,
              method: p.method,
              amount: Number(p.amount),
            })),
            newPayments: newPayments.map((p) => ({
              method: p.method,
              amount: Number(p.amount),
            })),
          },
        };

        await dispatch(
          editPatient({ patientData: payload, patientID })
        ).unwrap();
        toast({
          variant: "success",
          title: "Success",
          description: "Patient record has been updated successfully",
        });
        handleClose();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update patient",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:max-w-[1000px] md:min-h-[60vh] md:max-h-[60vh] overflow-y-auto md:overflow-y-hidden w-[95vw] p-4 md:p-6 gap-0 md:gap-4 rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Edit the patient's information and visit details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="h-full md:h-[calc(70vh-100px)]"
        >
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>
            <TabsContent value="basic-info">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <PatientInfoForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    errors={errors}
                    searchDisabled={true}
                  />
                </div>
                <div className="space-y-4">
                  <VisitDetailsForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    errors={errors}
                  />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <FloatingLabelSelect
                      id="visit.department"
                      value={formData.visit.department}
                      label="Department"
                      onValueChange={(value) =>
                        handleSelectChange("visit.department", value)
                      }
                      error={errors.department}
                    >
                      {departments.map((department) => (
                        <SelectItem
                          key={department._id}
                          value={department.name}
                        >
                          {department.name}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      id="visit.doctor"
                      label="Doctor"
                      value={formData.visit.doctor.id}
                      onValueChange={(value) => {
                        const selectedDoctor = doctors.find(
                          (doc) => doc._id === value
                        );
                        handleSelectChange("visit.doctor", {
                          id: value,
                          name: selectedDoctor?.name,
                        });
                      }}
                      error={errors.doctor}
                    >
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                  </div>

                  <MemoizedInput
                    label="Referred By"
                    id="visit.referredBy"
                    value={formData.visit.referredBy}
                    onChange={handleInputChange}
                    error={errors.referredBy}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <MemoizedInput
                      label="Total Fee (₹)"
                      id="visit.totalAmount"
                      value={formData.visit.totalAmount}
                      onChange={handleInputChange}
                      error={errors.totalAmount}
                    />
                    <MemoizedInput
                      label="Amount Paid (₹)"
                      value={
                        formData.visit.amountPaid?.toLocaleString("en-IN") ||
                        "0"
                      }
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
                        onClick={() => {
                          const tempId = Date.now().toString(); // Generate a temporary ID for new payments
                          setFormData((prev) => ({
                            ...prev,
                            visit: {
                              ...prev.visit,
                              paymentMethod: [
                                ...prev.visit.paymentMethod,
                                { method: "Cash", amount: "", tempId },
                              ],
                            },
                          }));
                          setNewPayments((prev) => [
                            ...prev,
                            { method: "Cash", amount: "", tempId },
                          ]);
                        }}
                        className="h-8"
                      >
                        Add Payment
                      </Button>
                    </div>
                    <div className="border rounded-md">
                      <ScrollArea className="h-[50px]">
                        <div className="p-2 space-y-2">
                          {formData.visit.paymentMethod.map(
                            (payment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <Select
                                  value={payment.method}
                                  onValueChange={(value) => {
                                    handlePaymentMethodChange(
                                      value,
                                      payment.amount,
                                      index
                                    );
                                  }}
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
                                  onChange={(e) => {
                                    handlePaymentMethodChange(
                                      payment.method,
                                      e.target.value,
                                      index
                                    );
                                  }}
                                  className="w-[120px] h-8 text-sm"
                                  placeholder="Amount"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    handleDeletePayment(index);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>
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
            <Button variant="outline" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={editPatientStatus === "loading"}>
              {editPatientStatus === "loading" ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
