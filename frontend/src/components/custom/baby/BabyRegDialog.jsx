import React, { useState } from "react";
import { Baby, Heart, Star, Sun, Clock } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createBaby } from "../../../redux/slices/babySlice";
import { format, parse } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";

const BabyRegDialog = ({ open, onOpenChange, motherData, admissionId }) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const now = new Date();
  const initialTime = format(now, "hh:mm a");
  const { createBabyStatus } = useSelector(state => state.babies);

  const formatBookingTime = (timeString) => {
    if (!timeString) return format(new Date(), "hh:mm a");
    try {
      // Assuming timeString is in "HH:mm" 24-hour format
      const parsedTime = parse(timeString, "HH:mm", new Date());
      return format(parsedTime, "hh:mm a");
    } catch (error) {
      return format(new Date(), "hh:mm a");
    }
  };

  const [formData, setFormData] = useState({
    gender: "",
    dateOfBirth: format(new Date(), "yyyy-MM-dd"),
    timeOfBirth: initialTime,
    weight: "",
    admissionDate: motherData?.bookingDate ? format(new Date(motherData.bookingDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    timeOfAdmission: formatBookingTime(motherData?.bookingTime),
    apgarScore: {
      oneMinute: "",
      fiveMinutes: "",
      tenMinutes: "",
    },
    babyHandOverName: "",
    babyHandOverRelation: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("apgarScore.")) {
      const scoreKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        apgarScore: {
          ...prev.apgarScore,
          [scoreKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.gender || !formData.weight) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(
        createBaby({
          ...formData,
          mother: motherData._id,
          isNew: true,
          ipdAdmission: admissionId,
          weight: parseFloat(formData.weight),
          apgarScore: {
            oneMinute: parseInt(formData.apgarScore.oneMinute),
            fiveMinutes: parseInt(formData.apgarScore.fiveMinutes),
            tenMinutes: parseInt(formData.apgarScore.tenMinutes),
          },
        })
      ).unwrap();

      toast({
        variant: "success",
        title: "Success",
        description: "Baby record has been registered successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]  overflow-visible">
        <DialogHeader className="">
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-pink-500" />
            Register New Baby
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className=" px-1 max-h-[80vh]">
          <div className="space-y-4">
            {/* Mother Info & Admission Details */}
            <div className="grid grid-cols-2 gap-2 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border-2 border-pink-100">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-600">Mother's Name</p>
                  <p className="font-semibold">{motherData?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">UHID</p>
                  <p className="font-semibold">{motherData?.registrationNumber}</p>
                </div>
              </div>

              {/* Admission Details */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="">
                    <Label>Admission Date</Label>
                    <Input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                    />
                  </div>

                  <div className="">
                    <Label>Admission Time</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="time"
                          name="timeOfAdmission"
                          value={formData.timeOfAdmission.split(" ")[0]}
                          onChange={(e) => {
                            const timeValue = e.target.value;
                            if (timeValue) {
                              const date = parse(timeValue, "HH:mm", new Date());
                              const time12h = format(date, "hh:mm a");
                              setFormData((prev) => ({
                                ...prev,
                                timeOfAdmission: time12h,
                              }));
                            }
                          }}
                          className="border-2 border-pink-200 hover:border-pink-300 transition-colors "
                        />
                      </div>
                      <Select
                        value={formData.timeOfAdmission.split(" ")[1]?.toLowerCase() || "am"}
                        onValueChange={(value) => {
                          const currentTime = formData.timeOfAdmission.split(" ")[0];
                          setFormData((prev) => ({
                            ...prev,
                            timeOfAdmission: `${currentTime} ${value.toUpperCase()}`,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-[80px] border-2 border-pink-200 hover:border-pink-300 transition-colors">
                          <SelectValue placeholder="AM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Details */}
            <div className="grid grid-cols-4 gap-2 p-1">
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                  value={formData.gender}
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

              <div className="space-y-1">
                <Label>Weight (grams)</Label>
                <Input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Enter weight"
                />
              </div>

              <div className="space-y-1">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-1">
                <Label>Time of Birth</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="time"
                      name="timeOfBirth"
                      value={formData.timeOfBirth.split(" ")[0]}
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        if (timeValue) {
                          const date = parse(timeValue, "HH:mm", new Date());
                          const time12h = format(date, "hh:mm a");
                          setFormData((prev) => ({
                            ...prev,
                            timeOfBirth: time12h,
                          }));
                        }
                      }}
                      className="pl-10"
                    />
                    <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                  <Select
                    value={formData.timeOfBirth.split(" ")[1]?.toLowerCase() || "am"}
                    onValueChange={(value) => {
                      const currentTime = formData.timeOfBirth.split(" ")[0];
                      setFormData((prev) => ({
                        ...prev,
                        timeOfBirth: `${currentTime} ${value.toUpperCase()}`,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="AM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="am">AM</SelectItem>
                      <SelectItem value="pm">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* APGAR Score */}
            <div className="space-y-2 p-2">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">APGAR Score</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {["oneMinute", "fiveMinutes", "tenMinutes"].map((time) => (
                  <div key={time} className="space-y-1">
                    <Label>
                      {time === "oneMinute"
                        ? "1 Minute"
                        : time === "fiveMinutes"
                        ? "5 Minutes"
                        : "10 Minutes"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      name={`apgarScore.${time}`}
                      value={formData.apgarScore[time]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Baby Handover */}
            <div className="grid grid-cols-2 gap-4 p-2">
              <div className="space-y-2">
                <Label>Handover Person Name</Label>
                <Input
                  name="babyHandOverName"
                  value={formData.babyHandOverName}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label>Relation with Baby</Label>
                <Input
                  name="babyHandOverRelation"
                  value={formData.babyHandOverRelation}
                  onChange={handleInputChange}
                  placeholder="Enter relation"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-pink-600 hover:bg-pink-700"
            disabled={createBabyStatus === 'loading'}
          >
            {createBabyStatus === 'loading' ? 'Registering...' : 'Register Baby'}
          </Button>
        </div>
        </ScrollArea>

        
      </DialogContent>
    </Dialog>
  );
};

export default BabyRegDialog;