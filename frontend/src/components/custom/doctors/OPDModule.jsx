import { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import { Textarea } from "../../ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { labCategories } from "../../../assets/Data";
import SearchSuggestion from "../registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { fetchItems } from "../../../redux/slices/pharmacySlice";
import { savePrescription } from "../../../redux/slices/patientSlice";
import { useToast } from "../../../hooks/use-toast";
import { PDFViewer } from "@react-pdf/renderer";
import OPDPrescriptionPDF from "../reports/OPDPrescriptionPDF";
import { comorbodities } from "../../../assets/Data";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import MultiSelectInput from "../MultiSelectInput";

// Flatten the lab categories
const allLabTests = labCategories.flatMap((category) =>
  category.types.map((type) => ({ name: type }))
);

export default function OPDModule({ patient }) {
  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    respiratoryRate: "",
    height: "",
    weight: "",
    oxygenSaturation: "",
  });
  const [prescription, setPrescription] = useState({
    diagnosis: "",
    treatment: "",
    medications: [{ name: "", frequency: "0-0-0", duration: "" }],
    additionalInstructions: "",
  });
  const [labTests, setLabTests] = useState([{ name: "" }]);

  const dispatch = useDispatch();
  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const { toast } = useToast();

  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const [selectedComorbidities, setSelectedComorbidities] = useState(
    patient.comorbidities?.map(comorbidity => ({ name: comorbidity })) || []
  );

  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);

  useEffect(() => {
    // Initialize state with patient data if available
    if (patient) {
      setVitals({
        temperature: patient.vitals?.temperature || "",
        heartRate: patient.vitals?.heartRate || "",
        bloodPressure: patient.vitals?.bloodPressure || "",
        respiratoryRate: patient.vitals?.respiratoryRate || "",
        height: patient.vitals?.height || "",
        weight: patient.vitals?.weight || "",
        oxygenSaturation: patient.vitals?.oxygenSaturation || "",
      });
      setPrescription({
        diagnosis: patient.diagnosis || "",
        treatment: patient.treatment || "",
        medications: patient.medications?.length > 0
          ? patient.medications
          : [{ name: "", frequency: "0-0-0", duration: "" }],
        additionalInstructions: patient.additionalInstructions || "",
      });
      setLabTests(patient.labTests?.length > 0
        ? patient.labTests.map((test) => ({ name: test }))
        : [{ name: "" }]
      );
    }
  }, [patient]);

  const commonMedications = useMemo(() => {
    return medicines.map((item) => ({ name: item.name }));
  }, [medicines]);

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => {
      const newVitals = { ...prev, [name]: value };
      // Calculate BMI if both height and weight are present
      if (name === "height" || name === "weight") {
        if (newVitals.height && newVitals.weight) {
          const heightInMeters = newVitals.height / 100;
          const bmi = (newVitals.weight / (heightInMeters * heightInMeters)).toFixed(1);
          newVitals.bmi = bmi;
        }
      }
      return newVitals;
    });
  };

  const handlePrescriptionChange = (e) => {
    setPrescription({ ...prescription, [e.target.name]: e.target.value });
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...prescription.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setPrescription({ ...prescription, medications: newMedications });
  };

  const handleMedicationSuggestionSelect = (index, suggestion) => {
    handleMedicationChange(index, "name", suggestion.name);
  };

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { name: "", frequency: "0-0-0", duration: "" },
      ],
    });
  };

  const removeMedication = (index) => {
    const newMedications = prescription.medications.filter(
      (_, i) => i !== index
    );
    setPrescription({ ...prescription, medications: newMedications });
  };

  const handleLabTestChange = (index, suggestion) => {
    const newLabTests = [...labTests];
    newLabTests[index] = suggestion;
    setLabTests(newLabTests);
  };

  const addLabTest = () => {
    setLabTests([...labTests, { name: "" }]);
  };

  const removeLabTest = (index) => {
    const newLabTests = labTests.filter((_, i) => i !== index);
    setLabTests(newLabTests);
  };

  const handleComorbiditiesChange = (newComorbidities) => {
    setSelectedComorbidities(newComorbidities);
  };

  const handleRemoveComorbidity = (name) => {
    setSelectedComorbidities(selectedComorbidities.filter(c => c.name !== name));
  };

  const handleSavePrescription = async () => {
    if (!patient.ID) {
      toast({
        title: "Error",
        description: "No visit selected!",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(savePrescription({
        selectedVisitId: patient.ID,
        vitals,
        prescription,
        selectedPatientType: "OPD",
        labTests: labTests.map((test) => test.name),
        comorbidities: selectedComorbidities.map(c => c.name), // Update this line
      })).unwrap();

      toast({
        variant: "success",
        title: "Added Successfully!",
        description: "Prescription, vitals, lab tests, and comorbidities saved successfully!",
      });
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Prescription for: {patient.patient.name} (P{patient.patient._id.slice(-4)})</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Vitals</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label htmlFor="temperature" className="text-xs font-semibold">Temperature (°C)</Label>
              <Input id="temperature" name="temperature" value={vitals.temperature} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="heartRate" className="text-xs font-semibold">Heart Rate (bpm)</Label>
              <Input id="heartRate" name="heartRate" value={vitals.heartRate} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="bloodPressure" className="text-xs font-semibold">Blood Pressure (mmHg)</Label>
              <Input id="bloodPressure" name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="respiratoryRate" className="text-xs font-semibold">Respiratory Rate (bpm)</Label>
              <Input id="respiratoryRate" name="respiratoryRate" value={vitals.respiratoryRate} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs font-semibold">Height (cm)</Label>
              <Input id="height" name="height" value={vitals.height} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="weight" className="text-xs font-semibold">Weight (kg)</Label>
              <Input id="weight" name="weight" value={vitals.weight} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
            <div>
              <Label htmlFor="bmi" className="text-xs font-semibold">BMI</Label>
              <Input id="bmi" name="bmi" value={vitals.bmi} readOnly className="h-8 text-sm font-medium bg-gray-100" />
            </div>
            <div>
              <Label htmlFor="oxygenSaturation" className="text-xs font-semibold">O₂ Saturation (%)</Label>
              <Input id="oxygenSaturation" name="oxygenSaturation" value={vitals.oxygenSaturation} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Diagnosis, Treatment, and Medications</h3>
          <div>
            <Label htmlFor="diagnosis" className="text-xs font-semibold">Diagnosis</Label>
            <Textarea id="diagnosis" name="diagnosis" value={prescription.diagnosis} onChange={handlePrescriptionChange} placeholder="Enter patient's diagnosis" className="min-h-[100px] text-sm font-medium" />
          </div>
          <div>
            <Label htmlFor="treatment" className="text-xs font-semibold">Treatment</Label>
            <Textarea id="treatment" name="treatment" value={prescription.treatment} onChange={handlePrescriptionChange} placeholder="Enter recommended treatment" className="min-h-[100px] text-sm font-medium" />
          </div>
          <div>
            <Label className="font-semibold">Medications</Label>
            {prescription.medications?.map((medication, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <SearchSuggestion
                  suggestions={commonMedications}
                  placeholder="Select medicine"
                  value={medication.name}
                  setValue={(value) => handleMedicationChange(index, "name", value)}
                  onSuggestionSelect={(suggestion) => handleMedicationSuggestionSelect(index, suggestion)}
                />
                <Input
                  placeholder="0-0-0"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                  className="font-medium"
                />
                <Input
                  placeholder="Duration"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                  className="font-medium"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeMedication(index)}
                  disabled={prescription.medications.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addMedication} variant="outline" className="mt-2 font-semibold">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Medication
            </Button>
          </div>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Recommended Lab Tests</h3>
          {labTests.map((test, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <SearchSuggestion
                suggestions={allLabTests}
                placeholder="Select lab test"
                value={test.name}
                setValue={(value) => handleLabTestChange(index, { name: value })}
                onSuggestionSelect={(suggestion) => handleLabTestChange(index, suggestion)}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeLabTest(index)}
                disabled={labTests.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addLabTest} variant="outline" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Lab Test
          </Button>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Comorbidities</h3>
          <div className="mt-1 space-y-2">
            <div className="flex flex-wrap gap-1">
              {selectedComorbidities.map((comorbidity, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded"
                >
                  {comorbidity.name}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveComorbidity(comorbidity.name)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <MultiSelectInput
                suggestions={comorbodities.map(name => ({ name }))}
                selectedValues={selectedComorbidities}
                setSelectedValues={handleComorbiditiesChange}
                placeholder="Select comorbidities"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Additional Instructions</h3>
          <Textarea
            id="additionalInstructions"
            name="additionalInstructions"
            value={prescription.additionalInstructions}
            onChange={handlePrescriptionChange}
            placeholder="Any additional instructions or notes"
            className="min-h-[100px] text-sm font-medium"
          />
        </div>
        <div className="flex justify-between mt-4">
          <Button className="font-semibold" onClick={handleSavePrescription}>
            Save Prescription, Vitals, Lab Tests, and Comorbidities
          </Button>
          <Button className="font-semibold" onClick={() => setShowPDFPreview(true)}>
            Preview PDF
          </Button>
        </div>
      </ScrollArea>
      {showPDFPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[850px] h-[90vh] p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                OPD Prescription Preview
              </h2>
              <Button
                onClick={() => setShowPDFPreview(false)}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <PDFViewer width="100%" height="90%">
              <OPDPrescriptionPDF
                patient={patient.patient}
                vitals={vitals}
                prescription={prescription}
                labTests={labTests}
                selectedComorbidities={selectedComorbidities}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}