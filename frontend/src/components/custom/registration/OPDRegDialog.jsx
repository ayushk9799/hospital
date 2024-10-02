import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients, registerPatient } from "../../../redux/slices/patientSlice";
import { Textarea } from "../../ui/textarea";
import PatientInfoForm from "./PatientInfoForm";
import VisitDetailsForm from "./VisitDetailsForm";
import VitalsForm from "./VitalsForm";
import InsuranceForm from "./InsuranceForm";
import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { Loader2 } from "lucide-react";

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
    bookingDate: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}).split('/').reverse().join('-'),
    timeSlot: {
      start:"",
      end:"",
    },
    department: "",
    doctor: "",
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
  },
 
};

export default function OPDRegDialog({ open, onOpenChange }) {
  console.log('opd');
  const dispatch = useDispatch();
  const { toast } = useToast();
  const registerPatientStatus = useSelector((state) => state.patients.registerPatientStatus);
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isOldPatient, setIsOldPatient] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [searchQuery, setSearchQuery] = useState({});

  const handleInputChange = (e) => {
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
  };

  const handleSelectChange = (id, value) =>
    handleInputChange({ target: { id, value } });

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

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOldPatient) {
      if (searchType === 'name' && (!searchQuery.name || !searchQuery.bookingDate)) {
        alert("Please provide both name and booking date for name-based search.");
        return;
      }
      console.log("Searching for patient with", searchType, searchQuery);
      // You would typically make an API call here to search for the patient
      // and then populate the form with the returned data
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
            bookingDate:formData.visit.bookingDate,
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
              variant: "default",
            });
            dispatch(fetchPatients());
          })
          .catch((error) => {
            toast({
              title: "Failed to register patient",
              description: error.message || "There was an error registering the patient. Please try again.",
              variant: "destructive",
            });
          }).finally(() => {
            onOpenChange(false);
          });
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDialogClose = () => {
    setIsOldPatient(false);
    onOpenChange(false);
    setFormData(initialFormData)
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className={isOldPatient?"max-w-[800px] max-h-[80vh] overflow-y-auto":"max-w-[1200px] max-h-[80vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>Patient Registration</DialogTitle>
          <DialogDescription>
            {isOldPatient ? "Search for existing patient" : "Register new patient"}
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
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-1/2">
                    <Select onValueChange={(value) => {
                      setSearchType(value);
                      setSearchQuery({});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">Registration Number</SelectItem>
                        <SelectItem value="name">Patient Name</SelectItem>
                        <SelectItem value="mobile">Mobile Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/2">
                    <Input
                      type="text"
                      name={searchType}
                      placeholder={`Enter ${searchType || 'search'} value`}
                      value={searchQuery[searchType] || ''}
                      onChange={handleSearchInputChange}
                    />
                  </div>
                </div>
                {searchType === 'name' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-1/2">
                      <Input
                        id="bookingDate"
                        name="bookingDate"
                        type="date"
                        value={searchQuery.bookingDate || ''}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                    <div className="w-1/2 self-end">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!searchQuery.name || !searchQuery.bookingDate}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                )}
                {searchType !== 'name' && (
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!searchQuery[searchType]}
                  >
                    Search
                  </Button>
                )}
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
                />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                <InsuranceForm
                  formData={formData.visit}
                  handleSelectChange={handleSelectChange}
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
                <Button type="submit" disabled={registerPatientStatus === "loading"}>
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