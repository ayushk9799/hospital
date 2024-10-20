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

// Updated FloatingLabelSelect component
export const FloatingLabelSelect = ({ id, label, value, onValueChange, error, children }) => {
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
        >
          <SelectValue placeholder=" " />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      <label
        htmlFor={id}
        className={`absolute text-xs duration-300 transform -translate-y-1/2 left-3
          peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2
          peer-focus:text-xs peer-focus:top-0 peer-focus:-translate-y-1/2
          ${value || isFocused ? 'top-0 -translate-y-1/2 text-xs' : 'top-1/2'}
          ${error && !value && !isFocused ? "text-red-500" : "text-gray-500"}
          bg-white px-1`}
      >
        {label}
        {error && !value && !isFocused && <span className="text-red-500 ml-1">*Required</span>}
      </label>
    </div>
  );
};

export default function PatientInfoForm({
  formData,
  handleInputChange,
  handleSelectChange,
  errors,
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");

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

  return (
    <>
      <MemoizedInput
        id="name"
        label="Full Name"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
      />

      <div className={`${isMobile ? 'flex gap-2' : ''}`}>
        <div className={isMobile ? 'w-1/2' : 'w-full'}>
          <MemoizedInput
            id="registrationNumber"
            label="Registration Number"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            error={errors.registrationNumber}
          />
        </div>
        {isMobile && (
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
        )}
      </div>
    
      {isMobile ? (
        <>
          <div className="flex gap-2">
            <div className="w-1/2">
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
            </div>
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
          </div>
        </>
      ) : (
        <>
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
                value={formData.dateOfBirth}
                onChange={handleDobChange}
              />
            </div>
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
        </>
      )}

      <MemoizedInput
        id="contactNumber"
        label="Contact Number"
        type="tel"
        value={formData.contactNumber}
        onChange={handleInputChange}
        error={errors.contactNumber}
      />

      <div className="hidden sm:block">
        <MemoizedInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />
      </div>

      <div className="hidden sm:block">
        <FloatingLabelSelect
          id="bloodType"
          label="Blood Type"
          value={formData.bloodType}
          onValueChange={(value) => handleSelectChange("bloodType", value)}
          error={errors.bloodType}
        >
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </FloatingLabelSelect>
      </div>
    </>
  );
}
