import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { parseAge } from "../assets/Data";
import { useSelector, useDispatch } from "react-redux";
import OPDPrescriptionTemplate from "../templates/opdPrescription";
import { DEFAULT_PRESCRIPTION_FORM_CONFIG } from "../config/opdPrescriptionConfig";
import { fetchDoctorPrescriptionTemplates } from "../redux/slices/doctorPrescriptionSlice";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  Edit,
  Printer,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Droplet,
  Wind,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { cn } from "../lib/utils";

// Move VitalItem component definition here
const VitalItem = ({ icon, label, value, unit }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
    <div className="mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold">
        {value}{" "}
        <span className="text-sm font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  </div>
);

export default function PatientDetails({
  patientData,
  selectedVisit: selectedVisitProp,
  onVisitSelect,
}) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("");
  const [allDates, setAllDates] = useState([]);
  const navigate = useNavigate();
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const { templates: doctorTemplates, status: doctorTemplatesStatus } =
    useSelector((state) => state.doctorPrescription);

  // Fetch doctor templates when component mounts
  useEffect(() => {
    if (doctorTemplatesStatus === "idle") {
      dispatch(fetchDoctorPrescriptionTemplates());
    }
  }, [doctorTemplatesStatus, dispatch]);

  useEffect(() => {
    if (patientData) {
      const dates = [
        ...(patientData.visits || []).map((visit) => ({
          date: visit.bookingDate,
          type: "visit",
          data: visit,
        })),
        ...(patientData.admissionDetails || []).map((admission) => ({
          date: admission.bookingDate,
          type: "admission",
          data: admission,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllDates(dates);

      if (dates.length > 0) {
        setActiveTab("vitals");
      }
    }
  }, [patientData]);

  useEffect(() => {
    if (selectedVisitProp) {
      setActiveTab("vitals");
    }
  }, [selectedVisitProp]);

  if (!patientData) return null;

  // Get form configuration based on doctor (similar to OPDModule.jsx)
  const getFormConfigForVisit = (visitData) => {
    if (doctorTemplates && visitData?.doctor?._id) {
      const doctorTemplate = doctorTemplates.find((template) =>
        template.associatedDoctors.some(
          (doc) => doc._id === visitData.doctor._id
        )
      );
      if (doctorTemplate) {
        return doctorTemplate.value;
      }
    }
    return DEFAULT_PRESCRIPTION_FORM_CONFIG;
  };

  // Helper function to transform prescription data to formData structure
   // Helper function to standardize array formatting
   const standardizeArrayFormat = (value, defaultStructure = { name: '' }) => {
    if (!value) return [];
    
    if (!Array.isArray(value)) {
      // If it's a string, split by comma and convert to objects
      if (typeof value === 'string') {
        return value.split(',').map(item => ({ name: item.trim() })).filter(item => item.name);
      }
      return [];
    }
    
    // If it's already an array, check the format of elements
    return value.map(item => {
      if (typeof item === 'string') {
        return { name: item };
      } else if (typeof item === 'object' && item !== null) {
        // If it's already an object, ensure it has the required structure
        if (!item.name && Object.keys(defaultStructure).length === 1) {
          // If it's a simple object but missing 'name', try to extract a meaningful value
          const firstKey = Object.keys(item)[0];
          return { name: item[firstKey] || '' };
        }
        return { ...defaultStructure, ...item };
      }
      return defaultStructure;
    }).filter(item => item.name); // Remove empty items
  };

  // Helper function to transform prescription data to formData structure
  const transformPrescriptionToFormData = (visitData) => {
    const prescription = visitData.prescription || {};
    
    return {
      vitals: visitData.vitals || {},
      
      // Handle medications with proper structure
      medications: (() => {
        const meds = prescription.medications || visitData.medications || [];
        if (!Array.isArray(meds)) return [];
        
        return meds.map(med => {
          if (typeof med === 'string') {
            return { name: med, frequency: '', duration: '', remarks: '' };
          } else if (typeof med === 'object' && med !== null) {
            return {
              name: med.name || '',
              frequency: med.frequency || '',
              duration: med.duration || '',
              remarks: med.remarks || '',
              ...med
            };
          }
          return { name: '', frequency: '', duration: '', remarks: '' };
        }).filter(med => med.name);
      })(),
      
      // Standardize diagnosis array
      diagnosis: standardizeArrayFormat(prescription.diagnosis),
      
      // Standardize comorbidities array  
      comorbidities: standardizeArrayFormat(prescription.comorbidities || visitData.comorbidities),
      
      // Standardize labTests array
      labTests: standardizeArrayFormat(prescription.labTests || visitData.labTests),
      
      // Handle text fields
      chiefComplaints: prescription.chiefComplaint || prescription.chiefComplaints || visitData.reasonForVisit || '',
      treatment: prescription.treatment || visitData.treatment || '',
      additionalInstructions: prescription.additionalInstructions || visitData.additionalInstructions || '',
      advice: prescription.advice || '',
      followUp: prescription.followUp || '',
      
      // Include any other dynamic fields from prescription
      ...Object.keys(prescription).reduce((acc, key) => {
        // Skip fields we've already processed
        const processedFields = ['medications', 'diagnosis', 'comorbidities', 'labTests', 'chiefComplaint', 'chiefComplaints', 'treatment', 'additionalInstructions', 'advice', 'followUp'];
        if (!processedFields.includes(key)) {
          const value = prescription[key];
          // If it's an array, try to standardize it
          if (Array.isArray(value)) {
            acc[key] = standardizeArrayFormat(value);
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {})
    };
  };

  const renderVisitDetails = () => {
    if (!selectedVisitProp || !patientData) return null;

    const visitData = selectedVisitProp;

    const isIPD = patientData.admissionDetails?.some(
      (ad) => ad._id === visitData._id
    );

    // Get the appropriate form configuration for this visit's doctor
    const formConfig = getFormConfigForVisit(visitData);

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList
            className={cn(
              "inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground mb-4",
              "w-max min-w-full"
            )}
          >
            <TabsTrigger value="vitals" className="px-3">
              Vitals
            </TabsTrigger>
            <TabsTrigger value="labReports" className="px-3">
              Lab Reports
            </TabsTrigger>
            {!isIPD && (
              <TabsTrigger value="prescription" className="px-3">
                Prescription
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent >
              {isIPD ? (
                <div>
                  <h4 className="font-semibold mb-2">Admission Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <VitalItem
                      icon={<Activity className="h-8 w-8 text-blue-500" />}
                      label="Blood Pressure"
                      value={visitData.vitals?.admission?.bloodPressure}
                      unit="mmHg"
                    />
                    <VitalItem
                      icon={<Heart className="h-8 w-8 text-red-500" />}
                      label="Heart Rate"
                      value={visitData.vitals?.admission?.heartRate}
                      unit="bpm"
                    />
                    <VitalItem
                      icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                      label="Temperature"
                      value={visitData.vitals?.admission?.temperature}
                      unit="°C"
                    />
                    <VitalItem
                      icon={<Scale className="h-8 w-8 text-green-500" />}
                      label="Weight"
                      value={visitData.vitals?.admission?.weight}
                      unit="kg"
                    />
                    <VitalItem
                      icon={<Ruler className="h-8 w-8 text-purple-500" />}
                      label="Height"
                      value={visitData.vitals?.admission?.height}
                      unit="cm"
                    />
                    <VitalItem
                      icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                      label="Oxygen Saturation"
                      value={visitData.vitals?.admission?.oxygenSaturation}
                      unit="%"
                    />
                    <VitalItem
                      icon={<Wind className="h-8 w-8 text-teal-500" />}
                      label="Respiration Rate"
                      value={visitData.vitals?.admission?.respiratoryRate}
                      unit="breaths/min"
                    />
                  </div>
                  <h4 className="font-semibold mb-2">Discharge Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VitalItem
                      icon={<Activity className="h-8 w-8 text-blue-500" />}
                      label="Blood Pressure"
                      value={visitData.vitals?.discharge?.bloodPressure}
                      unit="mmHg"
                    />
                    <VitalItem
                      icon={<Heart className="h-8 w-8 text-red-500" />}
                      label="Heart Rate"
                      value={visitData.vitals?.discharge?.heartRate}
                      unit="bpm"
                    />
                    <VitalItem
                      icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                      label="Temperature"
                      value={visitData.vitals?.discharge?.temperature}
                      unit="°C"
                    />
                    <VitalItem
                      icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                      label="Oxygen Saturation"
                      value={visitData.vitals?.discharge?.oxygenSaturation}
                      unit="%"
                    />
                    <VitalItem
                      icon={<Wind className="h-8 w-8 text-teal-500" />}
                      label="Respiration Rate"
                      value={visitData.vitals?.discharge?.respiratoryRate}
                      unit="breaths/min"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <VitalItem
                    icon={<Activity className="h-8 w-8 text-blue-500" />}
                    label="Blood Pressure"
                    value={visitData.vitals?.bloodPressure}
                    unit="mmHg"
                  />
                  <VitalItem
                    icon={<Heart className="h-8 w-8 text-red-500" />}
                    label="Heart Rate"
                    value={visitData.vitals?.heartRate}
                    unit="bpm"
                  />
                  <VitalItem
                    icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                    label="Temperature"
                    value={visitData.vitals?.temperature}
                    unit="°C"
                  />
                  <VitalItem
                    icon={<Scale className="h-8 w-8 text-green-500" />}
                    label="Weight"
                    value={visitData.vitals?.weight}
                    unit="kg"
                  />
                  <VitalItem
                    icon={<Ruler className="h-8 w-8 text-purple-500" />}
                    label="Height"
                    value={visitData.vitals?.height}
                    unit="cm"
                  />
                  <VitalItem
                    icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                    label="Oxygen Saturation"
                    value={visitData.vitals?.oxygenSaturation}
                    unit="%"
                  />
                  <VitalItem
                    icon={<Wind className="h-8 w-8 text-teal-500" />}
                    label="Respiration Rate"
                    value={visitData.vitals?.respiratoryRate}
                    unit="breaths/min"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labReports">
          <Card>
            <CardHeader>
              <CardTitle>Lab Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {visitData.labReports && visitData.labReports.length > 0 ? (
                visitData.labReports.map((report, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {report.name.replaceAll("-", " ").toUpperCase()}
                      <span className="text-sm font-normal ml-2 text-gray-500">
                        {report.date
                          ? new Date(report.date).toLocaleDateString("en-IN")
                          : ""}
                      </span>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Normal Range</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(report?.report || {})
                          .filter(
                            ([_, data]) =>
                              data.value !== null && data.value !== ""
                          )
                          .map(([key, data]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">
                                {data.label}
                              </TableCell>
                              <TableCell>{data.value}</TableCell>
                              <TableCell>{data.unit}</TableCell>
                              <TableCell>{data.normalRange}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              ) : (
                <p>No lab reports available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {!isIPD && (
          <TabsContent value="prescription">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {(visitData.prescription &&
                  Object.keys(visitData.prescription).length > 0) ||
                visitData.vitals ||
                visitData.medications?.length > 0 ? (
                  <div className="flex justify-center bg-gray-100 p-4 min-h-[600px] overflow-auto">
                    <div
                      className="bg-white shadow-lg"
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        padding: "6mm 5mm",
                        margin: "0 auto",
                        transform: "scale(0.8)",
                        transformOrigin: "top center",
                      }}
                    >
                      <OPDPrescriptionTemplate
                        patient={{
                          ...patientData,
                          age: parseAge(patientData.age),
                        }}
                        formData={transformPrescriptionToFormData(visitData)}
                        field={formConfig.sections}
                        hospital={hospital}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No prescription data available for this visit.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    );
  };

  const handleEditClick = () => {
    if (!selectedVisitProp || !patientData) return;

    const visitData = selectedVisitProp;

    const patientDataForEdit = {
      ID: visitData._id,
      bookingNumber: visitData.bookingNumber,
      patient: {
        name: patientData.name,
        registrationNumber: patientData.registrationNumber,
        age: patientData.age,
        gender: patientData.gender,
        contactNumber: patientData.contactNumber,
      },
      bookingDate: visitData.bookingDate,
      clinicalSummary: visitData.clinicalSummary,
      notes: visitData.notes,
      type: patientData.admissionDetails?.some((ad) => ad._id === visitData._id)
        ? "IPD"
        : "OPD",
      vitals: visitData.vitals,
      diagnosis: visitData.diagnosis,
      treatment: visitData.treatment,
      medications: visitData.medications,
      additionalInstructions: visitData.additionalInstructions,
      labTests: visitData.labTests,
      comorbidities: visitData.comorbidities,
      conditionOnAdmission: visitData.conditionOnAdmission,
      conditionOnDischarge: visitData.conditionOnDischarge,
    };

    navigate("/doctors", { state: { editPatient: patientDataForEdit } });
  };

  return (
    <div className="container mx-auto px-2 space-y-2 bg-gray-50">
      <Card className="shadow-none border-none">
        <CardContent className="grid md:grid-cols-3 gap-4 p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2">
              <AvatarFallback>
                {patientData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {patientData.name}
              </h2>
              <p className="text-xs text-gray-500">
                ID: {patientData.registrationNumber}
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                {patientData.bloodType}
              </Badge>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Age & Gender"
              value={`${parseAge(patientData.age)}, ${patientData.gender}`}
            />
            <InfoItem
              icon={<Phone className="h-4 w-4" />}
              label="Contact"
              value={patientData.contactNumber}
            />
          </div>
          <div className="text-sm">
            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Address"
              value={patientData.address}
            />
            <InfoItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={patientData.email}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Visit History</h3>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-gray-100"
            onClick={handleEditClick}
            disabled={!selectedVisitProp}
          >
            <Edit className="mr-2 h-4 w-4" /> Doctor's Section
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {allDates.map((item) => (
            <Button
              key={`${item.data._id}-${item.type}`}
              variant={
                selectedVisitProp?._id === item.data._id ? "default" : "outline"
              }
              size="sm"
              className={`${
                selectedVisitProp?._id === item.data._id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => onVisitSelect(item.data)}
            >
              <span className="mr-1">
                {format(new Date(item.date), "dd MMM yyyy")}
              </span>
              <Badge variant="secondary" className="text-xs">
                {item.type === "visit" ? "OPD" : "IPD"}
              </Badge>
            </Button>
          ))}
        </div>
        {renderVisitDetails()}
      </div>
    </div>
  );
}

// New component for info items
function InfoItem({ icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="font-medium text-gray-700 text-xs">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}
