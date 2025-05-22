import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../ui/button";
import { FloatingLabelSelect } from "../registration/PatientInfoForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "../../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import {
  fetchIPDAdmissionDetailsFull,
  editIPDAdmission,
} from "../../../redux/slices/patientSlice";
import { fetchRooms } from "../../../redux/slices/roomSlice";
import { useToast } from "../../../hooks/use-toast";
import { Loader2, Search, Trash2 } from "lucide-react";
import MemoizedInput from "../registration/MemoizedInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { fetchServices } from "../../../redux/slices/serviceSlice";
import MultiSelectInput from "../MultiSelectInput";
import { Label } from "../../ui/label";
import { convertTo12Hour } from "../../../assets/Data";
import { ScrollArea } from "../../ui/scroll-area";
import SelectServicesDialog from "../registration/SelectServicesDialog";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];

const initialFormData = {
  patient: {
    // Patient specific details
    name: "",
    registrationNumber: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    bloodType: "",
  },
  admission: {
    // Admission specific details
    department: "",
    assignedDoctor: { _id: "", name: "" }, // Store as object
    operationName: "",
    referredBy: "",
    assignedRoom: "",
    assignedBed: "",
    diagnosis: "",
    ipdNumber: "",
    conditionOnAdmission: "",
    vitals: {
      admission: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
        weight: "",
        height: "",
      },
      discharge: {
        // Though not directly edited here, keep structure
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
    },
    bookingDate: "",
    bookingTime: "",
    timeSlot: {
      start: "",
      end: "",
    },
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
    guardianName: "",
    relation: "",
  },
  bill: {
    // Bill related details (for the primary service bill)
    billId: null, // To store the ID of the bill being edited
    services: [], // NEW: Array of { serviceId, name, quantity, rate, category, date }
    subtotal: "0", // Calculated sum of services. If no services, mirrors totalAmount.
    additionalDiscount: "0", // Calculated as subtotal - totalAmount.
    totalAmount: "0", // Net payable amount, editable by user.
    amountPaid: "", // This will be sum of paymentMethod amounts
    paymentMethod: [], // Array of { _id?, method, amount, tempId? }
  },
};

export default function EditIPDPatientDialog({
  open,
  onOpenChange,
  admissionData,
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { departments } = useSelector((state) => state.departments);
  const { rooms } = useSelector((state) => state.rooms);
  const { doctors } = useSelector((state) => state.staff);
  const { services, servicesStatus } = useSelector((state) => state.services);
  const {
    ipdAdmissionDetailsFull,
    ipdAdmissionDetailsFullStatus,
    editIPDAdmissionStatus,
  } = useSelector((state) => state.patients);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [originalPayments, setOriginalPayments] = useState([]);
  const [deletedPayments, setDeletedPayments] = useState([]);
  const [updatedPayments, setUpdatedPayments] = useState([]);
  const [isSelectServicesDialogOpen, setIsSelectServicesDialogOpen] =
    useState(false);
  const [newPayments, setNewPayments] = useState([]);
  const handleInfoClick = (e) => {
    e.preventDefault();
    setIsSelectServicesDialogOpen(true);
  };

  // Fetch details when dialog opens or admissionData changes
  useEffect(() => {
    if (open && admissionData?._id) {
      dispatch(
        fetchIPDAdmissionDetailsFull({ admissionId: admissionData._id })
      );
    } else if (!open) {
      // Reset form when dialog closes
      setFormData(initialFormData);
      setErrors({});
      setOriginalPayments([]);
      setDeletedPayments([]);
      setUpdatedPayments([]);
      setNewPayments([]);
    }
  }, [open, admissionData?._id, dispatch]);

  // Populate form when details are fetched
  useEffect(() => {
    if (
      ipdAdmissionDetailsFullStatus === "succeeded" &&
      ipdAdmissionDetailsFull
    ) {
      const data = ipdAdmissionDetailsFull;
      const patientFromData = data.patient || {};

      // Patient Form Data
      const patientForm = {
        name: patientFromData.name || "",
        registrationNumber:
          data.registrationNumber || patientFromData.registrationNumber || "",
        dateOfBirth: patientFromData.dateOfBirth
          ? new Date(patientFromData.dateOfBirth).toISOString().split("T")[0]
          : "",
        age: patientFromData.age || "",
        gender: patientFromData.gender || "",
        contactNumber: patientFromData.contactNumber || "",
        address: patientFromData.address || "",
        bloodType: patientFromData.bloodType || "",
      };

      // Admission Form Data - Reconstruct carefully to avoid direct mutation of frozen state
      const admissionDetails = {
        ...initialFormData.admission, // Start with a fresh copy of the initial structure

        // Overwrite with values from 'data', ensuring new objects for nested structures
        department: data.department || "",
        assignedDoctor: data.assignedDoctor
          ? { _id: data.assignedDoctor._id, name: data.assignedDoctor.name }
          : { _id: "", name: "" },
        operationName: data.operationName || "",
        referredBy: data.referredBy || "",
        assignedRoom: data.assignedRoom?._id || "",
        assignedBed: data.assignedBed || "",
        diagnosis: data.diagnosis || "",
        ipdNumber: data.ipdNumber || "",
        conditionOnAdmission: data.conditionOnAdmission || "",
        bookingDate: data.bookingDate
          ? new Date(data.bookingDate).toISOString().split("T")[0]
          : "",
        bookingTime: data.bookingTime || "",
        guardianName: data.guardianName || "",
        relation: data.relation || "",

        vitals: {
          // Reconstruct vitals
          ...initialFormData.admission.vitals, // Start with initial structure
          admission: {
            // Deep copy admission vitals
            ...initialFormData.admission.vitals.admission,
            ...(data.vitals?.admission || data.vitals || {}), // Spread fetched data
          },
          discharge: {
            // Also ensure discharge vitals are part of the new object structure
            ...initialFormData.admission.vitals.discharge,
            ...(data.vitals?.discharge || {}),
          },
        },
        insuranceDetails: {
          // Reconstruct insuranceDetails
          ...initialFormData.admission.insuranceDetails,
          ...(data.insuranceDetails || {}),
        },
        timeSlot: {
          // Reconstruct timeSlot
          ...initialFormData.admission.timeSlot,
          ...(data.timeSlot || {}),
        },
      };

      const billDetails = { ...initialFormData.bill };

      if (data.bills && data.bills.services && data.bills.services.length > 0) {
        const latestBill = data.bills.services[data.bills.services.length - 1];
        billDetails.billId = latestBill._id;

        billDetails.services =
          latestBill.services?.map((s) => ({
            serviceId: s.serviceId || s._id || s.id,
            name: s.name,
            quantity: s.quantity || 1,
            rate: s.rate || 0,
            category: s.category || "Other",
            date: s.date
              ? new Date(s.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          })) || [];

        const calculatedSubtotal = billDetails.services.reduce(
          (sum, s) => sum + Number(s.rate) * Number(s.quantity),
          0
        );

        if (billDetails.services.length === 0) {
          // No services, subtotal mirrors totalAmount, discount is 0
          billDetails.totalAmount = (latestBill.totalAmount || 0).toString();
          billDetails.subtotal = billDetails.totalAmount;
          billDetails.additionalDiscount = "0";
        } else {
          // Services exist, calculate based on them
          billDetails.subtotal = calculatedSubtotal.toString();
          // Use database totalAmount if available, otherwise default to subtotal
          const dbTotalAmount =
            latestBill.totalAmount !== undefined &&
            latestBill.totalAmount !== null
              ? Number(latestBill.totalAmount)
              : calculatedSubtotal;
          billDetails.totalAmount = dbTotalAmount.toString();
          billDetails.additionalDiscount = Math.max(
            0,
            calculatedSubtotal - dbTotalAmount
          ).toString();
        }

        if (latestBill.payments && latestBill.payments.length > 0) {
          const payments = latestBill.payments.map((p) => ({
            _id: p._id,
            method: p.paymentMethod,
            amount: p.amount.toString(),
          }));
          billDetails.paymentMethod = payments;
          setOriginalPayments(payments.map((p) => ({ ...p })));
        } else {
          billDetails.paymentMethod = [];
          setOriginalPayments([]);
        }
        billDetails.amountPaid = billDetails.paymentMethod
          .reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0)
          .toString();
      } else {
        // No bill or no services in bill
        billDetails.paymentMethod = [];
        setOriginalPayments([]);
        billDetails.amountPaid = "0";
        billDetails.services = [];
        billDetails.subtotal = "0";
        billDetails.additionalDiscount = "0";
        billDetails.totalAmount = "0";
      }

      setFormData({
        patient: patientForm,
        admission: admissionDetails,
        bill: billDetails,
      });
      setDeletedPayments([]);
      setUpdatedPayments([]);
      setNewPayments([]);
    }
  }, [ipdAdmissionDetailsFullStatus, ipdAdmissionDetailsFull]);

  useEffect(() => {
    if (open) {
      dispatch(fetchRooms());
      if (servicesStatus === "idle") {
        dispatch(fetchServices());
      }
    }
  }, [open, dispatch, servicesStatus]);

  const handleInputChange = useCallback((e) => {
    const { id, value, type, checked } = e.target;
    const [section, ...fieldParts] = id.split(".");
    const fieldName = fieldParts.join(".");

    setFormData((prev) => {
      const newState = { ...prev };
      let current = newState[section];

      // Handle nested fields (e.g., admission.vitals.admission.bloodPressure)
      const keys = fieldName.split(".");
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;

      if (section === "bill") {
        if (keys[0] === "totalAmount") {
          const newTotalAmountStr = value;
          const newTotalAmountNum = Number(newTotalAmountStr) || 0;
          let currentSubtotalNum = newState.bill.services.reduce(
            (sum, s) => sum + Number(s.rate) * Number(s.quantity),
            0
          );

          if (newState.bill.services.length === 0) {
            newState.bill.subtotal = newTotalAmountStr;
            newState.bill.additionalDiscount = "0";
          } else {
            newState.bill.subtotal = currentSubtotalNum.toString();
            const newDiscountNum = Math.max(
              0,
              currentSubtotalNum - newTotalAmountNum
            );
            newState.bill.additionalDiscount = newDiscountNum.toString();
          }
          newState.bill.totalAmount = newTotalAmountStr; // Already set by generic handler, but ensure it is string
        }

        // Recalculate amountPaid if a payment amount changes
        if (keys[0] === "paymentMethod" && keys[2] === "amount") {
          newState.bill.amountPaid = newState.bill.paymentMethod
            .reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0)
            .toString();
        }
      }
      return newState;
    });
  }, []);

  const handleSelectChange = useCallback(
    (id, value) => {
      handleInputChange({ target: { id, value } });
    },
    [handleInputChange]
  );

  const handleDobChange = useCallback(
    (e) => {
      const dateOfBirth = e.target.value;
      const age = dateOfBirth
        ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
        : "";
      handleInputChange({
        target: { id: "patient.dateOfBirth", value: dateOfBirth },
      });
      handleInputChange({
        target: { id: "patient.age", value: age.toString() },
      });
    },
    [handleInputChange]
  );

  const handleAgeChange = useCallback(
    (e) => {
      const age = e.target.value;
      handleInputChange({ target: { id: "patient.age", value: age } });
      // Optionally clear DOB if age is manually entered
      // handleInputChange({ target: { id: "patient.dateOfBirth", value: "" } });
    },
    [handleInputChange]
  );

  const handlePaymentChange = (index, field, value) => {
    const updatedPaymentMethods = [...formData.bill.paymentMethod];
    const paymentToUpdate = { ...updatedPaymentMethods[index] };
    paymentToUpdate[field] = value;
    updatedPaymentMethods[index] = paymentToUpdate;

    // Track changes for submission
    if (paymentToUpdate._id) {
      // Existing payment
      const original = originalPayments.find(
        (op) => op._id === paymentToUpdate._id
      );
      if (
        original &&
        (original.method !== paymentToUpdate.method ||
          original.amount !== paymentToUpdate.amount)
      ) {
        // Add to updatedPayments or update existing entry
        const existingUpdateIndex = updatedPayments.findIndex(
          (up) => up._id === paymentToUpdate._id
        );
        if (existingUpdateIndex > -1) {
          const newUpdated = [...updatedPayments];
          newUpdated[existingUpdateIndex] = {
            _id: paymentToUpdate._id,
            method: paymentToUpdate.method,
            amount: Number(paymentToUpdate.amount),
          };
          setUpdatedPayments(newUpdated);
        } else {
          setUpdatedPayments([
            ...updatedPayments,
            {
              _id: paymentToUpdate._id,
              method: paymentToUpdate.method,
              amount: Number(paymentToUpdate.amount),
            },
          ]);
        }
      } else if (
        original &&
        original.method === paymentToUpdate.method &&
        original.amount === paymentToUpdate.amount
      ) {
        // If change reverts to original, remove from updatedPayments
        setUpdatedPayments(
          updatedPayments.filter((up) => up._id !== paymentToUpdate._id)
        );
      }
    } else {
      // New payment (has tempId)
      const existingNewIndex = newPayments.findIndex(
        (np) => np.tempId === paymentToUpdate.tempId
      );
      if (existingNewIndex > -1) {
        const newNew = [...newPayments];
        newNew[existingNewIndex] = {
          tempId: paymentToUpdate.tempId,
          method: paymentToUpdate.method,
          amount: Number(paymentToUpdate.amount),
        };
        setNewPayments(newNew);
      } else {
        // This case should ideally not happen if tempId is set on add
      }
    }

    const newAmountPaid = updatedPaymentMethods.reduce(
      (sum, pm) => sum + (Number(pm.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      bill: {
        ...prev.bill,
        paymentMethod: updatedPaymentMethods,
        amountPaid: newAmountPaid.toString(),
      },
    }));
  };

  const handleAddPayment = () => {
    const tempId = Date.now().toString();
    const newPayment = { tempId, method: "Cash", amount: "" };
    setFormData((prev) => ({
      ...prev,
      bill: {
        ...prev.bill,
        paymentMethod: [...prev.bill.paymentMethod, newPayment],
      },
    }));
    setNewPayments([...newPayments, { tempId, method: "Cash", amount: 0 }]);
  };

  const handleDeletePayment = (index) => {
    const paymentToDelete = formData.bill.paymentMethod[index];
    if (paymentToDelete._id) {
      // Existing payment
      setDeletedPayments([...deletedPayments, paymentToDelete._id]);
      // Remove from updatedPayments if it was there
      setUpdatedPayments(
        updatedPayments.filter((up) => up._id !== paymentToDelete._id)
      );
    } else {
      // New payment
      setNewPayments(
        newPayments.filter((np) => np.tempId !== paymentToDelete.tempId)
      );
    }

    const updatedPaymentMethods = formData.bill.paymentMethod.filter(
      (_, i) => i !== index
    );
    const newAmountPaid = updatedPaymentMethods.reduce(
      (sum, pm) => sum + (Number(pm.amount) || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      bill: {
        ...prev.bill,
        paymentMethod: updatedPaymentMethods,
        amountPaid: newAmountPaid.toString(),
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient.name) newErrors.name = "Full name is required";
    if (!formData.patient.gender) newErrors.gender = "Gender is required";
    if (!formData.patient.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.patient.dateOfBirth && !formData.patient.age)
      newErrors.age = "Age or Date of birth is required";
    if (!formData.admission.department)
      newErrors.department = "Department is required";
    if (!formData.admission.assignedDoctor?._id)
      newErrors.doctor = "Doctor is required";
    // Add more IPD specific validations if necessary
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        patient: formData.patient,
        admission: {
          ...formData.admission,
          // Ensure assignedDoctor is sent as ID if it's an object
          assignedDoctor:
            formData.admission.assignedDoctor?._id ||
            formData.admission.assignedDoctor,
        },
        bill: {
          billId: formData.bill.billId,
          services: formData.bill.services.map((s) => ({
            // Send updated services
            serviceId: s.serviceId,
            name: s.name,
            quantity: Number(s.quantity) || 1,
            rate: Number(s.rate) || 0,
            category: s.category,
            date: s.date,
          })),
          subtotal: Number(formData.bill.subtotal) || 0,
          additionalDiscount: Number(formData.bill.additionalDiscount) || 0,
          totalAmount: Number(formData.bill.totalAmount), // This should be correctly calculated
          amountPaid: Number(formData.bill.amountPaid),
        },
        payments: {
          // This structure matches backend expectation in editPatient route for OPD
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
      try {
        await dispatch(
          editIPDAdmission({
            admissionId: admissionData._id,
            data: submissionData,
          })
        ).unwrap();
        toast({
          title: "Success",
          description: "IPD record updated successfully.",
          variant: "success",
        });
        // dispatch(
        //   fetchPatients({
        //     // Refresh patient list
        //     startDate: new Date().toLocaleDateString("en-CA"), // Today
        //     endDate: new Date(
        //       new Date().setDate(new Date().getDate() + 1)
        //     ).toLocaleDateString("en-CA"), // Tomorrow
        //   })
        // );
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update IPD record.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    if (ipdAdmissionDetailsFull) {
      // Repopulate form with the originally fetched data
      const data = ipdAdmissionDetailsFull;
      const patientFromData = data.patient || {}; // Renamed to avoid conflict
      const admissionDetailsInit = { ...initialFormData.admission, ...data }; // Renamed
      const billDetailsInit = { ...initialFormData.bill }; // Renamed

      const patientForm = {
        name: patientFromData.name || "",
        registrationNumber:
          data.registrationNumber || patientFromData.registrationNumber || "",
        dateOfBirth: patientFromData.dateOfBirth
          ? new Date(patientFromData.dateOfBirth).toISOString().split("T")[0]
          : "",
        age: patientFromData.age || "",
        gender: patientFromData.gender || "",
        contactNumber: patientFromData.contactNumber || "",
        address: patientFromData.address || "",
        bloodType: patientFromData.bloodType || "",
      };

      admissionDetailsInit.department = data.department || "";
      admissionDetailsInit.assignedDoctor = data.assignedDoctor
        ? { _id: data.assignedDoctor._id, name: data.assignedDoctor.name }
        : { _id: "", name: "" };
      admissionDetailsInit.operationName = data.operationName || "";
      admissionDetailsInit.referredBy = data.referredBy || "";
      admissionDetailsInit.assignedRoom =
        data.assignedRoom?._id || data.assignedRoom || "";
      admissionDetailsInit.assignedBed = data.assignedBed || "";
      admissionDetailsInit.diagnosis = data.diagnosis || "";
      admissionDetailsInit.ipdNumber = data.ipdNumber || "";
      admissionDetailsInit.conditionOnAdmission =
        data.conditionOnAdmission || "";
      admissionDetailsInit.bookingDate = data.bookingDate
        ? new Date(data.bookingDate).toISOString().split("T")[0]
        : "";
      admissionDetailsInit.bookingTime = data.bookingTime || "";
      admissionDetailsInit.guardianName = data.guardianName || "";
      admissionDetailsInit.relation = data.relation || "";
      if (data.vitals) {
        admissionDetailsInit.vitals.admission = {
          ...initialFormData.admission.vitals.admission,
          ...(data.vitals.admission || data.vitals),
        };
      }
      if (data.insuranceDetails) {
        admissionDetailsInit.insuranceDetails = {
          ...initialFormData.admission.insuranceDetails,
          ...data.insuranceDetails,
        };
      }
      if (data.timeSlot) {
        admissionDetailsInit.timeSlot = {
          ...initialFormData.admission.timeSlot,
          ...data.timeSlot,
        };
      }

      if (data.bills && data.bills.services && data.bills.services.length > 0) {
        const latestBill = data.bills.services[data.bills.services.length - 1];
        billDetailsInit.billId = latestBill._id;

        billDetailsInit.services =
          latestBill.services?.map((s) => ({
            serviceId: s.serviceId || s._id || s.id,
            name: s.name,
            quantity: s.quantity || 1,
            rate: s.rate || 0,
            category: s.category || "Other",
            date: s.date
              ? new Date(s.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          })) || [];

        const calculatedSubtotal = billDetailsInit.services.reduce(
          (sum, s) => sum + Number(s.rate) * Number(s.quantity),
          0
        );

        if (billDetailsInit.services.length === 0) {
          billDetailsInit.totalAmount = (
            latestBill.totalAmount || 0
          ).toString();
          billDetailsInit.subtotal = billDetailsInit.totalAmount;
          billDetailsInit.additionalDiscount = "0";
        } else {
          billDetailsInit.subtotal = calculatedSubtotal.toString();
          const dbTotalAmount =
            latestBill.totalAmount !== undefined &&
            latestBill.totalAmount !== null
              ? Number(latestBill.totalAmount)
              : calculatedSubtotal;
          billDetailsInit.totalAmount = dbTotalAmount.toString();
          billDetailsInit.additionalDiscount = Math.max(
            0,
            calculatedSubtotal - dbTotalAmount
          ).toString();
        }

        if (latestBill.payments && latestBill.payments.length > 0) {
          const payments = latestBill.payments.map((p) => ({
            _id: p._id,
            method: p.paymentMethod,
            amount: p.amount.toString(),
          }));
          billDetailsInit.paymentMethod = payments;
          setOriginalPayments(payments.map((p) => ({ ...p })));
        } else {
          billDetailsInit.paymentMethod = [];
          setOriginalPayments([]);
        }
        billDetailsInit.amountPaid = billDetailsInit.paymentMethod
          .reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0)
          .toString();
      } else {
        billDetailsInit.paymentMethod = [];
        setOriginalPayments([]);
        billDetailsInit.amountPaid = "0";
        billDetailsInit.services = [];
        billDetailsInit.subtotal = "0";
        billDetailsInit.additionalDiscount = "0";
        billDetailsInit.totalAmount = "0";
      }

      setFormData({
        patient: patientForm,
        admission: admissionDetailsInit, // Use renamed variable
        bill: billDetailsInit, // Use renamed variable
      });
      setErrors({});
      setDeletedPayments([]);
      setUpdatedPayments([]);
      setNewPayments([]);
    } else {
      setFormData(initialFormData);
      setErrors({});
    }
  };

  const getDisplayServices = useCallback(() => {
    // Get the selected room service if any

    // Get all available services from the services array
    const availableServices = services
      .filter((service) => service.category === "Surgery")
      .map((service) => ({
        ...service,
        isRoom: false,
      }));

    // Combine room service (if exists) with available services
    return availableServices;
  }, [services]);


  const handleServicesChange = (selectedServicesFromDialog) => {
    // selectedServicesFromDialog is an array of { id, rate }
    const allAvailableServices = services || [];

    const newBillServices = selectedServicesFromDialog.map((selService) => {
      const fullService = allAvailableServices.find(
        (s) => s._id === selService.id
      );
      return {
        serviceId: selService.id,
        name: fullService?.name || "Unknown Service",
        quantity: 1, // Default quantity
        rate: selService.rate, // Use rate from dialog
        category: fullService?.category || "Other",
        date: new Date().toISOString().split("T")[0], // Default to today
      };
    });

    const newSubtotal = newBillServices.reduce(
      (sum, s) => sum + Number(s.rate) * Number(s.quantity),
      0
    );
    const currentDiscount = Number(formData.bill.additionalDiscount) || 0;
    const newTotalAmount = newSubtotal - currentDiscount;

    setFormData((prev) => ({
      ...prev,
      bill: {
        ...prev.bill,
        services: newBillServices,
        subtotal: newSubtotal.toString(),
        totalAmount: newSubtotal.toString(), // Total amount defaults to subtotal
        additionalDiscount: "0", // Discount is reset
      },
    }));
  };

  if (ipdAdmissionDetailsFullStatus === "loading" && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={` ${
          isMobile ? "w-[95vw] p-4 rounded-lg gap-0 " : "max-w-[1000px]"
        } h-[${isMobile ? "80vh" : "70vh"}] overflow-y-auto px-4`}
      >
        <DialogHeader className="mb-4 md:mb-0">
          <DialogTitle>Edit IPD Patient Details</DialogTitle>
          <DialogDescription className={isMobile ? "hidden" : ""}>
            Modify the patient's IPD admission, billing, and personal
            information.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className={`space-y-4 h-[calc(${isMobile ? "80vh" : "70vh"}-115px)]`}
        >
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList
              className={`grid w-full ${
                isMobile ? "grid-cols-3" : "grid-cols-3" // Changed from 4 to 3
              }`}
            >
              <TabsTrigger value="basic-info">
                {isMobile ? "Basic" : "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>{" "}
              {/* New Insurance Tab */}
            </TabsList>

            <TabsContent value="basic-info">
              <div
                className={`grid ${
                  isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                } mt-4 gap-4`}
              >
                {/* Column 1: Patient Demographics & Identifiers */}
                <div className="space-y-4">
                  <MemoizedInput
                    id="patient.name"
                    label="Full Name"
                    value={formData.patient.name}
                    onChange={handleInputChange}
                    error={errors.name}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <MemoizedInput
                      id="patient.age"
                      label="Age"
                      type="number"
                      value={formData.patient.age}
                      onChange={handleAgeChange}
                      error={errors.age}
                    />
                    <MemoizedInput
                      id="patient.dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={formData.patient.dateOfBirth}
                      onChange={handleDobChange}
                      tabIndex={-1}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <MemoizedInput
                      id="patient.registrationNumber"
                      label="UHID Number"
                      value={formData.patient.registrationNumber}
                      onChange={handleInputChange}
                      disabled
                    />
                    <MemoizedInput
                      id="admission.ipdNumber"
                      label="IPD Number"
                      value={formData.admission.ipdNumber}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <Select
                    id="patient.gender"
                    value={formData.patient.gender}
                    onValueChange={(value) =>
                      handleSelectChange("patient.gender", value)
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
                  {errors.gender && (
                    <p className="text-xs text-red-500">{errors.gender}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <MemoizedInput
                      id="admission.bookingDate"
                      label="Booking Date"
                      type="date"
                      value={formData.admission.bookingDate}
                      onChange={handleInputChange}
                      tabIndex={-1}
                    />
                    <div className="relative">
                      <Input
                        type="time"
                        id="admission.bookingTime"
                        value={formData.admission.bookingTime?.split(" ")[0]}
                        onChange={(e) => {
                          const time12 = convertTo12Hour(e.target.value);
                          handleInputChange({
                            target: {
                              id: "admission.bookingTime",
                              value: time12,
                            },
                          });
                        }}
                        tabIndex={-1}
                        className="peer pl-2 pt-2 pb-2 block w-full border rounded-md"
                      />
                      <Label
                        htmlFor="admission.bookingTime"
                        className="absolute text-xs transform -translate-y-3 top-1 z-10 origin-[0] left-2 px-1 bg-white text-gray-500"
                      >
                        Booking Time
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Column 2: Admission Core Details & Guardian Info */}
                <div className="space-y-4">
                  <MemoizedInput
                    id="patient.contactNumber"
                    label="Phone"
                    value={formData.patient.contactNumber}
                    onChange={handleInputChange}
                    error={errors.contactNumber}
                  />
                  <Textarea
                    id="patient.address"
                    placeholder="Address"
                    value={formData.patient.address}
                    onChange={handleInputChange}
                    className="min-h-9 h-9 no-scrollbar"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FloatingLabelSelect
                      id="admission.relation"
                      label="Guardian Relation"
                      value={formData.admission.relation}
                      onValueChange={(value) =>
                        handleSelectChange("admission.relation", value)
                      }
                    >
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Husband">Husband</SelectItem>
                      <SelectItem value="Wife">Wife</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </FloatingLabelSelect>
                    <MemoizedInput
                      id="admission.guardianName"
                      label="Guardian Name"
                      value={formData.admission.guardianName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FloatingLabelSelect
                      id="admission.assignedRoom"
                      label="Assigned Room"
                      value={formData.admission.assignedRoom}
                      onValueChange={(value) =>
                        handleSelectChange("admission.assignedRoom", value)
                      }
                    >
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.roomNumber} - {room.type}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      id="admission.assignedBed"
                      label="Assigned Bed"
                      value={formData.admission.assignedBed}
                      onValueChange={(value) =>
                        handleSelectChange("admission.assignedBed", value)
                      }
                      disabled={!formData.admission.assignedRoom}
                    >
                      {formData.admission.assignedRoom &&
                        rooms
                          .find(
                            (r) => r._id === formData.admission.assignedRoom
                          )
                          ?.beds.filter(
                            (b) =>
                              b.status !== "Occupied" ||
                              b._id === formData.admission.assignedBed
                          )
                          .map((bed) => (
                            <SelectItem key={bed._id} value={bed._id}>
                              {bed.bedNumber}
                            </SelectItem>
                          ))}
                    </FloatingLabelSelect>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <FloatingLabelSelect
                      id="admission.department"
                      label="Department"
                      value={formData.admission.department}
                      onValueChange={(value) =>
                        handleSelectChange("admission.department", value)
                      }
                      error={errors.department}
                    >
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      id="admission.assignedDoctor"
                      label="Consulting Doctor"
                      value={formData.admission.assignedDoctor?._id}
                      onValueChange={(value) => {
                        const doctor = doctors.find((d) => d._id === value);
                        handleSelectChange(
                          "admission.assignedDoctor",
                          doctor
                            ? { _id: doctor._id, name: doctor.name }
                            : { _id: "", name: "" }
                        );
                      }}
                      error={errors.doctor}
                    >
                      {doctors.map((doc) => (
                        <SelectItem key={doc._id} value={doc._id}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                  </div>
                  <MemoizedInput
                    id="admission.referredBy"
                    label="Referred By"
                    value={formData.admission.referredBy}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-3 gap-1">
                    <MemoizedInput
                      id="bill.totalAmount"
                      label="Total (₹)"
                      value={
                        formData.bill.totalAmount?.toLocaleString("en-IN") ||
                        "0"
                      }
                      onChange={handleInputChange} // Ensure this is editable
                      className="font-semibold" // No longer disabled generally
                    />
                    <MemoizedInput
                      label="Paid(₹)"
                      value={
                        formData.bill.amountPaid?.toLocaleString("en-IN") || "0"
                      }
                      disabled
                      className="bg-gray-100"
                    />
                    <Button
                      variant="outline"
                      className={`
                                 ${
                                   errors["admission.operationName"]
                                     ? "border-red-500 text-red-500 hover:bg-red-50 "
                                     : "border-primary text-primary"
                                 }
                               `}
                      onClick={handleInfoClick}
                      size="sm"
                    >
                      {formData.admission?.operationName
                        ? formData.admission?.operationName.length > 15
                          ? `${formData.admission?.operationName.slice(
                              0,
                              15
                            )}...`
                          : formData.admission?.operationName
                        : "Select Operations"}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Payment History</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPayment}
                      className=" px-2 text-xs"
                    >
                      Add Payment
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-y-auto">
                    <ScrollArea className="h-[50px]">
                      <div className="p-2 space-y-1.5">
                        {formData.bill.paymentMethod.map((payment, index) => (
                          <div
                            key={payment._id || payment.tempId}
                            className="flex items-center gap-1"
                          >
                            <Select
                              value={payment.method}
                              onValueChange={(value) =>
                                handlePaymentChange(index, "method", value)
                              }
                            >
                              <SelectTrigger className="w-[100px] h-7 text-xs">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((m) => (
                                  <SelectItem
                                    key={m.name}
                                    value={m.name}
                                    className="text-xs"
                                  >
                                    {m.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={payment.amount}
                              onChange={(e) =>
                                handlePaymentChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-[100px] h-7 text-xs"
                              placeholder="Amount"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePayment(index)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {formData.bill.paymentMethod.length === 0 && (
                          <p className="text-xs text-center text-gray-500 p-2">
                            No payments recorded.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals">
              <div className="grid grid-cols-2 gap-1">
                <Textarea
                  id="admission.diagnosis"
                  placeholder="Diagnosis (Optional)"
                  value={formData.admission.diagnosis}
                  onChange={handleInputChange}
                />
                <Textarea
                  id="admission.conditionOnAdmission"
                  placeholder="Condition on Admission (Optional)"
                  value={formData.admission.conditionOnAdmission}
                  onChange={handleInputChange}
                />
              </div>
              <h4 className="font-semibold text-sm mt-4">Admission Vitals</h4>
              <div
                className={`grid ${
                  isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"
                } mt-4 gap-x-4 gap-y-6`}
              >
                <MemoizedInput
                  id="admission.vitals.admission.weight"
                  label="Weight (kg)"
                  value={formData.admission.vitals.admission.weight}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.height"
                  label="Height (cm)"
                  value={formData.admission.vitals.admission.height}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.bloodPressure"
                  label="Blood Pressure"
                  value={formData.admission.vitals.admission.bloodPressure}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.heartRate"
                  label="Heart Rate"
                  value={formData.admission.vitals.admission.heartRate}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.temperature"
                  label="Temperature (°F)"
                  value={formData.admission.vitals.admission.temperature}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.oxygenSaturation"
                  label="Oxygen Sat. (%)"
                  value={formData.admission.vitals.admission.oxygenSaturation}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.vitals.admission.respiratoryRate"
                  label="Respiratory Rate"
                  value={formData.admission.vitals.admission.respiratoryRate}
                  onChange={handleInputChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="insurance">
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MemoizedInput
                  id="admission.insuranceDetails.provider"
                  label="Insurance Provider (Optional)"
                  value={formData.admission.insuranceDetails.provider}
                  onChange={handleInputChange}
                />
                <MemoizedInput
                  id="admission.insuranceDetails.policyNumber"
                  label="Policy Number (Optional)"
                  value={formData.admission.insuranceDetails.policyNumber}
                  onChange={handleInputChange}
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className={`mt-4 ${isMobile ? "mb-8" : ""}`}>
            <div
              className={`w-full flex ${
                isMobile
                  ? "flex-col-reverse space-y-2"
                  : "flex-row justify-end space-x-2"
              } `}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className={`${isMobile ? "w-full" : ""}`}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  editIPDAdmissionStatus === "loading" ||
                  ipdAdmissionDetailsFullStatus === "loading"
                }
                className={`${isMobile ? "w-full" : ""}`}
              >
                {editIPDAdmissionStatus === "loading" ||
                ipdAdmissionDetailsFullStatus === "loading" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
        <SelectServicesDialog
          isOpen={isSelectServicesDialogOpen}
          onClose={() => setIsSelectServicesDialogOpen(false)}
          services={getDisplayServices()}
          selectedServices={
            formData.bill.services?.map((s) => ({
              id: s.serviceId,
              rate: s.rate,
            })) || []
          }
          onServicesChange={handleServicesChange}
        />
      </DialogContent>
    </Dialog>
  );
}
