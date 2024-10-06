import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import MultiSelectInput from "../components/custom/MultiSelectInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { labCategories, labReportFields } from "../assets/Data";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import CreateLabReport from "../pages/CreateLabReport"; // Importing CreateLabReport component
import { PDFViewer } from "@react-pdf/renderer";
import DischargeSummaryPDF from "../components/custom/reports/DischargeSummaryPDF";

const comorbiditiesList = [
  "Hypertension",
  "Diabetes mellitus",
  "Obesity",
  "COPD",
  "Asthma",
  "Coronary artery disease",
  "Congestive heart failure",
  "Chronic kidney disease",
  "Osteoarthritis",
  "Rheumatoid arthritis",
  "Depression",
  "Anxiety disorders",
  "Hypothyroidism",
  "Hyperlipidemia",
  "GERD",
  "Sleep apnea",
  "Osteoporosis",
  "Chronic liver disease",
  "Anemia",
  "Atrial fibrillation",
].map((name) => ({ name }));

export default function DischargeSummary() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const patient = useSelector((state) =>
    state.patients.patientlist.find((p) => p._id === patientId)
  );
  console.log(patient);
  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);

  const [formData, setFormData] = useState({
    admissionDate: "",
    dateDischarged: "",
    diagnosis: "",
    clinicalSummary: "",
    treatment: "",
    conditionOnAdmission: "",
    conditionOnDischarge: "",
    investigations: [{ name: "", category: "" }],
    medicineAdvice: [{ name: "", dosage: "", duration: "" }],
    notes: "",
    comorbidities: [{name:""}],
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
  console.log(formData.investigations);

  const [isLabReportOpen, setIsLabReportOpen] = useState(false); // State to manage modal visibility
  const [selectedInvestigation, setSelectedInvestigation] = useState(null); // State to track selected investigation
  const [medicineAdvice, setMedicineAdvice] = useState([
    { name: "", dosage: "0-0-0", duration: "" },
  ]);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    roomNumber: "",
  });
  useEffect(() => {
    if (patient) {
      setFormData((prevData) => ({
        ...prevData,
        admissionDate: patient.bookingDate ? new Date(patient.bookingDate).toISOString().split('T')[0] : "",
        dateDischarged: patient.dateDischarged || "",
        diagnosis: patient.diagnosis || "",
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
        investigations: patient.labReports || [{ name: "", category: "" }],
        medicineAdvice: patient.medicineAdvice || [
          { name: "", dosage: "", duration: "" },
        ],
        notes: patient.notes || "",
        comorbidities: patient.comorbidities?.map((comorbidity) => ({ name: comorbidity })) || [{name:""}],
      }));

      setPatientInfo({
        name: patient.patient.name || "",
        age: patient.patient.age || "",
        gender: patient.patient.gender || "",
        contactNumber: patient.patient.contactNumber || "",
        address: patient.patient.address || "",
        roomNumber: patient.assignedRoom?.roomNumber || "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleInvestigationChange = (index, field, suggestion) => {
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
      investigations: [...prev.investigations, { name: "" }],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch action to update patient discharge info
    // navigate("/patients");
  };

  const handleTestSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      selectedTest: suggestion.name,
      selectedCategory: suggestion.category,
    }));
  };

  const handleOpenLabReport = (report) => {
    setSelectedReport(report);
    setIsLabReportOpen(true);
  };

  const handleCloseLabReport = () => {
    setSelectedReport(null);
    setIsLabReportOpen(false);
  };

  const handleMedicineAdviceChange = (index, field, value) => {
    const newMedicineAdvice = [...medicineAdvice];
    newMedicineAdvice[index] = { ...newMedicineAdvice[index], [field]: value };
    setMedicineAdvice(newMedicineAdvice);
  };

  const handleMedicineAdviceSuggestionSelect = (index, suggestion) => {
    handleMedicineAdviceChange(index, "name", suggestion.name);
  };

  const addMedicineAdvice = () => {
    setMedicineAdvice([
      ...medicineAdvice,
      { name: "", dosage: "0-0-0", duration: "" },
    ]);
  };

  const removeMedicineAdvice = (index) => {
    const newMedicineAdvice = medicineAdvice.filter((_, i) => i !== index);
    setMedicineAdvice(newMedicineAdvice);
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

  const handlePreviewPDF = () => {
    setIsPdfPreviewOpen(true);
  };

  const handleClosePdfPreview = () => {
    setIsPdfPreviewOpen(false);
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

  if (!patient)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  const renderTextArea = (name, label) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        required
        className="mt-1 min-h-[6rem] leading-tight"
      />
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 max-w-5xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground py-2">
          <CardTitle className="text-xl">Discharge Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-secondary/10 rounded-lg p-3 mb-4">
            <h2 className="text-lg font-semibold mb-2 text-primary">
              Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
              <div className="flex items-center">
                <Label htmlFor="age" className="w-24 font-bold">
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
              <div className="flex items-center">
                <Label htmlFor="gender" className="w-24 font-bold">
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
              <div>{renderTextArea("diagnosis", "Diagnosis")}</div>
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
                      suggestions={comorbiditiesList}
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
                  {patient.labReports?.map((report, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1/2 flex items-center space-x-2">
                        <Input
                          value={report.name.toUpperCase()}
                          readOnly
                          className="flex-grow"
                        />
                        <span className="text-sm text-gray-500">
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenLabReport(report)}
                        aria-label="Open Lab Report"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
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
                  {medicineAdvice.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                      <SearchSuggestion
                        suggestions={medicines.map((item) => ({
                          name: item.name,
                        }))} // Add your medicine suggestions here
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
                      <Input
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
                      />
                      <Input
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
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMedicineAdvice(index)}
                        disabled={medicineAdvice.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addMedicineAdvice}
                    variant="outline"
                    className="mt-2 font-semibold"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Medicine/Advice
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button type="button" onClick={handlePreviewPDF}>
                  Preview Discharge Summary
                </Button>
                <Button type="submit">Submit Discharge Summary</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lab Report Modal */}
      {isLabReportOpen && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 p-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Lab Report: {selectedReport.name}
              </h2>
              <Button
                onClick={handleCloseLabReport}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Test</th>
                  <th className="border p-2 text-left">Result</th>
                  <th className="border p-2 text-left">Unit</th>
                  <th className="border p-2 text-left">Normal Range</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(selectedReport.report).map(([key, value]) => {
                  // Skip rendering if value is null or an empty string
                  if (value.value === null || value.value === "") return null;
                  
                  return (
                    <tr key={key} className="border-b">
                      <td className="border p-2 font-semibold">{value.label}</td>
                      <td className="border p-2">{value.value}</td>
                      <td className="border p-2">{value.unit}</td>
                      <td className="border p-2">{value.normalRange}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isPdfPreviewOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 h-5/6 p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Discharge Summary Preview
              </h2>
              <Button
                onClick={handleClosePdfPreview}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <PDFViewer width="100%" height="90%">
              <DischargeSummaryPDF formData={formData} patient={patientInfo} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}