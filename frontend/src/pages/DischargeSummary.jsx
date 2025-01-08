import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useDispatch } from "react-redux";
import { fetchItems } from "../redux/slices/pharmacySlice";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import {
  X,
  CalendarIcon,
  ChevronRight,
  PlusCircle,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import TemplateLabReport from "./TemplateLabReport";
import {
  fetchVisitDetails,
  fetchRegistrationDetails,
} from "../redux/slices/patientSlice.js";
import { useLocation } from "react-router-dom";
import MultiSelectInput from "../components/custom/MultiSelectInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { fetchTemplates } from "../redux/slices/templatesSlice";
import { labCategories, labReportFields } from "../assets/Data";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import CreateLabReport from "./CreateLabReport";
import { useReactToPrint } from "react-to-print";
import DischargeSummaryPDF from "../components/custom/reports/DischargeSummaryPDF";
import {
  dischargePatient,
  saveDischargeData,
} from "../redux/slices/dischargeSlice";
import { useToast } from "../hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const LabReportTable = ({ report }) => {
  return (
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
        {Object.entries(report).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>{value.label}</TableCell>
            <TableCell>{value.value}</TableCell>
            <TableCell>{value.unit}</TableCell>
            <TableCell>{value.normalRange}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function DischargeSummary() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const ignoreList = location.state?.ignoreList || false;
  const dischargeData = location.state?.dischargeData || null;
  const {
    diagnosisTemplate = [],
    comorbidities = [],
    medicinelist = [],
  } = useSelector((state) => state.templates);
  // Get initial patient from Redux store
  const patientFromStore = useSelector((state) =>
    state.patients.patientlist.find((p) => p._id === patientId)
  );
  const labTestsTemplate = useSelector(
    (state) => state.templates.labTestsTemplate
  );

  const allLabTests = [
    ...labCategories.flatMap((category) =>
      category.types.map((type) => ({ name: type }))
    ),
    ...(labTestsTemplate?.map((template) => ({
      name: template.name,
      isTemplate: true,
    })) || []),
  ];

 
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientFromStore && !dischargeData) {
        try {
          if (patientId) {
            const result = await dispatch(
              fetchVisitDetails({ id: patientId, type: "IPD" })
            ).unwrap();

            setPatient(result);
          } else if (location.state?.patient) {
            const result = await dispatch(
              fetchVisitDetails({
                id: location.state?.patient?.admissionDetails.at(-1)._id,
                type: "IPD",
              })
            ).unwrap();
            setPatient(result);
          } else {
            setPatientInfo({
              name: "",
              age: "",
              gender: "",
              contactNumber: "",
              address: "",
              roomNumber: "",
              registrationNumber: "",
            });
          }
        } catch (error) {
          console.error("Error fetching patient details:", error);
        }
      } else {
        if (!ignoreList && !dischargeData) {
          setPatient(patientFromStore);
        } else {
          if (dischargeData) {
            setPatient(dischargeData);
          } else {
            const result = await dispatch(
              fetchVisitDetails({ id: patientId, type: "IPD" })
            ).unwrap();
            setPatient(result);
          }
        }
      }
    };

    fetchPatient();
  }, [dispatch, patientFromStore, location.state?.dischargeData]);

  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const templateStatus = useSelector((state) => state.templates.status);
  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);
  useEffect(() => {
    if (templateStatus === "idle") {
      dispatch(fetchTemplates());
    }
  }, [dispatch, templateStatus]);
  const [formData, setFormData] = useState({
    admissionDate: "",
    dateDischarged: "",
    diagnosis: "",
    clinicalSummary: "",
    treatment: "",
    conditionOnAdmission: "",
    conditionOnDischarge: "",
    investigations: [{ name: "", category: "" }],
    medicineAdvice: [{ name: "", dosage: "0-0-0", duration: "" }],
    notes: "",
    comorbidities: [{ name: "" }],
    comorbidityHandling: "separate",
    selectedTest: "",
    selectedCategory: "",
    vitals: {
      admission: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
      discharge: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
    },
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLabReportOpen, setIsLabReportOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    roomNumber: "",
    registrationNumber: "",
    ipdNumber: "",
  });
  useEffect(() => {
    if (patient) {
      setFormData((prevData) => ({
        ...prevData,
        admissionDate: patient.bookingDate
          ? new Date(patient.bookingDate).toISOString().split("T")[0]
          : "",
        dateDischarged: patient.dateDischarged || "",
        diagnosis: Array.isArray(patient.diagnosis)
          ? patient.diagnosis.join(", ")
          : patient.diagnosis || "",
        clinicalSummary: patient.clinicalSummary || "",
        treatment: patient.treatment || "",
        conditionOnAdmission: patient.conditionOnAdmission || "",
        conditionOnDischarge: patient.conditionOnDischarge || "",
        vitals: {
          admission: {
            bloodPressure: patient.vitals?.admission?.bloodPressure || "",
            heartRate: patient.vitals?.admission?.heartRate || "",
            temperature: patient.vitals?.admission?.temperature || "",
            oxygenSaturation: patient.vitals?.admission?.oxygenSaturation || "",
            respiratoryRate: patient.vitals?.admission?.respiratoryRate || "",
          },
          discharge: {
            bloodPressure: patient.vitals?.discharge?.bloodPressure || "",
            heartRate: patient.vitals?.discharge?.heartRate || "",
            temperature: patient.vitals?.discharge?.temperature || "",
            oxygenSaturation: patient.vitals?.discharge?.oxygenSaturation || "",
            respiratoryRate: patient.vitals?.discharge?.respiratoryRate || "",
          },
        },
        investigations:
          patient.labReports?.length > 0
            ? patient.labReports
            : [{ name: "", category: "" }], // Default empty investigation
        medicineAdvice: patient.medicineAdvice || [
          { name: "", dosage: "0-0-0", duration: "" },
        ],
        notes: patient.notes || "",
        comorbidities: patient.comorbidities?.map((comorbidity) => ({
          name: comorbidity,
        })) || [{ name: "" }],
      }));

      setPatientInfo({
        name: patient.patient.name || "",
        age: patient.patient.age || "",
        gender: patient.patient.gender || "",
        contactNumber: patient.patient.contactNumber || "",
        address: patient.patient.address || "",
        roomNumber: patient.assignedRoom?.roomNumber || "",
        registrationNumber: patient.registrationNumber || "",
        ipdNumber: patient.ipdNumber || "",
      });
    }
  }, [patient]);

  const [selectedReport, setSelectedReport] = useState(null);

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "diagnosis") {
      setCustomDiagnosis(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleInvestigationChange = (index, suggestion) => {
    const updatedInvestigations = [...formData.investigations];
    updatedInvestigations[index] = {
      name: suggestion.name,
      category: suggestion.category || "",
    };
    setFormData((prev) => ({ ...prev, investigations: updatedInvestigations }));
  };

  const handleAddInvestigation = () => {
    setFormData((prev) => ({
      ...prev,
      investigations: [...prev.investigations, { name: "", category: "" }],
    }));
  };

  const handleRemoveInvestigation = (index) => {
    setFormData((prev) => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== index),
    }));
  };

  const handleComorbiditiesChange = (newComorbidities) => {
    setFormData((prev) => ({ ...prev, comorbidities: newComorbidities }));
  };

  const handleRemoveSelected = (name) => {
    setFormData((prev) => ({
      ...prev,
      comorbidities: prev.comorbidities.filter((val) => val.name !== name),
    }));
  };

  const handleComorbidityHandlingChange = (value) => {
    setFormData((prev) => ({ ...prev, comorbidityHandling: value }));
  };

  const { toast } = useToast();
  const { status: dischargeStatus, savingStatus } = useSelector(
    (state) => state.discharge
  );

  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dischargeData = {
      patientId: patientId,
      dateDischarged: formData.dateDischarged,
      conditionOnAdmission: formData.conditionOnAdmission,
      conditionOnDischarge: formData.conditionOnDischarge,
      comorbidities: formData.comorbidities.map((c) => c.name),
      clinicalSummary: formData.clinicalSummary,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          frequency: m.dosage,
        })),
      labReports: formData.investigations
        .filter((inv) => inv.name.trim() !== "" && inv.report)
        .map((i) => ({
          name: i.name,
          report: i.report,
          date: i.date || new Date().toISOString(),
        })),
      vitals: formData.vitals,
      notes: formData.notes,
      status: "Discharged",
    };

    try {
      await dispatch(dischargePatient(dischargeData)).unwrap();
      toast({
        title: "Success",
        description: "Patient discharged successfully",
        variant: "success",
      });

      // Open print dialog instead of using window.confirm
      setIsPrintDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to discharge patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const dischargeData = {
      patientId: patientId || patient._id,
      dateDischarged: formData.dateDischarged,
      conditionOnAdmission: formData.conditionOnAdmission,
      conditionOnDischarge: formData.conditionOnDischarge,
      comorbidities: formData.comorbidities.map((c) => c.name),
      clinicalSummary: formData.clinicalSummary,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          frequency: m.dosage,
        })),
      labReports: formData.investigations
        .filter((inv) => inv.name.trim() !== "" && inv.report) // Only include if has name and report
        .map((i) => ({
          name: i.name,
          report: i.report,
          date: i.date || new Date().toISOString(),
        })),
      vitals: formData.vitals,
      notes: formData.notes,
    };

    try {
      await dispatch(saveDischargeData(dischargeData)).unwrap();
      toast({
        title: "Success",
        description: "Discharge data saved successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save discharge data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      selectedTest: suggestion.name,
      selectedCategory: suggestion.category,
    }));
  };

  const handleOpenLabReport = (investigation) => {
    // Check if this investigation matches any template
    const matchingTemplate = labTestsTemplate?.find(
      (template) =>
        template.name.toLowerCase() === investigation.name.toLowerCase()
    );

    if (matchingTemplate) {
      setSelectedTemplate(matchingTemplate);
    } else {
      setSelectedTemplate(null);
    }
    setSelectedInvestigation(investigation);

    setIsLabReportOpen(true);
  };

  const handleCloseLabReport = () => {
    setSelectedInvestigation(null);
    setSelectedTemplate(null);
    setIsLabReportOpen(false);
  };

  const handleSaveLabReport = (reportData) => {
    const updatedInvestigations = formData.investigations.map((inv) =>
      inv.name.toLowerCase() === selectedInvestigation.name.toLowerCase()
        ? {
            ...inv,
            name: reportData.name,
            report: reportData.report,
            date: reportData.date,
          }
        : inv
    );

    // If the investigation doesn't exist, add it to the list
    if (
      !updatedInvestigations.some(
        (inv) => inv.name.toLowerCase() === reportData.name.toLowerCase()
      )
    ) {
      updatedInvestigations.push({
        name: reportData.name,
        report: reportData.report,
        date: reportData.date,
      });
    }

    setFormData((prev) => ({
      ...prev,
      investigations: updatedInvestigations,
    }));

    // Update selectedInvestigation to show the new data immediately
    setSelectedInvestigation({
      name: reportData.name,
      report: reportData.report,
      date: reportData.date,
    });

    // Show success toast
    toast({
      title: "Success",
      description: "Lab report saved successfully",
      variant: "success",
    });

    handleCloseLabReport();
  };

  const handleMedicineAdviceChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicineAdvice: prev.medicineAdvice.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleMedicineAdviceSuggestionSelect = (index, suggestion) => {
    handleMedicineAdviceChange(index, "name", suggestion.name);
  };

  const addMedicineAdvice = () => {
    setFormData((prev) => ({
      ...prev,
      medicineAdvice: [
        ...prev.medicineAdvice,
        { name: "", dosage: "0-0-0", duration: "" },
      ],
    }));
  };

  const removeMedicineAdvice = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicineAdvice: prev.medicineAdvice.filter((_, i) => i !== index),
    }));
  };

  const handleVitalsChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [type]: {
          ...prev.vitals[type],
          [field]: value,
        },
      },
    }));
  };

  const getCategoryAndTypeForTest = (testName) => {
    for (const category of labCategories) {
      if (category.types.includes(testName)) {
        const type = testName;
        return { category: category.name.toLowerCase(), type };
      }
    }
    return {
      category: "other",
      type: testName.toLowerCase().replace(/\s+/g, "-"),
    };
  };

  const renderVitalsInputs = (type) => (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center">
        <span className="w-24">BP:</span>
        <Input
          placeholder="mmHg"
          value={formData.vitals[type].bloodPressure}
          onChange={(e) =>
            handleVitalsChange(type, "bloodPressure", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">HR:</span>
        <Input
          placeholder="bpm"
          type="number"
          value={formData.vitals[type].heartRate}
          onChange={(e) =>
            handleVitalsChange(type, "heartRate", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">Temp:</span>
        <Input
          placeholder="°C"
          type="number"
          value={formData.vitals[type].temperature}
          onChange={(e) =>
            handleVitalsChange(type, "temperature", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">SpO2:</span>
        <Input
          placeholder="%"
          type="number"
          value={formData.vitals[type].oxygenSaturation}
          onChange={(e) =>
            handleVitalsChange(type, "oxygenSaturation", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">RR:</span>
        <Input
          placeholder="breaths/min"
          type="number"
          value={formData.vitals[type].respiratoryRate}
          onChange={(e) =>
            handleVitalsChange(type, "respiratoryRate", e.target.value)
          }
          className="h-8"
        />
      </div>
    </div>
  );

  // Get the diagnosis template from the Redux store
  // Add a new state for custom diagnosis input
  const [customDiagnosis, setCustomDiagnosis] = useState("");

  // Add this state to track custom diagnoses
  const [customDiagnosesList, setCustomDiagnosesList] = useState([]);

  // Modify the handleAddDiagnosis function
  const handleAddDiagnosis = (diagnosis) => {
    if (!diagnosis.trim()) return;

    const currentDiagnoses = formData.diagnosis
      ? formData.diagnosis.split(", ")
      : [];

    // Add to custom diagnoses list if it's not in the template
    if (
      !diagnosisTemplate.includes(diagnosis) &&
      !customDiagnosesList.includes(diagnosis)
    ) {
      setCustomDiagnosesList((prev) => [...prev, diagnosis]);
    }

    if (currentDiagnoses.includes(diagnosis)) {
      setFormData((prev) => ({
        ...prev,
        diagnosis: prev.diagnosis
          .split(", ")
          .filter((d) => d !== diagnosis)
          .join(", "),
      }));
    } else {
      // Add the diagnosis if it's not selected
      setFormData((prev) => ({
        ...prev,
        diagnosis: prev.diagnosis
          ? `${prev.diagnosis}, ${diagnosis}`
          : diagnosis,
      }));
    }
    setCustomDiagnosis("");
  };

  // Add this new function to check for matches
  const getMatchingDiagnoses = (input) => {
    if (!input) return [];
    return diagnosisTemplate.filter((diagnosis) =>
      diagnosis.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  const handleDiagnosisChange = (newDiagnoses) => {
    const diagnosisString = newDiagnoses.map((d) => d.name).join(", ");
    setFormData((prev) => ({ ...prev, diagnosis: diagnosisString }));
  };

  const handleRemoveDiagnosis = (name) => {
    const currentDiagnoses = formData.diagnosis.split(", ");
    const updatedDiagnoses = currentDiagnoses
      .filter((d) => d !== name)
      .join(", ");
    setFormData((prev) => ({ ...prev, diagnosis: updatedDiagnoses }));
  };

  // if (!patient)
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       Loading...
  //     </div>
  //   );

  const renderTextArea = (name, label) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className="mt-1 min-h-[6rem] leading-tight"
      />
    </div>
  );

  // Add this function to handle registration search
  const handleRegistrationSearch = async () => {
    if (!patientInfo.registrationNumber) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(
        fetchRegistrationDetails({
          registrationNumber: patientInfo.registrationNumber,
          type: "IPD",
        })
      ).unwrap();

      if (result) {
        setPatient(result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  // Add this function near your other handler functions
  const handleBack = () => {
    navigate(-1); // This will go back to the previous page
  };

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A4;
           margin:20mm;
          
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .print-only {
          display: block !important;
        }
        .no-print {
          display: none !important;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
         padding:20px;
        }
      }
    `,
  });

  // Add this function to handle print confirmation
  const handlePrintConfirm = (shouldPrint) => {
    setIsPrintDialogOpen(false);
    if (shouldPrint) {
      handlePrint();
    }
    navigate("/patients/admitted");
  };

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 max-w-5xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground py-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 text-primary-foreground hover:text-primary hover:bg-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Discharge Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-secondary/10 rounded-lg p-3 mb-4">
            <h2 className="text-lg font-semibold mb-2 text-primary">
              Patient Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <Label htmlFor="name" className="w-24 font-bold">
                  Name:
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={patientInfo.name}
                  onChange={handlePatientInfoChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1">
                  <Label htmlFor="age" className="w-12 font-bold">
                    Age:
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    value={patientInfo.age}
                    onChange={handlePatientInfoChange}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center flex-1">
                  <Label htmlFor="gender" className="w-16 font-bold">
                    Gender:
                  </Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={patientInfo.gender}
                    onChange={handlePatientInfoChange}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <Label htmlFor="registrationNumber" className="w-24 font-bold">
                  UHID No:
                </Label>
                <div className="relative flex-1">
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={patientInfo.registrationNumber}
                    onChange={handlePatientInfoChange}
                    className="h-8 pr-8"
                  />
                  {(!patient || !patientInfo.name) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRegistrationSearch}
                      className="h-8 w-8 absolute right-0 top-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Label htmlFor="ipdNumber" className="w-24 font-bold">
                  IPD No:
                </Label>
                <div className="relative flex-1">
                  <Input
                    id="ipdNumber"
                    name="ipdNumber"
                    value={patientInfo.ipdNumber}
                    onChange={handlePatientInfoChange}
                    className="h-8 pr-8"
                  />
                  {(!patient || !patientInfo.name) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 absolute right-0 top-0"
                    ></Button>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Label htmlFor="contactNumber" className="w-24 font-bold">
                  Contact:
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={patientInfo.contactNumber}
                  onChange={handlePatientInfoChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="address" className="w-24 font-bold">
                  Address:
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={patientInfo.address}
                  onChange={handlePatientInfoChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="roomNumber" className="w-24 font-bold">
                  Room:
                </Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={patientInfo.roomNumber}
                  onChange={handlePatientInfoChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="admissionDate" className="w-24 font-bold">
                  Admit Date:
                </Label>
                <Input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="dateDischarged" className="w-24 font-bold">
                  Discharge Date:
                </Label>
                <Input
                  id="dateDischarged"
                  name="dateDischarged"
                  type="date"
                  value={formData.dateDischarged}
                  onChange={handleInputChange}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {formData.diagnosis &&
                      formData.diagnosis
                        .split(",")
                        .map((diagnosis) => diagnosis.trim())
                        .filter((diagnosis) => diagnosis)
                        .map((diagnosis, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded"
                          >
                            {diagnosis}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveDiagnosis(diagnosis)}
                            />
                          </Badge>
                        ))}
                  </div>
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={diagnosisTemplate?.map((name) => ({ name }))}
                      selectedValues={formData.diagnosis
                        .split(", ")
                        .map((d) => ({ name: d }))}
                      setSelectedValues={handleDiagnosisChange}
                      placeholder="Select diagnosis"
                    />
                  </div>
                </div>
              </div>
              <div>{renderTextArea("clinicalSummary", "Clinical Summary")}</div>

              <div>
                <Label htmlFor="comorbidities">Comorbidities</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {formData.comorbidities.map((val, index) => (
                      <Badge
                        key={index}
                        variant="primary"
                        className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded"
                      >
                        {val.name}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveSelected(val.name)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={comorbidities?.map((name) => ({ name }))}
                      selectedValues={formData.comorbidities}
                      setSelectedValues={handleComorbiditiesChange}
                      placeholder="Select comorbidities"
                    />
                    <Select
                      onValueChange={handleComorbidityHandlingChange}
                      defaultValue={formData.comorbidityHandling}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Handle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="separate">Separate</SelectItem>
                        <SelectItem value="clinical_summary">
                          Clinical Summary
                        </SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="admissionVitals">Admission Vitals</Label>
                {renderVitalsInputs("admission")}
              </div>

              <div>
                {renderTextArea(
                  "conditionOnAdmission",
                  "Condition on Admission"
                )}
              </div>

              <div>
                <Label htmlFor="investigations">Investigations</Label>
                <div className="space-y-2 mt-2">
                  {formData.investigations.map((investigation, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2"
                    >
                      <div className="sm:col-span-3">
                        <SearchSuggestion
                          suggestions={allLabTests}
                          placeholder="Select investigation"
                          value={investigation.name}
                          setValue={(value) =>
                            handleInvestigationChange(index, { name: value })
                          }
                          onSuggestionSelect={(suggestion) =>
                            handleInvestigationChange(index, suggestion)
                          }
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenLabReport(investigation)}
                          aria-label="Open Lab Report"
                          disabled={!investigation.name}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveInvestigation(index)}
                          disabled={formData.investigations.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={handleAddInvestigation}
                    variant="outline"
                    className="mt-2 font-semibold"
                    type="button"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Investigation
                  </Button>
                </div>
              </div>

              <div>{renderTextArea("treatment", "Treatment")}</div>

              <div>
                <Label htmlFor="dischargeVitals">Discharge Vitals</Label>
                {renderVitalsInputs("discharge")}
              </div>

              <div>
                {renderTextArea(
                  "conditionOnDischarge",
                  "Condition on Discharge"
                )}
              </div>

              <div>
                <Label htmlFor="medicineAdvice">Medicine/Advice</Label>
                <div className="space-y-2 mt-2">
                  {formData.medicineAdvice.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2"
                    >
                      <div
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <SearchSuggestion
                          suggestions={medicinelist?.map((item) => ({
                            name: item,
                          }))}
                          placeholder="Select medicine/advice"
                          value={item.name}
                          setValue={(value) =>
                            handleMedicineAdviceChange(index, "name", value)
                          }
                          onSuggestionSelect={(suggestion) =>
                            handleMedicineAdviceSuggestionSelect(
                              index,
                              suggestion
                            )
                          }
                        />
                      </div>
                      <Input
                        type="text"
                        placeholder="Dosage"
                        value={item.dosage}
                        onChange={(e) =>
                          handleMedicineAdviceChange(
                            index,
                            "dosage",
                            e.target.value
                          )
                        }
                        className="font-medium"
                        onKeyDown={(e) => {
                          // Prevent form submission on Enter key
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Duration"
                        value={item.duration}
                        onChange={(e) =>
                          handleMedicineAdviceChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        className="font-medium"
                        onKeyDown={(e) => {
                          // Prevent form submission on Enter key
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      />
                      <Button
                        type="button" // Add type="button" to prevent form submission
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMedicineAdvice(index)}
                        disabled={formData.medicineAdvice.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button" // Add type="button" to prevent form submission
                    onClick={addMedicineAdvice}
                    variant="outline"
                    className="mt-2 font-semibold"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Medicine/Advice
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  className="w-full sm:w-auto"
                >
                  Print
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  variant="outline"
                  disabled={savingStatus === "loading" || !patientId}
                  className="w-full sm:w-auto"
                >
                  {savingStatus === "loading" ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="submit"
                  disabled={dischargeStatus === "loading" || !patientId}
                  className="w-full sm:w-auto"
                >
                  {dischargeStatus === "loading"
                    ? "Discharging..."
                    : "Discharge"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lab Report Modal */}
      {isLabReportOpen && selectedInvestigation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 p-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Lab Report: {selectedInvestigation.name}
              </h2>
              <Button
                onClick={handleCloseLabReport}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {selectedTemplate ? (
              <TemplateLabReport
                template={selectedTemplate}
                patientData={patient}
                onClose={(reportData) => {
                  if (reportData) {
                    handleSaveLabReport(reportData);
                  } else {
                    handleCloseLabReport();
                  }
                }}
                searchWhere="ipd"
              />
            ) : (
              (() => {
                const { category, type } = getCategoryAndTypeForTest(
                  selectedInvestigation.name
                );
                return (
                  <CreateLabReport
                    category={category}
                    type={type}
                    patientData={patient}
                    formData={formData}
                    onClose={handleCloseLabReport}
                    onSave={handleSaveLabReport}
                    searchWhere="ipd"
                  />
                );
              })()
            )}
          </div>
        </div>
      )}
      <div style={{ display: "none" }}>
        <DischargeSummaryPDF
          ref={componentRef}
          formData={{
            ...formData,
            investigations: formData.investigations
              .filter((inv) => inv.name.trim() !== "" && inv.report)
              .map((inv) => ({
                name: inv.name,
                report: inv.report,
                date: inv.date || new Date().toISOString(),
              })),
          }}
          patient={patientInfo}
          hospital={hospital}
        />
      </div>

      {/* Print Confirmation Dialog */}
      {isPrintDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Print Confirmation</h2>
            <p className="mb-6">
              Would you like to print the discharge summary?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handlePrintConfirm(false)}
              >
                No
              </Button>
              <Button onClick={() => handlePrintConfirm(true)}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
