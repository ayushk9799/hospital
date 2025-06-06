import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../ui/button";
import { FloatingLabelSelect } from "./PatientInfoForm";
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
  fetchPatients,
  registerPatient,
  readmitPatient,
  searchPatients,
  fetchRegistrationAndIPDNumbers,
} from "../../../redux/slices/patientSlice";
import { fetchRooms } from "../../../redux/slices/roomSlice";
import { validateForm, formatSubmissionData } from "./ipdRegHelpers";
import { useToast } from "../../../hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import MemoizedInput from "./MemoizedInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { fetchBills } from "../../../redux/slices/BillingSlice";
import { useMediaQuery } from "../../../hooks/use-media-query";
import SelectServicesDialog from "./SelectServicesDialog";
import { fetchServices } from "../../../redux/slices/serviceSlice";
import { fetchTemplates } from "../../../redux/slices/templatesSlice";
import BillModal from "./BillModal";
import { fetchHospitalInfo } from "../../../redux/slices/HospitalSlice";
import MultiSelectInput from "../MultiSelectInput";
import { Label } from "../../ui/label";
import { convertTo12Hour } from "../../../assets/Data";

const paymentMethods = [
  { name: "Cash" },
  { name: "UPI" },
  { name: "Card" },
  { name: "Insurance" },
];




export default function IPDRegDialog({ open, onOpenChange, patientData }) {
  const departments = useSelector((state) => state.departments.departments);
  const rooms = useSelector((state) => state.rooms.rooms);
  const doctors = useSelector((state) => state.staff.doctors);
  const initialFormData = {
    name: "",
    registrationNumber: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    bloodType: "",
    patientType: "IPD",
    paymentInfo: {
      includeServices: true,
      amountPaid: "",
      paymentMethod: [],
      services: [],
      totalAmount: "",
      additionalDiscount: 0,
    },
    upgradegenReg: false,
    upgradegenIpd: false,
    admission: {
      department: departments.length === 1 ? departments[0]._id : "",
      assignedDoctor: doctors.length === 1 ? doctors[0]._id : "",
      operationName: "",
      referredBy: "",

      assignedRoom: "",
      assignedBed: "",
      diagnosis: "",
      ipdNumber: "",
      vitals: {
        admission: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          oxygenSaturation: "",
          respiratoryRate: "",
        },
        discharge: {
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
  };

  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector(
    (state) => state.patients.registerPatientStatus
  );

  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);
  const hospitalInfoStatus = useSelector(
    (state) => state.hospital.hospitalInfoStatus
  );

  const [formData, setFormData] = useState(initialFormData);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      admission: {
        ...prev.admission,
        department: departments.length === 1 ? departments[0].name : "",
        assignedDoctor: doctors.length === 1 ? doctors[0]._id : "",
      },
    }));
  }, [departments, doctors, open]);
  const [errors, setErrors] = useState({});
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isSelectServicesDialogOpen, setIsSelectServicesDialogOpen] =
    useState(false);
  const { services, servicesStatus } = useSelector((state) => state.services);
  const { serviceBillCollections, status } = useSelector(
    (state) => state.templates
  );
  const [totalAmount, setTotalAmount] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const [completedBill, setCompletedBill] = useState(null);
  const [roomCharge, setRoomCharge] = useState(0);
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [generatedNumbers, setGeneratedNumbers] = useState({
    registrationNumber: null,
    ipdNumber: null,
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
    if (servicesStatus === "idle") {
      dispatch(fetchServices());
    }
  }, [dispatch, status, servicesStatus]);

  useEffect(() => {
    // Only calculate room charge when room is selected
    if (formData.admission.assignedRoom) {
      const selectedRoom = rooms.find(
        (room) => room._id === formData.admission.assignedRoom
      );
      if (selectedRoom) {
        setRoomCharge(selectedRoom.ratePerDay || 0);
      } else {
        setRoomCharge(0);
      }
    }
  }, [formData.admission.assignedRoom, rooms]);

  useEffect(() => {
    // Calculate total using services plus room charge
    const servicesTotal = formData.paymentInfo.services.reduce(
      (sum, service) => sum + (service.rate || 0),
      0
    );

    const totalWithRoom = servicesTotal + roomCharge;

    setFormData((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        totalAmount: totalWithRoom,
      },
    }));
    setTotalAmount(totalWithRoom);
  }, [formData.paymentInfo.services, services, roomCharge]);

  useEffect(() => {
    if (hospitalInfoStatus === "idle") {
      dispatch(fetchHospitalInfo());
    }
  }, [dispatch, hospitalInfoStatus]);

  // Function to reset form data
  const resetFormData = useCallback(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors({});
      setTotalAmount("");
      setRoomCharge(0);
      setSearchedPatient(null);
    }
  }, [open]);

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
        name: sourceData.name || "",
        age: sourceData.age || "",
        gender: sourceData.gender || "",
        contactNumber: sourceData.contactNumber || "",
        email: sourceData.email || "",
        address: sourceData.address || "",
        registrationNumber: sourceData.registrationNumber || "",
        dateOfBirth: sourceData.dateOfBirth || "",
        bloodType: sourceData.bloodType || "",
        // Keep existing admission and payment info
        admission: {
          ...prev.admission,
          guardianName: tempGuardianName,
          relation: tempRelation,
          // bookingTime will be set by the dedicated effect below
        },
        paymentInfo: {
          ...prev.paymentInfo,
        },
      }));
    }
  }, [patientData, searchedPatient, open]);

  useEffect(() => {
    if (!open) {
      dispatch(fetchRooms());
      resetFormData();
      setTotalAmount(""); // Reset total amount
      setRoomCharge(0); // Reset room charge
      setTimeout(() => {
        document.body.style = "";
      }, 500);
      setSearchedPatient(null);
    }
  }, [open, resetFormData, dispatch]);

  useEffect(() => {
    if (open && !patientData && !searchedPatient) {
      dispatch(fetchRegistrationAndIPDNumbers())
        .unwrap()
        .then((numbers) => {
          setGeneratedNumbers({
            registrationNumber: numbers.registrationNumber,
            ipdNumber: numbers.ipdNumber,
          });
          setFormData((prev) => ({
            ...prev,
            registrationNumber: numbers.registrationNumber,
            admission: {
              ...prev.admission,
              ipdNumber: numbers.ipdNumber,
            },
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch numbers:", error);
        });
    }
  }, [open, dispatch, patientData, searchedPatient]);

  // Effect to set current time when dialog opens
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        admission: {
          ...prev.admission,
          bookingDate: new Date()
            .toLocaleDateString("en-IN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .split("/")
            .reverse()
            .join("-"),
          bookingTime: convertTo12Hour(
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          ),
        },
      }));
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => {
      const keys = id.split(".");
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      if (id === "paymentInfo.paymentMethod") {
        current.paymentInfo.paymentMethod = [
          ...current.paymentInfo.paymentMethod,
          { method: value || "", amount: "" },
        ];
      }
      if (id === "admission.assignedRoom") {
        const selectedRoom = rooms.find((room) => room._id === value);
        if (selectedRoom) {
          setRoomCharge(selectedRoom.ratePerDay || 0);
        } else {
          setRoomCharge(0);
        }
      }

      return newState;
    });
  };

  const handleDobChange = useCallback(
    (e) => {
      const dateOfBirth = e.target.value;
      const age = dateOfBirth
        ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
        : "";
      handleInputChange({ target: { id: "dateOfBirth", value: dateOfBirth } });
      handleInputChange({ target: { id: "age", value: age.toString() } });
    },
    [handleInputChange]
  );

  const handleAgeChange = useCallback(
    (e) => {
      const age = e.target.value;
      handleInputChange({ target: { id: "age", value: age } });
      handleInputChange({ target: { id: "dateOfBirth", value: "" } });
    },
    [handleInputChange]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add validation for registration and IPD numbers
    if (formData.registrationNumber === generatedNumbers?.registrationNumber) {
      formData.upgradegenReg = true;
    }
    if (formData.admission.ipdNumber === generatedNumbers?.ipdNumber) {
      formData.upgradegenIpd = true;
    }
    if (validateForm(formData, setErrors)) {
      const submissionData = formatSubmissionData(formData);

      if (patientData || searchedPatient) {
        // This is a readmission
        dispatch(
          readmitPatient({
            patientId: patientData?._id || searchedPatient?._id,
            admission: submissionData,
          })
        )
          .unwrap()
          .then((result) => {
            toast({
              title: "Patient admitted successfully",
              description: "The patient has been admitted.",
              variant: "success",
            });
            dispatch(
              fetchPatients({
                startDate: new Date()
                  .toLocaleDateString("en-IN")
                  .split("/")
                  .reverse()
                  .join("-"),
              })
            );
            dispatch(fetchRooms());
            dispatch(fetchBills());
            setBillData(result.bill);
            setCompletedBill(result);
            setShowBillModal(true);
          })
          .catch((error) => {
            toast({
              title: "Failed to admit patient",
              description:
                error.message ||
                "There was an error admitting the patient. Please try again.",
              variant: "destructive",
            });
          })
          .finally(() => {
            onOpenChange(false);
          });
      } else {
        // This is a new patient registration
        dispatch(registerPatient(submissionData))
          .unwrap()
          .then((result) => {
            toast({
              title: "Patient registered successfully",
              description: "The new patient has been added.",
              variant: "success",
            });
            onOpenChange(false);
            dispatch(
              fetchPatients({
                startDate: new Date()
                  .toLocaleDateString("en-IN")
                  .split("/")
                  .reverse()
                  .join("-"),
              })
            );
            dispatch(fetchRooms());
            dispatch(fetchBills());
            setBillData(result.bill);
            setCompletedBill(result);
            setShowBillModal(true);
          })
          .catch((error) => {
            toast({
              title: "Failed to register patient",
              description:
                error.message ||
                "There was an error registering the patient. Please try again.",
              variant: "destructive",
            });
          })
          .finally(() => {});
      }
    }
  };
  const handleAmountPaidChange = (method, amount) => {
    setFormData((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        paymentMethod: prev.paymentInfo.paymentMethod.map((pm) =>
          pm.method === method ? { ...pm, amount } : pm
        ),
        amountPaid: prev.paymentInfo.paymentMethod.reduce(
          (sum, pm) => sum + (pm.amount ? parseFloat(pm.amount) : 0),
          0
        ),
      },
    }));
  };

  useEffect(() => {
    const amountPaid = formData.paymentInfo.paymentMethod.reduce(
      (sum, pm) => sum + (pm.amount ? parseFloat(pm.amount) : 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, amountPaid },
    }));
  }, [formData.paymentInfo.paymentMethod]);
  const handleDialogClose = () => {
    setTimeout(() => {
      document.body.style = "";
    }, 500);
    onOpenChange(false);
    resetFormData();
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setTotalAmount(""); // Reset total amount
    setRoomCharge(0); // Reset room charge
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style = "";
      }, 500);
    }
  }, [open]);

  const handleInfoClick = (e) => {
    e.preventDefault();
    setIsSelectServicesDialogOpen(true);
  };

  const handleServicesChange = (selectedServices) => {
    const actualServices = selectedServices.filter(
      (service) => service.id !== "room-charge"
    );

    setFormData((prevData) => ({
      ...prevData,
      admission: {
        ...prevData.admission,
        operationName: services
          .filter(
            (ser) =>
              ser.category === "Surgery" &&
              actualServices.some((s) => s.id === ser._id)
          )
          .map((ser) => ser.name)
          .join(","),
      },
      paymentInfo: {
        ...prevData.paymentInfo,
        services: actualServices,
      },
    }));
  };
  // Add this function to get all services including room for display
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
  }, [ services]);

  const handleSearch = async () => {
    if (!formData.registrationNumber) return;

    try {
      const result = await dispatch(
        searchPatients({searchQuery:formData.registrationNumber?.trim()})
      ).unwrap();
      if (result.results?.patients && result.results?.patients?.length > 0) {
        const patient = result.results?.patients?.[0];
        setSearchedPatient({
          ...patient,
          isFromSearch: true,
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handlePaymentMethodChange = (newMethods) => {
    setFormData((prev) => {
      // Get existing payment methods with their amounts
      const existingPayments = prev.paymentInfo.paymentMethod.reduce(
        (acc, pm) => {
          acc[pm.method] = pm.amount;
          return acc;
        },
        {}
      );

      // Create new payment method array preserving existing amounts
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={` ${
            isMobile ? "w-[95vw] p-4 rounded-lg gap-0 " : "max-w-[1000px]"
          } h-[${isMobile ? "70vh" : "60vh"}] overflow-y-auto px-4`}
        >
          <DialogHeader className="mb-4 md:mb-0">
            <DialogTitle>
              {patientData ? "Admit IPD Patient" : "Register New IPD Patient"}
            </DialogTitle>
            <DialogDescription className={isMobile ? "hidden" : ""}>
              {patientData
                ? "Fill details for patient Admission"
                : "Fill basic details of patient for new IPD registration"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 h-[calc(${
              isMobile ? "70vh" : "60vh"
            }-115px)]`}
          >
            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList
                className={`grid w-full ${
                  isMobile ? "grid-cols-3" : "grid-cols-3"
                }`}
              >
                <TabsTrigger value="basic-info">
                  {isMobile ? "Basic" : "Basic Information"}
                </TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info">
                <div
                  className={`grid ${
                    isMobile ? "grid-cols-1" : "grid-cols-3"
                  } mt-4 gap-4`}
                >
                  <div className="space-y-4">
                    <MemoizedInput
                      id="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                    />
                    {isMobile ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <MemoizedInput
                            id="age"
                            label="Age"
                            type="number"
                            value={formData.age}
                            onChange={handleAgeChange}
                            error={errors.age}
                          />
                          <div className="relative">
                            <MemoizedInput
                              id="registrationNumber"
                              label="UHID Number"
                              tabIndex={-1}
                              value={formData.registrationNumber}
                              onChange={handleInputChange}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <Search className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div>
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
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="relative">
                            <MemoizedInput
                              id="registrationNumber"
                              label="UHID Number"
                              tabIndex={-1}
                              value={formData.registrationNumber}
                              onChange={handleInputChange}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <Search className="h-5 w-5" />
                            </button>
                          </div>
                          <MemoizedInput
                            id="ipdNumber"
                            tabIndex={-1}
                            label="IPD Number"
                            value={formData.admission.ipdNumber}
                            onChange={(e) =>
                              handleInputChange({
                                target: {
                                  id: "admission.ipdNumber",
                                  value: e.target.value,
                                },
                              })
                            }
                            error={errors.ipdNumber}
                          />
                        </div>

                        <div className="flex items-end gap-4">
                          <div className="w-30 relative">
                            <MemoizedInput
                              id="age"
                              label="Age"
                              type="number"
                              value={formData.age}
                              onChange={handleAgeChange}
                              error={errors.age}
                            />
                          </div>
                          <div className="flex-grow relative">
                            <MemoizedInput
                              id="dateOfBirth"
                              tabIndex={-1}
                              label="Date of Birth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={handleDobChange}
                            />
                          </div>
                        </div>
                        <div>
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
                      </>
                    )}
                    <div className="relative grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Input
                          type="date"
                          id="admission.bookingDate"
                          value={formData.admission.bookingDate}
                          onChange={handleInputChange}
                          tabIndex={-1}
                          className={`peer pl-2 pt-2 pb-2 block w-full border rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                            errors["admission.bookingDate"]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <Label
                          htmlFor="admission.bookingDate"
                          className={`absolute text-xs transform -translate-y-3 top-1 z-10 origin-[0] left-2 px-1 bg-white ${
                            errors["admission.bookingDate"]
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          Booking Date
                          {errors["admission.bookingDate"] && (
                            <span className="text-red-500 ml-1">*Required</span>
                          )}
                        </Label>
                      </div>

                      <div className="relative flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="time"
                            id="admission.bookingTime"
                            value={formData.admission.bookingTime.split(" ")[0]}
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
                            className={`peer pl-2 pt-2 pb-2 block w-full border rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              errors["admission.bookingTime"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          <Label
                            htmlFor="admission.bookingTime"
                            className={`absolute text-xs transform -translate-y-3 top-1 z-10 origin-[0] left-2 px-1 bg-white ${
                              errors["admission.bookingTime"]
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            Booking Time
                            {errors["admission.bookingTime"] && (
                              <span className="text-red-500 ml-1">
                                *Required
                              </span>
                            )}
                          </Label>
                        </div>
                        <Select
                          value={
                            formData.admission.bookingTime.split(" ")[1] || "AM"
                          }
                          onValueChange={(value) => {
                            const timeOnly =
                              formData.admission.bookingTime.split(" ")[0];
                            const newTime = `${timeOnly} ${value}`;
                            handleInputChange({
                              target: {
                                id: "admission.bookingTime",
                                value: newTime,
                              },
                            });
                          }}
                        >
                          <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="AM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_2fr] gap-2">
                      <Select
                        id="admisison.relation"
                        value={formData.admission.relation}
                        onValueChange={(value) =>
                          handleInputChange({
                            target: { id: "admission.relation", value },
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
                        id="admission.guardianName"
                        value={formData.admission.guardianName}
                        onChange={handleInputChange}
                        label={`${
                          formData.admission.relation
                            ? formData.admission.relation + "'s Name"
                            : "Guardian's Name"
                        }`}
                      />
                    </div>

                    <div>
                      <MemoizedInput
                        id="contactNumber"
                        label="Phone"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        error={errors.contactNumber}
                      />
                    </div>

                    <div className={`space-y-2 `}>
                      <Textarea
                        id="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="min-h-9 h-9 no-scrollbar"
                      />
                    </div>
                    <div className={`grid grid-cols-2 gap-2`}>
                      <Select
                        id="admission.assignedRoom"
                        onValueChange={(value) => {
                          handleInputChange({
                            target: { id: "admission.assignedRoom", value },
                          });
                          // Auto-select bed if only one is available
                          const selectedRoom = rooms.find(
                            (room) => room._id === value
                          );
                          const availableBeds =
                            selectedRoom?.beds.filter(
                              (bed) => bed.status !== "Occupied"
                            ) || [];
                          if (availableBeds.length === 1) {
                            setFormData((prev) => ({
                              ...prev,
                              admission: {
                                ...prev.admission,
                                assignedBed: availableBeds[0]?._id,
                              },
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              admission: {
                                ...prev.admission,
                                assignedBed: "",
                              },
                            }));
                          }
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors["admission.assignedRoom"]
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select Room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms
                            .filter((room) => room.status !== "Occupied")
                            .map((room) => (
                              <SelectItem key={room._id} value={room._id}>
                                {room.roomNumber} - {room.type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select
                        id="admission.assignedBed"
                        onValueChange={(value) =>
                          handleInputChange({
                            target: { id: "admission.assignedBed", value },
                          })
                        }
                        disabled={!formData.admission.assignedRoom}
                      >
                        <SelectTrigger
                          className={
                            errors["admission.assignedBed"]
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue
                            placeholder={
                              formData.admission.assignedBed &&
                              formData.admission.assignedRoom
                                ? rooms
                                    .find(
                                      (room) =>
                                        room._id ===
                                        formData.admission.assignedRoom
                                    )
                                    ?.beds.find(
                                      (bed) =>
                                        bed._id ===
                                        formData.admission.assignedBed
                                    )?.bedNumber || "Bed"
                                : "Bed"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.admission.assignedRoom &&
                            rooms
                              .find(
                                (room) =>
                                  room._id === formData.admission.assignedRoom
                              )
                              ?.beds.filter((bed) => bed.status !== "Occupied")
                              .map((bed) => (
                                <SelectItem key={bed._id} value={bed._id}>
                                  {bed.bedNumber}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      {errors.admission?.assignedBed && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.admission.assignedBed}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isMobile ? (
                      <>
                        <div className={`grid grid-cols-2 gap-2`}>
                          <Select
                            id="admission.department"
                            onValueChange={(value) =>
                              handleInputChange({
                                target: { id: "admission.department", value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  departments.length === 1
                                    ? departments[0].name
                                    : "Department"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept._id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            id="admission.assignedDoctor"
                            onValueChange={(value) =>
                              handleInputChange({
                                target: {
                                  id: "admission.assignedDoctor",
                                  value,
                                },
                              })
                            }
                          >
                            <SelectTrigger
                              className={
                                errors["admission.assignedDoctor"]
                                  ? "border-red-500"
                                  : ""
                              }
                            >
                              <SelectValue
                                placeholder={
                                  doctors.length === 1
                                    ? `${doctors[0].name}`
                                    : "Select Doctor"
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
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <FloatingLabelSelect
                          id="admission.department"
                          onValueChange={(value) =>
                            handleInputChange({
                              target: { id: "admission.department", value },
                            })
                          }
                          value={formData.admission.department}
                          label="Department"
                          error={errors["admission.department"]}
                        >
                        
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                        </FloatingLabelSelect>

                        <FloatingLabelSelect
                          id="admission.assignedDoctor"
                          onValueChange={(value) =>
                            handleInputChange({
                              target: { id: "admission.assignedDoctor", value },
                            })
                          }
                          value={formData.admission.assignedDoctor}
                          label="Doctor"
                          error={errors["admission.assignedDoctor"]}
                        >
                          
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor._id} value={doctor._id}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                        </FloatingLabelSelect>
                        
                      
                          
                      </div>
                    )}
                    <div className="flex flex-col">
                      <MemoizedInput
                        id="admission.referredBy"
                        label="Referred By"
                        value={formData.admission.referredBy}
                        onChange={(e) =>
                          handleInputChange({
                            target: { id: "admission.referredBy", value: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {/* <div className="flex items-center gap-2 text-xs">
                          <span>Total Amount:</span>
                          <Input
                            value={formData.paymentInfo.totalAmount.toLocaleString(
                              "en-IN"
                            )}
                            className="font-semibold w-28 inline-block"
                            onChange={(e) => {
                              const value = Number(
                                e.target.value.replace(/,/g, "")
                              );
                              if (!isNaN(value)) {
                                const servicesTotal = services
                                  .filter((service) =>
                                    formData.paymentInfo.services.includes(
                                      service._id
                                    )
                                  )
                                  .reduce(
                                    (sum, service) => sum + (service.rate || 0),
                                    0
                                  );

                                const totalWithRoom =
                                  servicesTotal + roomCharge;

                                setFormData((prev) => ({
                                  ...prev,
                                  paymentInfo: {
                                    ...prev.paymentInfo,
                                    totalAmount: value,
                                    additionalDiscount: Math.max(
                                      0,
                                      totalWithRoom - value
                                    ),
                                  },
                                }));
                              }
                            }}
                          />
                        </div> */}

                        <MemoizedInput
                          id="paymentInfo.totalAmount"
                          label="Amount"
                          tabIndex={-1}
                          value={formData.paymentInfo.totalAmount.toLocaleString(
                            "en-IN"
                          )}
                          onChange={(e) => {
                            const value = Number(
                              e.target.value.replace(/,/g, "")
                            );

                            if (!isNaN(value)) {
                              const servicesTotal = services
                                .filter((service) =>
                                  formData.paymentInfo.services.includes(
                                    service._id
                                  )
                                )
                                .reduce(
                                  (sum, service) => sum + (service.rate || 0),
                                  0
                                );

                              const totalWithRoom = servicesTotal + roomCharge;

                              // If new total is higher than current total, adjust operation service amount in form
                              if (value > totalWithRoom) {
                                const difference = value - totalWithRoom;
                                // Find the first operation service
                                const operationService = services.find(
                                  (service) =>
                                    service.category === "Surgery" &&
                                    formData.paymentInfo.services.includes(
                                      service._id
                                    )
                                );

                                if (operationService) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentInfo: {
                                      ...prev.paymentInfo,
                                      totalAmount: value,
                                      additionalDiscount: 0,
                                      services: prev.paymentInfo.services.map(
                                        (serviceId) => {
                                          if (
                                            serviceId === operationService._id
                                          ) {
                                            return {
                                              ...operationService,
                                              rate:
                                                (operationService.rate || 0) +
                                                difference,
                                            };
                                          }
                                          return serviceId;
                                        }
                                      ),
                                    },
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentInfo: {
                                      ...prev.paymentInfo,
                                      totalAmount: value,
                                      additionalDiscount: 0,
                                    },
                                  }));
                                }
                              } else {
                                // Handle discount case when total is reduced
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentInfo: {
                                    ...prev.paymentInfo,
                                    totalAmount: value,
                                    additionalDiscount: Math.max(
                                      0,
                                      totalWithRoom - value
                                    ),
                                  },
                                }));
                              }
                            }
                          }}
                        />
                        <MemoizedInput
                          id="paymentInfo.balanceDue"
                          label="Balance Due"
                          tabIndex={-1}
                          value={(
                            formData.paymentInfo.totalAmount -
                            (formData.paymentInfo.amountPaid || 0)
                          ).toLocaleString("en-IN")}
                          disabled={true}
                          className="bg-gray-50"
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
                      {formData.paymentInfo.additionalDiscount > 0 && (
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500 ">
                            Services Total: ₹
                            {(
                              services
                                .filter((service) =>
                                  formData.paymentInfo.services.includes(
                                    service._id
                                  )
                                )
                                .reduce(
                                  (sum, service) => sum + (service.rate || 0),
                                  0
                                ) + roomCharge
                            ).toLocaleString("en-IN")}
                          </div>
                          {roomCharge > 0 && (
                            <div className="text-sm text-gray-500">
                              Room Charge: ₹{roomCharge.toLocaleString("en-IN")}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            Discount: ₹
                            {formData.paymentInfo.additionalDiscount.toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      )}
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
                                .join(",")
                            : "Payment Method"
                        }
                        selectedValues={formData.paymentInfo.paymentMethod.map(
                          (pm) => ({
                            name: pm.method,
                          })
                        )}
                        setSelectedValues={handlePaymentMethodChange}
                      />
                      {formData.paymentInfo.paymentMethod.length > 0 ? (
                        formData.paymentInfo.paymentMethod.map((pm) => (
                          <MemoizedInput
                            key={pm.method}
                            id={`paymentInfo.${pm.method}`}
                            label={`${pm.method} Paid`}
                            value={pm.amount.toLocaleString("en-IN")}
                            onChange={(e) => {
                              handleAmountPaidChange(pm.method, e.target.value);
                            }}
                            className="bg-gray-50"
                          />
                        ))
                      ) : (
                        <MemoizedInput
                          key="Ayush"
                          id={`hallelujah`}
                          label={`Amount Paid`}
                          disabled
                          className="bg-gray-50 "
                        />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vitals">
                <div className="space-y-4">
                  <div
                    className={`grid ${
                      isMobile ? "grid-cols-1" : "grid-cols-2"
                    } gap-4`}
                  >
                    <Textarea
                      id="admission.diagnosis"
                      placeholder="Diagnosis"
                      value={formData.admission.diagnosis}
                      onChange={(e) =>
                        handleInputChange({
                          target: {
                            id: "admission.diagnosis",
                            value: e.target.value,
                          },
                        })
                      }
                    />
                    {errors["admission.diagnosis"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["admission.diagnosis"]}
                      </p>
                    )}

                    <Textarea
                      id="admission.conditionOnAdmission"
                      placeholder="Condition on Admission"
                      value={formData.admission.conditionOnAdmission}
                      onChange={(e) =>
                        handleInputChange({
                          target: {
                            id: "admission.conditionOnAdmission",
                            value: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <h4 className="font-semibold text-sm mt-4">
                    Admission Vitals
                  </h4>
                  <div
                    className={`grid ${
                      isMobile ? "grid-cols-2" : "grid-cols-3"
                    } gap-4`}
                  >
                    <Input
                      id="admission.vitals.admission.weight"
                      placeholder="Weight"
                      value={formData.admission.vitals.admission.weight}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.height"
                      placeholder="Height"
                      value={formData.admission.vitals.admission.height}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.bloodPressure"
                      placeholder="Blood Pressure"
                      value={formData.admission.vitals.admission.bloodPressure}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.heartRate"
                      placeholder="Heart Rate"
                      value={formData.admission.vitals.admission.heartRate}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.temperature"
                      placeholder="Temperature"
                      value={formData.admission.vitals.admission.temperature}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.oxygenSaturation"
                      placeholder="Oxygen Saturation"
                      value={
                        formData.admission.vitals.admission.oxygenSaturation
                      }
                      onChange={handleInputChange}
                    />
                    <Input
                      id="admission.vitals.admission.respiratoryRate"
                      placeholder="Respiratory Rate"
                      value={
                        formData.admission.vitals.admission.respiratoryRate
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insurance">
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <MemoizedInput
                    id="admission.insuranceDetails.provider"
                    label="Insurance Provider"
                    value={formData.admission.insuranceDetails.provider}
                    onChange={handleInputChange}
                  />
                  <MemoizedInput
                    id="admission.insuranceDetails.policyNumber"
                    label="Policy Number"
                    value={formData.admission.insuranceDetails.policyNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className={`mt-4 ${isMobile ? "mb-8" : ""}`}>
              <div
                className={`w-full flex ${
                  isMobile ? "flex-col-reverse" : "flex-row"
                } justify-between sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className={`${isMobile ? "w-full mt-2" : ""}`}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={registerPatientStatus === "loading"}
                  className={`${isMobile ? "w-full" : ""}`}
                >
                  {registerPatientStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {patientData ? "Readmitting..." : "Registering..."}
                    </>
                  ) : patientData ? (
                    "Readmit Patient"
                  ) : (
                    "Register Patient"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
          <SelectServicesDialog
            isOpen={isSelectServicesDialogOpen}
            onClose={() => setIsSelectServicesDialogOpen(false)}
            services={getDisplayServices()}
            selectedServices={[
              ...formData.paymentInfo.services,
              formData.admission.assignedRoom ? "room-charge" : "",
            ].filter(Boolean)} // Filter out empty strings
            onServicesChange={handleServicesChange}
          />
        </DialogContent>
      </Dialog>
      {showBillModal && hospitalInfo && (
        <BillModal
          isOpen={showBillModal}
          setShowBillModal={setShowBillModal}
          billData={billData}
          completedBill={completedBill}
          hospitalInfo={hospitalInfo}
        />
      )}
    </>
  );
}
