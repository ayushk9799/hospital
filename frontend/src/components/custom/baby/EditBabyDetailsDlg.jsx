import React, { useState, useEffect } from "react";
import { Baby, Heart, Star, Sun, Clock } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { editBaby } from "../../../redux/slices/babySlice";
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

const EditBabyDetailsDlg = ({ open, onOpenChange, babyData, motherData }) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { editBabyStatus } = useSelector(state => state.babies);

  const [formData, setFormData] = useState({
    gender: "",
    dateOfBirth: "",
    timeOfBirth: "",
    weight: "",
    admissionDate: "",
    timeOfAdmission: "",
    apgarScore: {
      oneMinute: "",
      fiveMinutes: "",
      tenMinutes: "",
    },
    babyHandOverName: "",
    babyHandOverRelation: "",
    babyFatherName: "",
  });

  useEffect(() => {
    if (babyData) {
      setFormData({
        gender: babyData.gender || "",
        dateOfBirth: format(new Date(babyData.dateOfBirth), "yyyy-MM-dd"),
        timeOfBirth: babyData.timeOfBirth || "",
        weight: babyData.weight || "",
        admissionDate: format(new Date(babyData.admissionDate), "yyyy-MM-dd"),
        timeOfAdmission: babyData.timeOfAdmission || "",
        apgarScore: {
          oneMinute: babyData.apgarScore?.oneMinute || "",
          fiveMinutes: babyData.apgarScore?.fiveMinutes || "",
          tenMinutes: babyData.apgarScore?.tenMinutes || "",
        },
        babyHandOverName: babyData.babyHandOverName || "",
        babyHandOverRelation: babyData.babyHandOverRelation || "",
        babyFatherName: babyData.babyFatherName || "",
      });
    }
  }, [babyData]);

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
      await dispatch(
        editBaby({
          ...babyData,
          ...formData,
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
        description: "Baby record has been updated successfully",
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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="">
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-pink-500" />
            Edit Baby Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4">
            {/* Mother Info & Admission Details */}
            <div className=" gap-2 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border-2 border-pink-100">
              <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-600">Mother's Name</p>
                  <p className="font-semibold uppercase">{motherData?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Birth Number</p>
                  <p className="font-semibold">{babyData?.birthCounter}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">UHID</p>
                  <p className="font-semibold">{motherData?.registrationNumber}</p>
                </div>
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
                          className="border-2 border-pink-200 hover:border-pink-300 transition-colors pl-10"
                        />
                        <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
            <div className="grid grid-cols-2 gap-4 p-2">
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                  value={formData.gender}
                >
                  <SelectTrigger className="border-2 border-pink-200 hover:border-pink-300 transition-colors">
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
                  className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
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
                      className="border-2 border-pink-200 hover:border-pink-300 transition-colors pl-10"
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
                      className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
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
                  className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label>Relation with Baby</Label>
                <Input
                  name="babyHandOverRelation"
                  value={formData.babyHandOverRelation}
                  onChange={handleInputChange}
                  placeholder="Enter relation"
                  className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-pink-600 hover:bg-pink-700"
            disabled={editBabyStatus === 'loading'}
          >
            {editBabyStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBabyDetailsDlg;
