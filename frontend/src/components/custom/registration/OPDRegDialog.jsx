import React, { useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useSelector } from "react-redux";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Backend_URL } from "../../../assets/Data";

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
    department: "",
    doctor: "",
  },
  insuranceDetails: {
    provider: "",
    policyNumber: "",
    coverageType: "",
  },
};

export default function OPDRegDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const keys = id.split('.');
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

  const handleSelectChange = (id, value) => handleInputChange({ target: { id, value } });

  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value;
    const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : "";
    setFormData((prev) => ({ ...prev, dateOfBirth, age: age.toString() }));
  };

  const handleAgeChange = (e) => {
    const age = e.target.value;
    setFormData((prev) => ({ ...prev, age, dateOfBirth: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.dateOfBirth && !formData.age) newErrors.age = "Date of birth or age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        age: parseInt(formData.age, 10),
        visit: {
          ...formData.visit,
          vitals: Object.fromEntries(
            Object.entries(formData.visit.vitals).map(([key, value]) => [key, parseFloat(value)])
          ),
        },
      };
   console.log(submissionData)
      try {
        const response = await fetch(`${Backend_URL}/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        console.log("Patient registered successfully:", result);
        onOpenChange(false);
      } catch (error) {
        console.error("Error registering patient:", error);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogDescription>
            Fill basic details of patient for new registration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4">
            <div className="grid grid-cols-3 col-span-3 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  placeholder="Enter Registration ID"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleDobChange}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={handleAgeChange}
                    placeholder="Enter age"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  id="bloodType"
                  onValueChange={(value) => handleSelectChange("bloodType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit.department">Department</Label>
                <Select
                  id="visit.department"
                  onValueChange={(value) => handleSelectChange("visit.department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department)=>(
                      <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit.doctor">Assigned Doctor</Label>
                <Select
                  id="visit.doctor"
                  onValueChange={(value) => handleSelectChange("visit.doctor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor)=>(
                      <SelectItem key={doctor._id} value={doctor._id}>Dr. {doctor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="visit.reasonForVisit">Reason for Visit</Label>
                <Textarea
                  id="visit.reasonForVisit"
                  placeholder="Reason for Visit"
                  value={formData.visit.reasonForVisit}
                  onChange={handleInputChange}
                  className="h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main St, Anytown USA"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="h-[80px]"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <Label htmlFor="visit.vitals.bloodPressure">Blood Pressure</Label>
              <Input
                id="visit.vitals.bloodPressure"
                placeholder="120/80"
                value={formData.visit.vitals.bloodPressure}
                onChange={(e) => handleSelectChange("visit.vitals.bloodPressure", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit.vitals.temperature">Temperature</Label>
              <Input
                id="visit.vitals.temperature"
                type="number"
                placeholder="98.6"
                value={formData.visit.vitals.temperature}
                onChange={(e) => handleSelectChange("visit.vitals.temperature", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit.vitals.weight">Weight (kg)</Label>
              <Input
                id="visit.vitals.weight"
                type="number"
                placeholder="70"
                value={formData.visit.vitals.weight}
                onChange={(e) => handleSelectChange("visit.vitals.weight", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit.vitals.height">Height (cm)</Label>
              <Input
                id="visit.vitals.height"
                type="number"
                placeholder="170"
                value={formData.visit.vitals.height}
                onChange={(e) => handleSelectChange("visit.vitals.height", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit.vitals.oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="visit.vitals.oxygenSaturation"
                type="number"
                placeholder="98"
                value={formData.visit.vitals.oxygenSaturation}
                onChange={(e) => handleSelectChange("visit.vitals.oxygenSaturation", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit.vitals.respiratoryRate">Respiratory Rate</Label>
              <Input
                id="visit.vitals.respiratoryRate"
                type="number"
                placeholder="12"
                value={formData.visit.vitals.respiratoryRate}
                onChange={(e) => handleSelectChange("visit.vitals.respiratoryRate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="insuranceDetails.provider">Insurance Provider</Label>
              <Input
                id="insuranceDetails.provider"
                placeholder="Health Insurance Co."
                value={formData.insuranceDetails.provider}
                onChange={(e) => handleSelectChange("insuranceDetails.provider", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="insuranceDetails.policyNumber">Policy Number</Label>
              <Input
                id="insuranceDetails.policyNumber"
                placeholder="POL-123456"
                value={formData.insuranceDetails.policyNumber}
                onChange={(e) => handleSelectChange("insuranceDetails.policyNumber", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Register</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}