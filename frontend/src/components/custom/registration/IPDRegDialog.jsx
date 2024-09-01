import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
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
import CustomInput from "./CustomInput";

export default function IPDRegDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    age: "",
    gender: "",
    department: "",
    assignedDoctors: "",
    phone: "",
    emergencyContact: "",
    email: "",
    patientCondition: "",
    paymentMethod: "",
    heardFrom: "",
    address: "",
    roomType: "",
    roomNumber: "",
    estimatedStayDuration: "",
    bloodGroup: "",
  });
  const [reasonForAdmission, setReasonForAdmission] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (id, value) => {
    setFormData({ ...formData, [id]: value });
    if (id === "roomType") {
      fetchAvailableRooms(value);
      setFormData((prev) => ({ ...prev, roomNumber: "" }));
    }
  };

  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value;
    setFormData({ ...formData, dob: dateOfBirth });
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
      setFormData((prev) => ({ ...prev, age: calculatedAge.toString() }));
    } else {
      setFormData((prev) => ({ ...prev, age: "" }));
    }
  };

  const handleAgeChange = (e) => {
    const age = e.target.value;
    setFormData({ ...formData, age, dob: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.dob && !formData.age)
      newErrors.age = "Date of birth or age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood group is required";
    if (!formData.roomType) newErrors.roomType = "Room type is required";
    if (!formData.roomNumber) newErrors.roomNumber = "Room number is required";
    // Add more validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", { ...formData, reasonForAdmission });
      // Here you would typically send the data to your backend
      // After successful submission, you might want to close the dialog:
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      dob: "",
      age: "",
      gender: "",
      department: "",
      assignedDoctors: "",
      phone: "",
      emergencyContact: "",
      email: "",
      patientCondition: "",
      paymentMethod: "",
      heardFrom: "",
      address: "",
      roomType: "",
      roomNumber: "",
      estimatedStayDuration: "",
      bloodGroup: "",
    });
    setErrors({});
    setReasonForAdmission([]);
  };

  const fetchAvailableRooms = (roomType) => {
    // This is a mock function. In a real application, you would fetch this data from your backend.
    const mockRooms = {
      general: ["101", "102", "103"],
      "semi-private": ["201", "202"],
      private: ["301", "302"],
      icu: ["401", "402"],
    };
    setAvailableRooms(mockRooms[roomType] || []);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Register New IPD Patient</DialogTitle>
          <DialogDescription>
            Fill basic details of patient for new IPD registration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4">
            <div className="grid grid-cols-3 col-span-3 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm">
                    {errors.fullName}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dob}
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
                <Label htmlFor="department">Department</Label>
                <Select
                  id="department"
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <span className="text-red-500 text-sm">{errors.gender}</span>
                )}
              </div>

              <div>
                <Label htmlFor="patientCondition">Patient's Condition</Label>
                <Select
                  id="patientCondition"
                  onValueChange={(value) =>
                    handleSelectChange("patientCondition", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Patient Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedDoctors">Assigned Doctor(s)</Label>
                <Select
                  id="assignedDoctors"
                  onValueChange={(value) =>
                    handleSelectChange("assignedDoctors", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr1">Dr. Jane Smith</SelectItem>
                    <SelectItem value="dr2">Dr. John Doe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm">{errors.phone}</span>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Jane Doe, (987) 654-3210"
                  value={formData.emergencyContact}
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
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  id="bloodGroup"
                  onValueChange={(value) =>
                    handleSelectChange("bloodGroup", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Group" />
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
                {errors.bloodGroup && (
                  <span className="text-red-500 text-sm">
                    {errors.bloodGroup}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select
                  id="roomType"
                  onValueChange={(value) =>
                    handleSelectChange("roomType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Ward</SelectItem>
                    <SelectItem value="semi-private">Semi-Private</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>
                {errors.roomType && (
                  <span className="text-red-500 text-sm">
                    {errors.roomType}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Select
                  id="roomNumber"
                  onValueChange={(value) =>
                    handleSelectChange("roomNumber", value)
                  }
                  disabled={!formData.roomType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room Number" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.roomNumber}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  id="paymentMethod"
                  onValueChange={(value) =>
                    handleSelectChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="heardFrom">How did you hear about us?</Label>
                <Select
                  id="heardFrom"
                  onValueChange={(value) =>
                    handleSelectChange("heardFrom", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internet">Internet Search</SelectItem>
                    <SelectItem value="referral">Doctor Referral</SelectItem>
                    <SelectItem value="friend">Friend or Family</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedStayDuration">
                  Estimated Stay Duration (days)
                </Label>
                <Input
                  id="estimatedStayDuration"
                  type="number"
                  placeholder="Enter number of days"
                  value={formData.estimatedStayDuration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="reasonForAdmission">Reason for Visit</Label>
                <CustomInput
                  setReasons={setReasonForAdmission}
                  reasons={reasonForAdmission}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main St, Anytown USA"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
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
