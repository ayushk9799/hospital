import React, { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useDispatch } from "react-redux";
import { fetchItems } from "../redux/slices/pharmacySlice";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { X, CalendarIcon, ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import MultiSelectInput from "../components/custom/MultiSelectInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { labCategories, labReportFields } from "../assets/Data";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import CreateLabReport from "../pages/CreateLabReport"; // Importing CreateLabReport component

const comorbiditiesList = [
  "Hypertension", "Diabetes mellitus", "Obesity", "COPD", "Asthma",
  "Coronary artery disease", "Congestive heart failure", "Chronic kidney disease",
  "Osteoarthritis", "Rheumatoid arthritis", "Depression", "Anxiety disorders",
  "Hypothyroidism", "Hyperlipidemia", "GERD", "Sleep apnea", "Osteoporosis",
  "Chronic liver disease", "Anemia", "Atrial fibrillation"
].map(name => ({ name }));

export default function DischargeSummary() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const patient = useSelector((state) => state.patients.patientlist.find((p) => p._id === patientId));
const medicines = useSelector((state) => state.pharmacy.items);
const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
useEffect(() => {
  if (itemsStatus === "idle") {
    dispatch(fetchItems());
  }
}, [dispatch,itemsStatus]);
  const [formData, setFormData] = useState({
    admissionDate: patient?.admissionDate || "",
    dateDischarged: patient?.dateDischarged || "",
    diagnosis: patient?.diagnosis || "",
    clinicalSummary: patient?.clinicalSummary || "",
    treatment: patient?.treatment || "",
    conditionOnAdmission: patient?.conditionOnAdmission || "",
    conditionOnDischarge: patient?.conditionOnDischarge || "",
    investigations: patient?.investigations || [{ name: "", category: "" }],
    medicineAdvice: patient?.medicineAdvice || [{ name: "", dosage: "", duration: "" }],
    notes: patient?.notes || "",
    comorbidities: patient?.comorbidities || [],
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
      }
    },
  });
  console.log(formData.investigations)

  const [isLabReportOpen, setIsLabReportOpen] = useState(false); // State to manage modal visibility
  const [selectedInvestigation, setSelectedInvestigation] = useState(null); // State to track selected investigation
  const [medicineAdvice, setMedicineAdvice] = useState([
    { name: "", dosage: "0-0-0", duration: "" }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleInvestigationChange = (index, field, suggestion) => {
    const updatedInvestigations = [...formData.investigations];
   
      updatedInvestigations[index] = { name: suggestion.name, category: suggestion.category||"" };
  
    setFormData(prev => ({ ...prev, investigations: updatedInvestigations }));
  };

  const handleAddInvestigation = () => {
    setFormData(prev => ({
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

  const handleOpenLabReport = (investigation) => {
    console.log(investigation)
    setSelectedInvestigation(investigation);
    setIsLabReportOpen(true);
  };

  const handleCloseLabReport = () => {
    setSelectedInvestigation(null);
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
    setMedicineAdvice([...medicineAdvice, { name: "", dosage: "0-0-0", duration: "" }]);
  };

  const removeMedicineAdvice = (index) => {
    const newMedicineAdvice = medicineAdvice.filter((_, i) => i !== index);
    setMedicineAdvice(newMedicineAdvice);
  };

  const handleVitalsChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [type]: {
          ...prev.vitals[type],
          [field]: value
        }
      }
    }));
  };

  const renderVitalsInputs = (type) => (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center">
        <span className="w-24">BP:</span>
        <Input
          placeholder="mmHg"
          value={formData.vitals[type].bloodPressure}
          onChange={(e) => handleVitalsChange(type, 'bloodPressure', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">HR:</span>
        <Input
          placeholder="bpm"
          type="number"
          value={formData.vitals[type].heartRate}
          onChange={(e) => handleVitalsChange(type, 'heartRate', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">Temp:</span>
        <Input
          placeholder="°C"
          type="number"
          value={formData.vitals[type].temperature}
          onChange={(e) => handleVitalsChange(type, 'temperature', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">SpO2:</span>
        <Input
          placeholder="%"
          type="number"
          value={formData.vitals[type].oxygenSaturation}
          onChange={(e) => handleVitalsChange(type, 'oxygenSaturation', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">RR:</span>
        <Input
          placeholder="breaths/min"
          type="number"
          value={formData.vitals[type].respiratoryRate}
          onChange={(e) => handleVitalsChange(type, 'respiratoryRate', e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );

  if (!patient) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const renderDatePicker = (field, label) => (
    <div className="flex items-center">
      <p className="mr-2"><strong>{label}:</strong></p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`w-full justify-start text-left font-normal ${!formData[field] && "text-muted-foreground"}`}>
            {formData[field] ? format(new Date(formData[field]), "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={formData[field] ? new Date(formData[field]) : undefined}
            onSelect={(date) => handleDateChange(field, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 bg-secondary/10 rounded-lg p-3">
              <h2 className="text-lg font-semibold mb-2 text-primary">Patient Information</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Name:</strong> {patient.patient.name}</p>
                <p><strong>Age:</strong> {patient.patient.age}</p>
                <p><strong>Gender:</strong> {patient.patient.gender}</p>
                <p><strong>Contact:</strong> {patient.patient.contactNumber}</p>
                <p><strong>Address:</strong> {patient.patient.address}</p>
                <p><strong>Room:</strong> {patient?.assignedRoom?.roomNumber}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              {renderDatePicker("admissionDate", "Admit Date")}
              {renderDatePicker("dateDischarged", "Discharge Date")}
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
                      <Badge key={index} variant="primary" className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded">
                        {val.name}
                        <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveSelected(val.name)} />
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
                    <Select onValueChange={handleComorbidityHandlingChange} defaultValue={formData.comorbidityHandling}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Handle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="separate">Separate</SelectItem>
                        <SelectItem value="clinical_summary">Clinical Summary</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="admissionVitals">Admission Vitals</Label>
                {renderVitalsInputs('admission')}
              </div>

              <div>{renderTextArea("conditionOnAdmission", "Condition on Admission")}</div>

              <div>
                <Label htmlFor="investigations">Investigations</Label>
                <div className="space-y-2 mt-2">
                  {formData.investigations?.map((inv, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <SearchSuggestion
                        suggestions={labCategories.flatMap(category => 
                          category.types.map(type => ({ name: type, category: category.name }))
                        )}
                        placeholder="Select or type investigation name"
                        value={inv.name}
                        setValue={(suggestion) => handleInvestigationChange(index, 'name', suggestion)}
                        onSuggestionSelect={(suggestion) => handleInvestigationChange(index, 'name', suggestion)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenLabReport(inv)}
                        aria-label="Open Lab Report Form"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddInvestigation} variant="outline" size="sm">
                    Add Investigation
                  </Button>
                </div>
              </div>

              <div>{renderTextArea("treatment", "Treatment")}</div>

              <div>
                <Label htmlFor="dischargeVitals">Discharge Vitals</Label>
                {renderVitalsInputs('discharge')}
              </div>

              <div>{renderTextArea("conditionOnDischarge", "Condition on Discharge")}</div>

              {renderTextArea("notes", "Additional Notes")}

              <div>
                <Label htmlFor="medicineAdvice">Medicine/Advice</Label>
                <div className="space-y-2 mt-2">
                  {medicineAdvice.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                      <SearchSuggestion
                        suggestions={medicines.map(item => ({ name: item.name }))} // Add your medicine suggestions here
                        placeholder="Select medicine/advice"
                        value={item.name}
                        setValue={(value) => handleMedicineAdviceChange(index, "name", value)}
                        onSuggestionSelect={(suggestion) => handleMedicineAdviceSuggestionSelect(index, suggestion)}
                      />
                      <Input
                        placeholder="Dosage"
                        value={item.dosage}
                        onChange={(e) => handleMedicineAdviceChange(index, "dosage", e.target.value)}
                        className="font-medium"
                      />
                      <Input
                        placeholder="Duration"
                        value={item.duration}
                        onChange={(e) => handleMedicineAdviceChange(index, "duration", e.target.value)}
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
                  <Button onClick={addMedicineAdvice} variant="outline" className="mt-2 font-semibold">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Medicine/Advice
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit">Submit Discharge Summary</Button>
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
              <h2 className="text-lg font-semibold">Create Lab Report for {selectedInvestigation.name}</h2>
              <Button onClick={handleCloseLabReport} variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CreateLabReport
              category={selectedInvestigation.category.toLowerCase()}
              type={selectedInvestigation.name.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-")}
              patientData={patient}
              onClose={handleCloseLabReport}
            />
          </div>
        </div>
      )}
    </div>
  );
}
