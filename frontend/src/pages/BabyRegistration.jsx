import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Heart,
  Star,
  Sun,
  Clock,
  ConeIcon,
  Printer,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createBaby } from "../redux/slices/babySlice";
import { format, parse, formatISO } from "date-fns";
import BirthCertificate from "../components/BirthCertificate";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function BabyRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { patientId } = useParams();
  const location = useLocation();
  const { motherData, admissionData } = location.state || {};

  const { status, error } = useSelector((state) => state.babies);
  // Convert current time to 12-hour format for initial state
  const now = new Date();
  const initialTime = format(now, "hh:mm a");

  const [formData, setFormData] = useState({
    gender: "",
    dateOfBirth: format(new Date(), "yyyy-MM-dd"),
    timeOfBirth: initialTime,
    weight: "",
    admissionDate: admissionData?.bookingDate
      ? format(new Date(admissionData.bookingDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    timeOfAdmission:
      admissionData?.bookingTime || format(new Date(), "hh:mm a"),
    apgarScore: {
      oneMinute: "",
      fiveMinutes: "",
      tenMinutes: "",
    },
    babyHandOverName: "",
    babyHandOverRelation: "",
  });

  const [showCertificate, setShowCertificate] = useState(false);
  const [registeredBaby, setRegisteredBaby] = useState(null);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);

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

  const handleGenderChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleTimeChange = (time, meridiem) => {
    setFormData((prev) => ({
      ...prev,
      timeOfBirth: `${time} ${meridiem}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.gender) {
      toast({
        title: "Error",
        description: "Please select the baby's gender",
        variant: "destructive",
      });
      return;
    }

    if (!formData.weight) {
      toast({
        title: "Error",
        description: "Please enter the baby's weight",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(
        createBaby({
          ...formData,
          mother: motherData._id,
          isNew:true,
          ipdAdmission: patientId,
          admissionDate: formData.admissionDate,
          timeOfAdmission: formData.timeOfAdmission,
          weight: parseFloat(formData.weight),
          apgarScore: {
            oneMinute: parseInt(formData.apgarScore.oneMinute),
            fiveMinutes: parseInt(formData.apgarScore.fiveMinutes),
            tenMinutes: parseInt(formData.apgarScore.tenMinutes),
          },
        })
      ).unwrap();

      setRegisteredBaby(result);
      setShowCertificate(true);

      toast({
        variant:'success',
        title: "Success",
        description: "Baby record has been registered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Something went wrong",
        variant: "destructive",
      });
    }
  };


  // Extract hours, minutes, and meridiem from time string
  const [hours, minutes, meridiem] = formData.timeOfBirth.split(/[:\s]/);

  return (
    <>
      <div className="h-[calc(100vh-4rem)] p-4 p-b-0 bg-gradient-to-b from-pink-50 to-blue-50">
        <div className="h-full flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-pink-100 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Card className="flex-1 border-2 border-pink-200 shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-200 to-blue-200 border-b-2 border-pink-200">
              <div className="flex items-center gap-3">
                <Baby className="h-8 w-8 text-pink-500" />
                <CardTitle className="text-2xl font-bold text-gray-700">
                  Welcome Little One!
                </CardTitle>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1">
              <CardContent className="p-4 space-y-4">
                {/* Mother Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border-2 border-pink-100">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-pink-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Mother's Name
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {motherData?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">UHID</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {motherData?.registrationNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Admission Details Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-green-500 shrink-0" />
                      <h3 className="font-semibold text-gray-700 text-lg">
                        Admission Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Admission Date</Label>
                        <Input
                          type="date"
                          name="admissionDate"
                          value={formData.admissionDate}
                          onChange={handleInputChange}
                          className="border-2 border-green-200 hover:border-green-300 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700">Admission Time</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="time"
                              name="timeOfAdmission"
                              value={formData.timeOfAdmission.split(" ")[0]}
                              onChange={(e) => {
                                const timeValue = e.target.value;
                                if (timeValue) {
                                  const date = parse(
                                    timeValue,
                                    "HH:mm",
                                    new Date()
                                  );
                                  const time12h = format(date, "hh:mm a");
                                  setFormData((prev) => ({
                                    ...prev,
                                    timeOfAdmission: time12h,
                                  }));
                                }
                              }}
                              className="border-2 border-green-200 hover:border-green-300 transition-colors pl-10"
                            />
                          </div>
                          <Select
                            value={
                              formData.timeOfAdmission
                                .split(" ")[1]
                                ?.toLowerCase() || "am"
                            }
                            onValueChange={(value) => {
                              const currentTime =
                                formData.timeOfAdmission.split(" ")[0];
                              setFormData((prev) => ({
                                ...prev,
                                timeOfAdmission: `${currentTime} ${value.toUpperCase()}`,
                              }));
                            }}
                          >
                            <SelectTrigger className="w-[80px] border-2 border-green-200 hover:border-green-300 transition-colors">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Gender
                      </Label>
                      <Select
                        onValueChange={handleGenderChange}
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

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Weight (grams)
                      </Label>
                      <Input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                        placeholder="Enter baby's weight"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="border-2 border-pink-200 hover:border-pink-300 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Time of Birth
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="time"
                            name="timeOfBirth"
                            value={formData.timeOfBirth.split(" ")[0]}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              if (timeValue) {
                                // Parse 24h time to 12h format
                                const date = parse(
                                  timeValue,
                                  "HH:mm",
                                  new Date()
                                );
                                const time12h = format(date, "hh:mm a");
                                setFormData((prev) => ({
                                  ...prev,
                                  timeOfBirth: time12h,
                                }));
                              }
                            }}
                            className="border-2 border-pink-200 hover:border-pink-300 transition-colors pl-10"
                          />
                        </div>
                        <Select
                          value={
                            formData.timeOfBirth.split(" ")[1]?.toLowerCase() ||
                            "am"
                          }
                          onValueChange={(value) => {
                            const currentTime =
                              formData.timeOfBirth.split(" ")[0];
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

                  {/* APGAR Score Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-6 rounded-xl border-2 border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Sun className="h-5 w-5 text-yellow-500 shrink-0" />
                      <h3 className="font-semibold text-gray-700 text-lg">
                        APGAR Score
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">1 Minute</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          name="apgarScore.oneMinute"
                          value={formData.apgarScore.oneMinute}
                          onChange={handleInputChange}
                          className="border-2 border-blue-200 hover:border-blue-300 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700">5 Minutes</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          name="apgarScore.fiveMinutes"
                          value={formData.apgarScore.fiveMinutes}
                          onChange={handleInputChange}
                          className="border-2 border-blue-200 hover:border-blue-300 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700">10 Minutes</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          name="apgarScore.tenMinutes"
                          value={formData.apgarScore.tenMinutes}
                          onChange={handleInputChange}
                          className="border-2 border-blue-200 hover:border-blue-300 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Baby Handover Section before the submit button */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="h-5 w-5 text-purple-500 shrink-0" />
                      <h3 className="font-semibold text-gray-700 text-lg">
                        Baby Handover Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Handover Person Name</Label>
                        <Input
                          type="text"
                          name="babyHandOverName"
                          value={formData.babyHandOverName}
                          onChange={handleInputChange}
                          className="border-2 border-purple-200 hover:border-purple-300 transition-colors"
                          placeholder="Enter name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700">Relation with Baby</Label>
                        <Input
                          type="text"
                          name="babyHandOverRelation"
                          value={formData.babyHandOverRelation}
                          onChange={handleInputChange}
                          className="border-2 border-purple-200 hover:border-purple-300 transition-colors"
                          placeholder="Enter relation"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </ScrollArea>

            {/* Fixed Submit Button */}
            <div className="p-4 border-t border-pink-100 bg-white/80">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 text-white font-semibold px-8 py-2 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </div>
                ) : (
                  <>
                    <Baby className="h-5 w-5 mr-2" />
                    Register Birth
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Replace old certificate modal with new component */}
      <BirthCertificate
        open={showCertificate}
        onOpenChange={setShowCertificate}
        hospitalInfo={hospitalInfo}
        motherData={motherData}
        babyData={formData}
        certificateNumber={registeredBaby?.birthCounter}
      />
    </>
  );
}
