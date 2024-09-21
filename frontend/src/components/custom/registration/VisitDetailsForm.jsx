import React,{useState} from "react";
import { useSelector } from "react-redux";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
export default function VisitDetailsForm({ formData, handleSelectChange, handleInputChange }) {
  const doctors = useSelector((state) => state.staff.doctors);
  const departments = useSelector((state) => state.departments.departments);


  const formatTime = (time) => {
    if (!time) return { hour: '', minute: '', amPm: 'AM' };
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return { hour: String(hour).padStart(2, '0'), minute, amPm };
  };

  const handleTimeChange = (field, type, value) => {
  

      if(field === 'start'){
        setStartTime({...startTime, [type]:value})
      }
      else{
        setEndTime({...endTime, [type]:value})
      }
   
      console.log(startTime,endTime)
     let newTime;
if(field === 'start'){
    if (type === 'hour') newTime = `${value}:${startTime.minute} ${startTime.amPm}`;
    else if (type === 'minute') newTime = `${startTime.hour}:${value} ${startTime.amPm}`;
    else if (type === 'amPm') newTime = `${startTime.hour}:${startTime.minute} ${value}`;
}
else{
  if (type === 'hour') newTime = `${endTime.hour}:${endTime.minute} ${value}`;
  else if (type === 'minute') newTime = `${endTime.hour}:${value} ${endTime.amPm}`;
  else if (type === 'amPm') newTime = `${endTime.hour}:${endTime.minute} ${value}`;
}
     
     handleInputChange({ target: { id: `visit.timeSlot.${field}`, value: newTime } });
  };

  const [startTime, setStartTime] = useState(formatTime(formData.visit.timeSlot.start));
  const [endTime, setEndTime] = useState(formatTime(formData.visit.timeSlot.end))
  console.log(startTime,endTime);
  console.log(formData.visit.timeSlot.start,formData.visit.timeSlot.end)
  return (
    <>
      <Select
        id="visit.department"
        onValueChange={(value) => handleSelectChange("visit.department", value)}
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

      <div className="grid grid-cols-[120px_1fr] items-center gap-2 mb-2">
        <Label htmlFor="visit.bookingDate">Booking Date:</Label>
        <Input
          type="date"
          id="visit.bookingDate"
          value={formData.visit.bookingDate}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-4 items-center mb-2">
        <Label>Start Time:</Label>
        <div className="flex space-x-2 ">
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

      <div className="grid grid-cols-4 items-center gap-2 mb-2">
        <Label>End Time:</Label>
        <div className="flex space-x-2">
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
    </>
  );
}