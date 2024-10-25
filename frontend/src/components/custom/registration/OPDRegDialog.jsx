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
import {fetchPatients, registerPatient} from "../../../redux/slices/patientSlice";
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
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Checkbox } from "../../ui/checkbox";
import { FloatingLabelSelect } from "./PatientInfoForm";
import { useMediaQuery } from "../../../hooks/use-media-query";
import MemoizedInput from "./MemoizedInput";
import { fetchServices } from "../../../redux/slices/serviceSlice";
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
    consultationFee: true,
    consultationAmount: "", // We'll update this when the component mounts
    paymentMethod: "",
  },
};

const initialErrors = {};

export default function OPDRegDialog({ open, onOpenChange, patientData }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector((state) => state.patients.registerPatientStatus);
  const {services, servicesStatus} = useSelector((state)=>state.services);
  const consultationService = services.find((service)=>service.name.toLowerCase().includes("consultation"))

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

      // Clear payment method when consultation fee is unchecked
      if (id === "visit.consultationFee" && value === false) {
        newState.visit.paymentMethod = "";
        newState.visit.consultationAmount = "";
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
    if (formData.visit.consultationFee && !formData.visit.paymentMethod)
      newErrors.paymentMethod = "Payment method is required when consultation fee is added";
    setErrors(newErrors);

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
              followUp: true,
              _id: data[0].patient._id,
              name: data[0].patientName,
              age: data[0].patient.age,
              gender: data[0].patient.gender,
              bloodType: data[0].patient.bloodType,
              registrationNumber: data[0].registrationNumber,
              contactNumber: data[0].contactNumber,
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
              dispatch(fetchBills());
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
          console.log(submissionData);
          
        }
      }
    },[ isOldPatient, searchType, searchQuery, formData, validateForm, dispatch, toast, onOpenChange]
  );

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsOldPatient(false);
    onOpenChange(false);
    setFormData(prevData => ({
      ...initialFormData,
      visit: {
        ...initialFormData.visit,
        consultationAmount: consultationService ? consultationService.rate.toString() : ""
      }
    }));
  }, [onOpenChange, consultationService]);

  const handleFollowUp = useCallback(async () => {
    if (validateForm()) {
      const { followUp, _id, ...submissionDataWithoutFollowUp } = formData;
      const submissionData = {
        ...submissionDataWithoutFollowUp,
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
      
      dispatch(revisitPatient({submissionData,_id}))
        .unwrap()
        .then(() => {
          toast({
            title: "Follow-up visit registered successfully",
            description: "The follow-up visit has been added.",
            variant: "success",
          });
          dispatch(fetchPatients());
          onOpenChange(false);
        })
        .catch((error) => {
          toast({
            title: "Failed to register follow-up visit",
            description:
              error.message ||
              "There was an error registering the follow-up visit. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [formData, validateForm, dispatch, toast, onOpenChange]);

  useEffect(() => {
    if (patientData) {
      setFormData({
        ...initialFormData,
        followUp: true,
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
    if (!open) {
      setFormData(initialFormData);
      setErrors(initialErrors);
      setIsOldPatient(false);
      setSearchType("");
      setSearchQuery({});
      setTimeout(()=>{
       document.body.style=""
      },500)
    }
  }, [open]);

  useEffect(()=>{
    if(servicesStatus==="idle"){
      dispatch(fetchServices())
    }
  },[dispatch, servicesStatus])

  // Modify this useEffect to run when 'open' changes
  useEffect(() => {
    if (open && consultationService) {
      setFormData(prevData => ({
        ...prevData,
        visit: {
          ...prevData.visit,
          consultationAmount: consultationService.rate.toString()
        }
      }));
    }
  }, [open, consultationService]);

  return (
    <Dialog open={open} onOpenChange={(ev)=>{handleDialogClose(ev)}} >
      <DialogContent
        className={
          isOldPatient
            ? "max-w-[800px] h-[30vh] overflow-y-hidden"
            : "md:max-w-[1000px] md:min-h-[70vh] md:max-h-[80vh] overflow-y-auto w-[95vw] p-4 md:p-6 gap-0 md:gap-4 rounded-lg"
        }
      >
        <DialogHeader >
          <DialogTitle className="mb-2 md:mb-0">Patient Registration</DialogTitle>
          <DialogDescription className="hidden md:block">
            {isOldPatient
              ? "Search for existing patient"
              : "Register new patient"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={`${isOldPatient ? "h-[30vh]" : "h-[calc(70vh-100px)]"} ${isMobile ? "mb-8" : ""}`}>
          <div className="space-y-4 mb-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="patient-type"
                checked={isOldPatient}
                onCheckedChange={setIsOldPatient}
              />
              <span>{isOldPatient ? "Follow Up" : "New Patient"}</span>
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
                        className="absolute text-xs text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 bg"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 col-span-1 sm:col-span-2 lg:col-span-3 gap-4">
                    <div className="flex-1 hidden sm:block">
                      <Textarea
                        id="visit.reasonForVisit"
                        placeholder="Reason for Visit"
                        value={formData.visit.reasonForVisit}
                        onChange={handleInputChange}
                        className="h-[80px]"
                      />
                    </div>
                    <div className="flex-1">
                      <Textarea
                        id="address"
                        placeholder="Address: 123 Main St, Anytown USA"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-[50px] md:h-[80px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="visit.consultationFee"
                          checked={formData.visit.consultationFee}
                          onCheckedChange={(checked) =>
                            handleInputChange({
                              target: { id: "visit.consultationFee", value: checked },
                            })
                          }
                        />
                        <label
                          htmlFor="visit.consultationFee"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add Consultation Fee
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingLabelSelect
                          id="visit.paymentMethod"
                          label="Payment Method"
                          value={formData.visit.paymentMethod}
                          onValueChange={(value) => handleSelectChange("visit.paymentMethod", value)}
                          error={errors.paymentMethod}
                          disabled={!formData.visit.consultationFee}
                        >
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Due">Due</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </FloatingLabelSelect>
                        <MemoizedInput
                          label="Amount (₹)"
                          id="visit.consultationAmount"
                          value={formData.visit.consultationAmount}
                          onChange={handleInputChange}
                          error={errors.consultationAmount}
                          disabled={!formData.visit.consultationFee}
                        />
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
          )}

          {!isOldPatient && (
            <DialogFooter className={`mt-4 ${isMobile ? "mb-8" : ""}`}>
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
                {formData.followUp && (
                  <Button
                    type="button"
                    onClick={handleFollowUp}
                    disabled={registerPatientStatus === "loading"}
                    className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
                  >
                    {registerPatientStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Follow-up"
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={registerPatientStatus === "loading" || formData.followUp}
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
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
