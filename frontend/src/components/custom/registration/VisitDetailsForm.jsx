import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

export default function VisitDetailsForm({
  formData,
  handleSelectChange,
  handleInputChange,
  errors,
}) {
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);

  const formatTime = (time) => {
    if (!time) return { hour: "", minute: "", amPm: "AM" };
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const amPm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return { hour: String(hour).padStart(2, "0"), minute, amPm };
  };

  const [startTime, setStartTime] = useState(
    formatTime(formData.visit.timeSlot.start)
  );
  const [endTime, setEndTime] = useState(
    formatTime(formData.visit.timeSlot.end)
  );

  useEffect(() => {
    setStartTime(formatTime(formData.visit.timeSlot.start));
    setEndTime(formatTime(formData.visit.timeSlot.end));
  }, [formData.visit.timeSlot.start, formData.visit.timeSlot.end]);

  const handleTimeChange = useCallback((field, type, value) => {
    const updateTime = (prevTime) => {
      const newTime = { ...prevTime, [type]: value };
      let timeString;
      if (type === "hour")
        timeString = `${value}:${newTime.minute} ${newTime.amPm}`;
      else if (type === "minute")
        timeString = `${newTime.hour}:${value} ${newTime.amPm}`;
      else if (type === "amPm")
        timeString = `${newTime.hour}:${newTime.minute} ${value}`;

      handleInputChange({
        target: { id: `visit.timeSlot.${field}`, value: timeString },
      });
      return newTime;
    };

    if (field === "start") {
      setStartTime(updateTime);
    } else {
      setEndTime(updateTime);
    }
  }, [handleInputChange]);

  return (
    <>
      <div className="relative">
        <Select
          id="visit.department"
          onValueChange={(value) =>
            handleSelectChange("visit.department", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department._id} value={department._id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Select
          id="visit.doctor"
          onValueChange={(value) => handleSelectChange("visit.doctor", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assigned Doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor._id} value={doctor._id}>
                Dr. {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative col-span-1">
        <Input
          type="date"
          id="visit.bookingDate"
          value={formData.visit.bookingDate}
          onChange={handleInputChange}
          className={`peer pl-2 pt-2 pb-2 block w-full border rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white ${
            errors["visit.bookingDate"] ? "border-red-500" : "border-gray-300"
          }`}
        />
        <Label
          htmlFor="visit.bookingDate"
          className={`absolute text-xs transform -translate-y-3 top-1 z-10 origin-[0] left-2 px-1 bg-white ${
            errors["visit.bookingDate"] ? "text-red-500" : "text-gray-500"
          }`}
        >
          Booking Date{" "}
          {errors["visit.bookingDate"] && (
            <span className="text-red-500 ml-1">*Required</span>
          )}
        </Label>
      </div>

      <div className="grid grid-cols-4 items-center mb-2">
        <Label>Start Time:</Label>
        <div className="flex space-x-2 ">
          <Select
            value={startTime.hour}
            onValueChange={(value) => handleTimeChange("start", "hour", value)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={startTime.minute}
            onValueChange={(value) =>
              handleTimeChange("start", "minute", value)
            }
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={startTime.amPm}
            onValueChange={(value) => handleTimeChange("start", "amPm", value)}
          >
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

      <div className="grid grid-cols-4 items-center gap-2 mb-2">
        <Label>End Time:</Label>
        <div className="flex space-x-2">
          <Select
            value={endTime.hour}
            onValueChange={(value) => handleTimeChange("end", "hour", value)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={endTime.minute}
            onValueChange={(value) => handleTimeChange("end", "minute", value)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={endTime.amPm}
            onValueChange={(value) => handleTimeChange("end", "amPm", value)}
          >
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
    </>
  );
}