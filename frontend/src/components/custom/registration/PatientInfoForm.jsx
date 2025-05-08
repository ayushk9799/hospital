import React, { useCallback, useState } from "react";
import MemoizedInput from "./MemoizedInput";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../../ui/select";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { searchPatients } from "../../../redux/slices/patientSlice";

// Updated FloatingLabelSelect component
export const FloatingLabelSelect = ({
  id,
  label,
  value,
  onValueChange,
  error,
  children,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <Select
        id={id}
        value={value}
        onValueChange={(newValue) => {
          onValueChange(newValue);
          setIsFocused(false);
        }}
        onOpenChange={(open) => setIsFocused(open)}
      >
        <SelectTrigger
          className={`peer px-3 py-2 w-full border rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white ${
            error && !value && !isFocused ? "border-red-500" : "border-gray-300"
          }`}
        ><label
        htmlFor={id}
        className={`absolute text-xs duration-300 transform -translate-y-1/2 left-3
          peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2
          peer-focus:text-xs peer-focus:top-0 peer-focus:-translate-y-1/2
          ${value || isFocused ? "top-0 -translate-y-1/2 text-xs" : "top-1/2"}
          ${error && !value && !isFocused ? "text-red-500" : "text-gray-500"}
          bg-white px-1`}
      >
        {label}
        {error && !value && !isFocused && (
          <span className="text-red-500 ml-1">*Required</span>
        )}
      </label>
          <SelectValue placeholder=" " />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
        
      </Select>
      
    </div>
  );
};

export default function PatientInfoForm({
  formData,
  handleInputChange,
  handleSelectChange,
  errors,
  consultationFeeSettings,
  setSearchedPatient,
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const dispatch = useDispatch();

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
  const checkFollowUpDate = (patient, formData, consultationFeeSettings) => {
    try{
    const lastVisitDate = new Date(new Date(patient.lastVisit).toDateString())
    const bookingDate = new Date(new Date(formData.visit.bookingDate).toDateString())
    const followUpLimitDate = new Date(lastVisitDate);
    followUpLimitDate.setDate(followUpLimitDate.getDate() + (consultationFeeSettings.masterFollowup===-1?14:consultationFeeSettings.masterFollowup));
    
   
    return bookingDate >= lastVisitDate && bookingDate <= followUpLimitDate;
    }catch(error){
      console.error("Error checking follow-up date:", error);
      return false;
    }
  };
  
  const handleSearch = async () => {
    if (!formData.registrationNumber) return;
    
    try {
      const result = await dispatch(searchPatients({searchQuery:formData.registrationNumber.trim()})).unwrap();
      if (result.results?.patients && result.results?.patients?.length > 0) {
        const patient = result.results?.patients?.[0];
        setSearchedPatient({
          ...patient,
          isFromSearch: true
        });
       handleSelectChange("visit.consultationType", checkFollowUpDate(patient, formData, consultationFeeSettings)?"follow-up":"new");
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <>
      <MemoizedInput
        id="name"
        label="Full Name"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
      />

      {isMobile ? (
        <div className="flex gap-2">
          <div className="w-1/2">
            <MemoizedInput
              id="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleAgeChange}
              error={errors.age}
            />
          </div>
          <div className="w-1/2">
            <MemoizedInput
              type="date"
              id="visit.bookingDate"
              label="Booking Date"
              value={formData.visit.bookingDate}
              onChange={handleInputChange}
              error={errors["visit.bookingDate"]}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-4">
          <div className="w-full sm:w-30 relative">
            <MemoizedInput
              id="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleAgeChange}
              error={errors.age}
            />
          </div>
          <div className="flex-grow relative hidden sm:block">
            <MemoizedInput
              id="dateOfBirth"
              label="Date of Birth"
              type="date"
              tabIndex={-1}
              value={formData.dateOfBirth}
              onChange={handleDobChange}
            />
          </div>
        </div>
      )}

      <div className="relative">
        <MemoizedInput
          id="registrationNumber"
          label="UHID Number"
          tabIndex={-1}
          value={formData.registrationNumber}
          onChange={handleInputChange}
          error={errors.registrationNumber}
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

      <FloatingLabelSelect
        id="gender"
        label="Gender"
        value={formData.gender}
        onValueChange={(value) => handleSelectChange("gender", value)}
        error={errors.gender}
      >
        {["Male", "Female", "Other"].map((gender) => (
          <SelectItem key={gender} value={gender}>
            {gender}
          </SelectItem>
        ))}
      </FloatingLabelSelect>

      {/* <MemoizedInput
        id="contactNumber"
        label="Contact Number"
        type="tel"
        value={formData.contactNumber}
        onChange={handleInputChange}
        error={errors.contactNumber}
      /> */}
    </>
  );
}
