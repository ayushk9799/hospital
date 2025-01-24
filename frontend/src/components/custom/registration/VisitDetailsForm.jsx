import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import MemoizedInput from "./MemoizedInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { FloatingLabelSelect } from "./PatientInfoForm";

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
  const isMobile = useMediaQuery("(max-width: 640px)");
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

  const handleTimeChange = useCallback(
    (field, type, value) => {
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
    },
    [handleInputChange]
  );

  return (
    <div className="space-y-4">
      
      <MemoizedInput
        id="contactNumber"
        label="Contact Number"
        type="tel"
        value={formData.contactNumber}
        onChange={handleInputChange}
        error={errors.contactNumber}
      />

      <Textarea
        id="address"
        placeholder="Address: 123 Main St, Anytown USA"
        value={formData.address}
        onChange={handleInputChange}
        className="min-h-9 h-9 no-scrollbar"
      />
      <div className="grid grid-cols-[1fr_2fr] gap-2">
      <FloatingLabelSelect
      id="visit.relation"
      label="Relation"
      value={formData.visit.relation}
      onValueChange={(value) => handleSelectChange("visit.relation", value)}
      >
         {["Father","Husband","Mother","Wife","Guardian"].map((relation) => (
          <SelectItem key={relation} value={relation}>
            {relation}
          </SelectItem>
        ))}
        </FloatingLabelSelect>
      <MemoizedInput
      id="visit.guardianName"
      value={formData.visit.guardianName}
      onChange={handleInputChange}
      label={`${formData.visit.relation?formData.visit.relation+"'s Name":"Guradian's Name"}`}
      />
     
      </div>
      
      {!isMobile && (
        <div className="relative ">
          <Input
            type="date"
            id="visit.bookingDate"
            value={formData.visit.bookingDate}
            onChange={handleInputChange}
            tabIndex={-1}
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
            Booking Date
            {errors["visit.bookingDate"] && (
              <span className="text-red-500 ml-1">*Required</span>
            )}
          </Label>
        </div>
      )}

     
    </div>
  );
}
