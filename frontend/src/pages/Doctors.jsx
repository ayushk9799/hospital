import { useState, useEffect, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import AppointmentsQueue from "../components/custom/appointments/AppointmentsQueue";
import AppointmentHeader from "../components/custom/appointments/AppointmentHeader";
import { Textarea } from "../components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { labCategories } from "../assets/Data";
import SearchSuggestion from "../components/custom/registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { fetchItems } from "../redux/slices/pharmacySlice";
import { savePrescription } from "../redux/slices/patientSlice";
import { useToast } from "../hooks/use-toast";

// Flatten the lab categories
const allLabTests = labCategories.flatMap((category) =>
  category.types.map((type) => ({ name: type }))
);

export default function Doctors() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    respiratoryRate: "",
    height: "",
    weight: "",
    oxygenSaturation: "",
  });
  const [prescription, setPrescription] = useState({ diagnosis: "", treatment: "", medications: [{ name: "", frequency: "0-0-0", duration: "" }], additionalInstructions: ""});
  const [labTests, setLabTests] = useState([{ name: "" }]);
  const [selectedVisitId, setSelectedVisitId] = useState(null);

  const dispatch = useDispatch();
  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const { toast } = useToast();

  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);

  const commonMedications = useMemo(() => {
    return medicines.map((item) => ({ name: item.name }));
  }, [medicines]);

  const handlePatientSelect = ({ ID, bookingNumber, patient, bookingDate, reasonForVisit, type, vitals, diagnosis, treatment, medications, additionalInstructions, labTests,}) => {
    setSelectedPatient(patient);
    setVitals({
      temperature: vitals.temperature || "",
      heartRate: vitals.heartRate || "",
      bloodPressure: vitals.bloodPressure || "",
      respiratoryRate: vitals.respiratoryRate || "",
      height: vitals.height || "",
      weight: vitals.weight || "",
      oxygenSaturation: vitals.oxygenSaturation || "",
    });
    setPrescription({
      diagnosis: diagnosis || "",
      treatment: treatment || "",
      medications:
        medications.length > 0
          ? medications
          : [{ name: "", frequency: "0-0-0", duration: "" }],
      additionalInstructions: additionalInstructions || "",
    });
    setLabTests(labTests.length > 0 ? labTests.map((test) => ({ name: test })) : [{ name: "" }]);
    setSelectedPatientType(type);
    setSelectedVisitId(ID);
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => {
      const newVitals = { ...prev, [name]: value };
      // Calculate BMI if both height and weight are present
      if (name === "height" || name === "weight") {
        if (newVitals.height && newVitals.weight) {
          const heightInMeters = newVitals.height / 100;
          const bmi = (newVitals.weight /(heightInMeters * heightInMeters)).toFixed(1);
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

  const handleSavePrescription = async () => {
    if (!selectedVisitId) {
      toast({
        title: "Error",
        description: "No visit selected!",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(savePrescription({selectedVisitId, vitals, prescription,selectedPatientType, labTests: labTests.map((test) => test.name),})).unwrap();
      toast({
        title: "Success",
        description: "Prescription, vitals, and lab tests saved successfully!",
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
    <div className="h-full w-full flex flex-col">
      <AppointmentHeader />
      <div className="grid grid-cols-4 gap-2" style={{ height: "calc(100vh - 100px)" }}>
        <ScrollArea className="col-span-1 h-full">
          <AppointmentsQueue onPatientSelect={handlePatientSelect} />
        </ScrollArea>
        <ScrollArea className="col-span-3 h-full">
          <div className="flex-1 p-2 overflow-auto">
            {selectedPatient ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-2">Prescription for: {selectedPatient.name} (P{selectedPatient._id.slice(-4)})</h2>
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">Vitals</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor="temperature" className="text-xs font-semibold"> Temperature (°C)</Label>
                      <Input id="temperature" name="temperature" value={vitals.temperature} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
                    </div>
                    <div>
                      <Label htmlFor="heartRate" className="text-xs font-semibold"> Heart Rate (bpm)</Label>
                      <Input  id="heartRate"  name="heartRate"  value={vitals.heartRate}  onChange={handleVitalChange}  className="h-8 text-sm font-medium"/>
                    </div>
                    <div>
                      <Label htmlFor="bloodPressure" className="text-xs font-semibold"> Blood Pressure (mmHg)</Label>
                      <Input id="bloodPressure" name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
                    </div>
                    <div>
                      <Label htmlFor="respiratoryRate" className="text-xs font-semibold"> Respiratory Rate (bpm)</Label>
                      <Input id="respiratoryRate" name="respiratoryRate" value={vitals.respiratoryRate} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-xs font-semibold"> Height (cm)</Label>
                      <Input id="height" name="height" value={vitals.height} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-xs font-semibold"> Weight (kg)</Label>
                      <Input id="weight" name="weight" value={vitals.weight} onChange={handleVitalChange} className="h-8 text-sm font-medium" />
                    </div>
                    <div>
                      <Label htmlFor="bmi" className="text-xs font-semibold"> BMI</Label>
                      <Input id="bmi" name="bmi" value={vitals.bmi} readOnly className="h-8 text-sm font-medium bg-gray-100" />
                    </div>
                    <div>
                      <Label htmlFor="oxygenSaturation" className="text-xs font-semibold"> O₂ Saturation (%)</Label>
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
                        <SearchSuggestion suggestions={commonMedications} placeholder="Select medicine" value={medication.name} setValue={(value) => handleMedicationChange(index, "name", value)} onSuggestionSelect={(suggestion) => handleMedicationSuggestionSelect(index, suggestion)} />
                        <Input placeholder="0-0-0" value={medication.frequency} onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)} className="font-medium" />
                        <Input placeholder="Duration" value={medication.duration} onChange={(e) => handleMedicationChange(index, "duration", e.target.value)} className="font-medium" />
                        <Button variant="destructive" size="icon" onClick={() => removeMedication(index)} disabled={prescription.medications.length === 1}>
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
                      <SearchSuggestion suggestions={allLabTests} placeholder="Select lab test" value={test.name} setValue={(value) => handleLabTestChange(index, { name: value })} onSuggestionSelect={(suggestion) => handleLabTestChange(index, suggestion)} />
                      <Button variant="destructive" size="icon" onClick={() => removeLabTest(index)} disabled={labTests.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addLabTest} variant="outline" className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Lab Test
                  </Button>
                </div>
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">Additional Instructions</h3>
                  <Textarea id="additionalInstructions" name="additionalInstructions" value={prescription.additionalInstructions} onChange={handlePrescriptionChange} placeholder="Any additional instructions or notes" className="min-h-[100px] text-sm font-medium" />
                </div>
                <Button className="w-full font-semibold" onClick={handleSavePrescription}>Save Prescription, Vitals, and Lab Tests</Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-gray-500 font-semibold">
                  Select a patient to write a prescription
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
