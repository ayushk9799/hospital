import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../ui/button";
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
} from "../../../redux/slices/patientSlice";
import { fetchRooms } from "../../../redux/slices/roomSlice";
import {
  initialFormData,
  validateForm,
  formatSubmissionData,
} from "./ipdRegHelpers";
import { useToast } from "../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import MemoizedInput from "./MemoizedInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { fetchBills } from "../../../redux/slices/BillingSlice";

export default function IPDRegDialog({ open, onOpenChange, patientData }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector(
    (state) => state.patients.registerPatientStatus
  );
  const departments = useSelector((state) => state.departments.departments);
  const rooms = useSelector((state) => state.rooms.rooms);
  const doctors = useSelector((state) => state.staff.doctors);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
 console.log(patientData)
  // Function to reset form data
  const resetFormData = useCallback(() => {
    if (patientData) {
      setFormData({
        ...initialFormData,
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        contactNumber: patientData.contactNumber || '',
        email: patientData.email || '',
        address: patientData.address || '',
        registrationNumber: patientData.registrationNumber || '',
        dateOfBirth: patientData.dateOfBirth || '',
        bloodType: patientData.bloodType || '',
        // Add any other fields you want to pre-fill
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [patientData]);

  useEffect(() => {
    if (open) {
      dispatch(fetchRooms());
      resetFormData();
    }
  }, [open, dispatch, resetFormData]);

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
    if (validateForm(formData, setErrors)) {
      const submissionData = formatSubmissionData(formData);
      console.log(submissionData);
      if (patientData) {
        // This is a readmission
        dispatch(readmitPatient({ patientId: patientData._id, admission: submissionData }))
          .unwrap()
          .then(() => {
            toast({
              title: "Patient admitted successfully",
              description: "The patient has been admitted.",
              variant: "success",
            });
            dispatch(fetchPatients());
            dispatch(fetchRooms());
            dispatch(fetchBills());
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
          .then(() => {
            toast({
              title: "Patient registered successfully",
              description: "The new patient has been added.",
              variant: "success",
            });
            dispatch(fetchPatients());
            dispatch(fetchRooms());
            dispatch(fetchBills());
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
          .finally(() => {
            onOpenChange(false);
          });
      }
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    resetFormData();
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[1000px] h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patientData ? "Admit IPD Patient" : "Register New IPD Patient"}
          </DialogTitle>
          <DialogDescription>
            {patientData
              ? "Fill details for patient Admission"
              : "Fill basic details of patient for new IPD registration"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 h-[calc(60vh-115px)]"
        >
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info">
              <div className="grid grid-cols-3 mt-4 gap-4">
                <div className="space-y-4">
                  <MemoizedInput
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                  />
                  <MemoizedInput
                    id="registrationNumber"
                    label="Registration Number"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                  />
                  <div className="flex items-end gap-4">
                    <div className="flex-grow relative">
                      <MemoizedInput
                        id="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleDobChange}
                      />
                    </div>
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
                  </div>
                </div>

                <div className="space-y-4">
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
                  <div>
                    <MemoizedInput
                      id="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      id="gender"
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange({ target: { id: "gender", value } })
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                    <Select
                      id="bloodType"
                      onValueChange={(value) =>
                        handleInputChange({
                          target: { id: "bloodType", value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Select
                    id="admission.department"
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { id: "admission.department", value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["admission.department"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["admission.department"]}
                    </p>
                  )}

                  <Select
                    id="admission.assignedDoctor"
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { id: "admission.assignedDoctor", value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assigned Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["admission.assignedDoctor"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["admission.assignedDoctor"]}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      id="admission.assignedRoom"
                      onValueChange={(value) => {
                        handleInputChange({
                          target: { id: "admission.assignedRoom", value },
                        });
                        setFormData((prev) => ({
                          ...prev,
                          admission: {
                            ...prev.admission,
                            assignedBed: "",
                          },
                        }));
                      }}
                    >
                      <SelectTrigger
                        className={
                          errors["admission.assignedRoom"]
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Room" />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Bed" />
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
                  </div>
                </div>
                <div>
                  <Textarea
                    id="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <h4 className="font-semibold text-sm mt-4">Admission Vitals</h4>
                <div className="grid grid-cols-3 gap-4">
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
                    value={formData.admission.vitals.admission.oxygenSaturation}
                    onChange={handleInputChange}
                  />
                  <Input
                    id="admission.vitals.admission.respiratoryRate"
                    placeholder="Respiratory Rate"
                    value={formData.admission.vitals.admission.respiratoryRate}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="submit"
              disabled={registerPatientStatus === "loading"}
            >
              {registerPatientStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {patientData ? "Readmitting..." : "Registering..."}
                </>
              ) : (
                patientData ? "Readmit Patient" : "Register Patient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
