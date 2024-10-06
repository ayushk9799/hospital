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
import {
  fetchPatients,
  registerPatient,
} from "../../../redux/slices/patientSlice";
import { Textarea } from "../../ui/textarea";
import PatientInfoForm from "./PatientInfoForm";
import VisitDetailsForm from "./VisitDetailsForm";
import VitalsForm from "./VitalsForm";
import InsuranceForm from "./InsuranceForm";
import { Backend_URL } from "../../../assets/Data";
import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Label } from "../../ui/label";

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
  },
};

const initialErrors = {};

export default function OPDRegDialog({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector(
    (state) => state.patients.registerPatientStatus
  );

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [isOldPatient, setIsOldPatient] = useState(false);
  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.dateOfBirth && !formData.age)
      newErrors.age = "Date of birth or age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isOldPatient) {
        if (
          searchType === "name" &&
          (!searchQuery.name || !searchQuery.bookingDate)
        ) {
          toast({
            title: "Invalid Search",
            description:
              "Please provide both name and booking date for name-based search.",
            variant: "destructive",
          });
          return;
        }
        if (!searchQuery.bookingDate) {
          toast({
            title: "Invalid Search",
            description: "Booking date is required for all search types.",
            variant: "destructive",
          });
          return;
        }

        try {
          const response = await fetch(
            `${Backend_URL}/api/patients/complexsearch`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                searchQuery: {
                  ...searchQuery,
                  bookingDate: searchQuery.bookingDate,
                },
                searchType,
                searchWhere: formData.patientType.toLowerCase(),
              }),
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch patient data");
          }
          const data = await response.json();
          if (data.length > 0) {
            setFormData({
              ...initialFormData,
              ...data[0],
              name: data[0].patientName,
              age: data[0].patient.age,
              gender: data[0].patient.gender,
              bloodType: data[0].patient.bloodType,
              address: data[0].patient.address,
            });
            toast({
              title: "Patient Found",
              description: "Patient information has been loaded.",
              variant: "default",
            });
            setIsOldPatient(false);
          } else {
            toast({
              title: "Patient Not Found",
              description: "No matching patient records found.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error searching for patient:", error);
          toast({
            title: "Search Error",
            description: "An error occurred while searching for the patient.",
            variant: "destructive",
          });
        }
      } else {
        // Existing new patient registration logic
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
            .then(() => {
              toast({
                title: "Patient registered successfully",
                description: "The new patient has been added.",
                variant: "success",
              });
              dispatch(fetchPatients());
              onOpenChange(false);
            })
            .catch((error) => {
              toast({
                title: "Failed to register patient",
                description:
                  error.message ||
                  "There was an error registering the patient. Please try again.",
                variant: "destructive",
              });
            });
        }
      }
    },
    [
      isOldPatient,
      searchType,
      searchQuery,
      formData,
      validateForm,
      dispatch,
      toast,
      onOpenChange,
    ]
  );

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsOldPatient(false);
    onOpenChange(false);
    setFormData(initialFormData);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors(initialErrors);
      setIsOldPatient(false);
      setSearchType("");
      setSearchQuery({});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className={
          isOldPatient
            ? "max-w-[800px] max-h-[80vh] overflow-y-auto"
            : "max-w-[1200px] max-h-[80vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <DialogTitle>Patient Registration</DialogTitle>
          <DialogDescription>
            {isOldPatient
              ? "Search for existing patient"
              : "Register new patient"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="patient-type"
                checked={isOldPatient}
                onCheckedChange={setIsOldPatient}
              />
              <span>{isOldPatient ? "Existing Patient" : "New Patient"}</span>
            </div>

            {isOldPatient && (
              <div className="space-y-4 mb-4 max-w-md">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) => {
                        setSearchType(value);
                        setSearchQuery({ bookingDate: "" });
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">
                          Registration No.
                        </SelectItem>
                        <SelectItem value="name">
                          Name And Booking Date
                        </SelectItem>
                        <SelectItem value="mobile">Mobile No.</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      name={searchType}
                      placeholder={`Enter ${searchType || "patient"} details`}
                      value={searchQuery[searchType] || ""}
                      onChange={handleSearchInputChange}
                      className="flex-grow"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-[140px] relative">
                      <Input
                        id="bookingDate"
                        name="bookingDate"
                        type="date"
                        value={searchQuery.bookingDate || ""}
                        onChange={handleSearchInputChange}
                        className="peer pl-2 pt-2 pb-2 block w-full border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        placeholder=" "
                      />
                      <Label
                        htmlFor="bookingDate"
                        className="absolute text-xs text-gray-500 duration-300 transform -translate-y-1/2 scale-75 top-1/2 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2"
                      >
                        Visit Date
                      </Label>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="flex-grow"
                      disabled={
                        !searchQuery[searchType] || !searchQuery.bookingDate
                      }
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isOldPatient && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="grid grid-cols-3 col-span-3 gap-4">
                  <PatientInfoForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    errors={errors}
                  />
                  <VisitDetailsForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    errors={errors}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <Textarea
                    id="visit.reasonForVisit"
                    placeholder="Reason for Visit"
                    value={formData.visit.reasonForVisit}
                    onChange={handleInputChange}
                    className="h-[80px]"
                  />
                  <Textarea
                    id="address"
                    placeholder="Address: 123 Main St, Anytown USA"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-[80px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <VitalsForm
                  formData={formData}
                  handleSelectChange={handleSelectChange}
                  errors={errors}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <InsuranceForm
                  formData={formData.visit}
                  handleSelectChange={handleSelectChange}
                  errors={errors}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registerPatientStatus === "loading"}
                >
                  {registerPatientStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
