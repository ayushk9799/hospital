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
import { useSelector, useDispatch } from "react-redux";
import { Input } from "../../ui/input";
import { Backend_URL } from "../../../assets/Data";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { fetchPatients } from '../../../redux/slices/patientSlice';
import { Label } from "../../ui/label";
import { initialFormData, validateForm, formatSubmissionData } from "./ipdRegHelpers";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function IPDRegDialog({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const { departments, rooms, doctors } = useSelector(state => ({
    departments: state.departments.departments,
    rooms: state.rooms.rooms,
    doctors: state.staff.doctors,
  }));

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [startTime, setStartTime] = useState({ hour: '', minute: '', amPm: 'AM' });
  const [endTime, setEndTime] = useState({ hour: '', minute: '', amPm: 'AM' });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => {
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

  const handleTimeChange = (field, type, value) => {
    const timeState = field === 'start' ? startTime : endTime;
    const setTimeState = field === 'start' ? setStartTime : setEndTime;
    setTimeState({ ...timeState, [type]: value });
    const newTime = `${timeState.hour}:${timeState.minute} ${timeState.amPm}`;
    handleInputChange({ target: { id: `admission.timeSlot.${field}`, value: newTime } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData, setErrors)) {
      const submissionData = formatSubmissionData(formData);
      console.log(submissionData);
      try {
        const response = await fetch(`${Backend_URL}/api/patients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to register patient");
        const result = await response.json();
        console.log("Patient registered successfully:", result);
        onOpenChange(false);
        dispatch(fetchPatients());
      } catch (error) {
        console.error("Error registering patient:", error);
      }
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setErrors({});
    setFormData(initialFormData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Register New IPD Patient</DialogTitle>
          <DialogDescription>
            Fill basic details of patient for new IPD registration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Personal Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Personal Information</h3>
              <div>
                <Input
                  id="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="registrationNumber"
                  placeholder="Registration Number"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleInputChange}
                />
                <Select
                  id="gender"
                  onValueChange={(value) => handleInputChange({ target: { id: 'gender', value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  id="bloodType"
                  onValueChange={(value) => handleInputChange({ target: { id: 'bloodType', value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && <p className="text-red-500 text-xs mt-1">{errors.bloodType}</p>}
              </div>
              {/* Move booking date and time slot here */}
              <div className="flex items-center space-x-2">
                <label htmlFor="admission.bookingDate" className="text-sm font-medium w-24">Booking Date:</label>
                <Input
                  id="admission.bookingDate"
                  type="date"
                  placeholder="Booking Date"
                  value={formData.admission.bookingDate}
                  onChange={handleInputChange}
                  className="flex-grow"
                />
              </div>
              {errors['admission.bookingDate'] && 
                <p className="text-red-500 text-xs mt-1">{errors['admission.bookingDate']}</p>}

              <div className="grid grid-cols-4 items-center mb-2">
                <Label>Start Time:</Label>
                <div className="flex space-x-2 col-span-3">
                  <Select value={startTime.hour} onValueChange={(value) => handleTimeChange('start', 'hour', value)}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startTime.minute} onValueChange={(value) => handleTimeChange('start', 'minute', value)}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startTime.amPm} onValueChange={(value) => handleTimeChange('start', 'amPm', value)}>
                    <SelectTrigger className="w-[60px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {errors['admission.timeSlot.start'] && 
                <p className="text-red-500 text-xs mt-1">{errors['admission.timeSlot.start']}</p>}

              <div className="grid grid-cols-4 items-center gap-2 mb-2">
                <Label>End Time:</Label>
                <div className="flex space-x-2 col-span-3">
                  <Select value={endTime.hour} onValueChange={(value) => handleTimeChange('end', 'hour', value)}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={endTime.minute} onValueChange={(value) => handleTimeChange('end', 'minute', value)}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={endTime.amPm} onValueChange={(value) => handleTimeChange('end', 'amPm', value)}>
                    <SelectTrigger className="w-[60px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {errors['admission.timeSlot.end'] && 
                <p className="text-red-500 text-xs mt-1">{errors['admission.timeSlot.end']}</p>}
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Contact Information</h3>
              <div>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Phone"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <Textarea
                id="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="h-[80px]"
              />
              {/* Move insurance details here */}
              <div>
                <Input
                  id="admission.insuranceDetails.provider"
                  placeholder="Insurance Provider"
                  value={formData.admission.insuranceDetails.provider}
                  onChange={handleInputChange}
                />
                {errors['admission.insuranceDetails.provider'] && 
                  <p className="text-red-500 text-xs mt-1">{errors['admission.insuranceDetails.provider']}</p>}
              </div>
              <div>
                <Input
                  id="admission.insuranceDetails.policyNumber"
                  placeholder="Policy Number"
                  value={formData.admission.insuranceDetails.policyNumber}
                  onChange={handleInputChange}
                />
                {errors['admission.insuranceDetails.policyNumber'] && 
                  <p className="text-red-500 text-xs mt-1">{errors['admission.insuranceDetails.policyNumber']}</p>}
              </div>
            </div>

            {/* Admission Details */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Admission Details</h3>
              <div>
                <Select
                  id="admission.department"
                  onValueChange={(value) => handleInputChange({ target: { id: 'admission.department', value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['admission.department'] && <p className="text-red-500 text-xs mt-1">{errors['admission.department']}</p>}
              </div>
              <Select
                id="admission.assignedDoctor"
                onValueChange={(value) => handleInputChange({ target: { id: 'admission.assignedDoctor', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assigned Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor._id} value={doctor._id}>{doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  id="admission.assignedRoom"
                  onValueChange={(value) => {
                    handleInputChange({ target: { id: 'admission.assignedRoom', value } });
                    setFormData(prev => ({
                      ...prev,
                      admission: {
                        ...prev.admission,
                        assignedBed: ''
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter(room => room.status !== 'Occupied')
                      .map(room => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.roomNumber} - {room.type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  id="admission.assignedBed"
                  onValueChange={(value) => handleInputChange({ target: { id: 'admission.assignedBed', value } })}
                  disabled={!formData.admission.assignedRoom}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.admission.assignedRoom &&
                      rooms
                        .find(room => room._id === formData.admission.assignedRoom)
                        ?.beds.filter(bed => bed.status !== 'Occupied')
                        .map(bed => (
                          <SelectItem key={bed._id} value={bed._id}>
                            {bed.bedNumber}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
             
              
              <div>
                <Textarea
                  id="admission.diagnosis"
                  placeholder="Diagnosis"
                  value={formData.admission.diagnosis}
                  onChange={(e) => handleInputChange({ target: { id: 'admission.diagnosis', value: e.target.value } })}
                  className="h-[60px]"
                />
                {errors['admission.diagnosis'] && <p className="text-red-500 text-xs mt-1">{errors['admission.diagnosis']}</p>}
              </div>

              {/* Admission Vitals */}
              <h4 className="font-semibold text-sm mt-4">Admission Vitals</h4>
              <div className="grid grid-cols-2 gap-2">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">Register Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}