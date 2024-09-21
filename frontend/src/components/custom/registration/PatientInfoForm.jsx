import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "../../ui/select";

export default function PatientInfoForm({ formData, handleInputChange, handleSelectChange, errors }) {
  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value;
    const age = dateOfBirth
      ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
      : "";
    handleInputChange({ target: { id: "dateOfBirth", value: dateOfBirth } });
    handleInputChange({ target: { id: "age", value: age.toString() } });
  };

  const handleAgeChange = (e) => {
    const age = e.target.value;
    handleInputChange({ target: { id: "age", value: age } });
    handleInputChange({ target: { id: "dateOfBirth", value: "" } });
  };

  return (
    <>
      <Input
        id="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleInputChange}
      />
      {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}

      <Input
        id="registrationNumber"
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={handleInputChange}
      />
      {errors.registrationNumber && <span className="text-red-500 text-sm">{errors.registrationNumber}</span>}
     
      <div className="flex flex-col gap-2  -mt-6">
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleDobChange}
            />
          </div>
          <div className="w-20">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={handleAgeChange}
            />
          </div>
        </div>
        {(errors.dateOfBirth || errors.age) && <span className="text-red-500 text-sm">{errors.dateOfBirth || errors.age}</span>}
      </div>

      <Select
        id="gender"
        onValueChange={(value) => handleSelectChange("gender", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          {["Male", "Female", "Other"].map((gender) => (
            <SelectItem key={gender} value={gender}>{gender}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.gender && <span className="text-red-500 text-sm">{errors.gender}</span>}

      <Input
        id="contactNumber"
        type="tel"
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChange={handleInputChange}
      />
      {errors.contactNumber && <span className="text-red-500 text-sm">{errors.contactNumber}</span>}

      <Input
        id="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
      {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}

      <Select
        id="bloodType"
        onValueChange={(value) => handleSelectChange("bloodType", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Blood Type" />
        </SelectTrigger>
        <SelectContent>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.bloodType && <span className="text-red-500 text-sm">{errors.bloodType}</span>}
    </>
  );
}