import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import AppointmentsQueue from "../components/custom/appointments/AppointmentsQueue";
import AppointmentHeader from "../components/custom/appointments/AppointmentHeader";
import AppointmentsBody from "../components/custom/appointments/AppointmentsBody";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { PlusCircle, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

// Mock data for patients
const patients = [
  { id: 1, name: "John Doe", age: 45, gender: "Male" },
  { id: 2, name: "Jane Smith", age: 32, gender: "Female" },
  { id: 3, name: "Bob Johnson", age: 58, gender: "Male" },
  { id: 4, name: "Alice Brown", age: 27, gender: "Female" },
  { id: 5, name: "Charlie Davis", age: 41, gender: "Male" },
];

// Common medications list
const commonMedications = [
  { value: "paracetamol", label: "Paracetamol" },
  { value: "ibuprofen", label: "Ibuprofen" },
  { value: "aspirin", label: "Aspirin" },
  { value: "amoxicillin", label: "Amoxicillin" },
  { value: "omeprazole", label: "Omeprazole" },
];

export default function Doctors() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    respiratoryRate: "",
    height: "",
    weight: "",
    bmi: "",
    oxygenSaturation: "",
  });
  const [prescription, setPrescription] = useState({
    diagnosis: "",
    medications: [{ name: "", frequency: "0-0-0", duration: "" }],
    additionalInstructions: "",
  });
  const [labTests, setLabTests] = useState([""]); // New state for lab tests

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setVitals({
      temperature: "",
      heartRate: "",
      bloodPressure: "",
      respiratoryRate: "",
      height: "",
      weight: "",
      bmi: "",
      oxygenSaturation: "",
    });
    setPrescription({
      diagnosis: "",
      medications: [{ name: "", frequency: "0-0-0", duration: "" }],
      additionalInstructions: "",
    });
    setLabTests([""]); // Reset lab tests when selecting a new patient
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => {
      const newVitals = { ...prev, [name]: value };
      // Calculate BMI if both height and weight are present
      if (name === 'height' || name === 'weight') {
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

  const handleLabTestChange = (index, value) => {
    const newLabTests = [...labTests];
    newLabTests[index] = value;
    setLabTests(newLabTests);
  };

  const addLabTest = () => {
    setLabTests([...labTests, ""]);
  };

  const removeLabTest = (index) => {
    const newLabTests = labTests.filter((_, i) => i !== index);
    setLabTests(newLabTests);
  };

  const handleSavePrescription = () => {
    console.log(
      "Saving prescription, vitals, and lab tests for patient:",
      selectedPatient?.id,
      { prescription, vitals, labTests }
    );
    alert("Prescription, vitals, and lab tests saved successfully!");
  };

  return (   <div className="h-full w-full flex flex-col">
    <AppointmentHeader />
  <div className="grid grid-cols-4 gap-4" style={{ height: 'calc(100vh - 110px)' }}>
    <ScrollArea className="col-span-1 h-full"> 
      <AppointmentsQueue onPatientSelect={handlePatientSelect} />
    </ScrollArea>
    <ScrollArea className="col-span-3 h-full">
    <div className="flex-1 p-6 overflow-auto">
        {selectedPatient ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">
              Prescription for: {selectedPatient.name} ({selectedPatient.id})
            </h2>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Vitals</h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="temperature" className="text-xs font-semibold">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    value={vitals.temperature}
                    onChange={handleVitalChange}
                    placeholder="36.5"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate" className="text-xs font-semibold">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    name="heartRate"
                    value={vitals.heartRate}
                    onChange={handleVitalChange}
                    placeholder="70"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodPressure" className="text-xs font-semibold">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    name="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={handleVitalChange}
                    placeholder="120/80"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="respiratoryRate" className="text-xs font-semibold">Respiratory Rate (bpm)</Label>
                  <Input
                    id="respiratoryRate"
                    name="respiratoryRate"
                    value={vitals.respiratoryRate}
                    onChange={handleVitalChange}
                    placeholder="12"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs font-semibold">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    value={vitals.height}
                    onChange={handleVitalChange}
                    placeholder="170"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-xs font-semibold">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    value={vitals.weight}
                    onChange={handleVitalChange}
                    placeholder="70"
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="bmi" className="text-xs font-semibold">BMI</Label>
                  <Input
                    id="bmi"
                    name="bmi"
                    value={vitals.bmi}
                    readOnly
                    placeholder="Calculated"
                    className="h-8 text-sm font-medium bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="oxygenSaturation" className="text-xs font-semibold">O₂ Saturation (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    name="oxygenSaturation"
                    value={vitals.oxygenSaturation}
                    onChange={handleVitalChange}
                    placeholder="98"
                    className="h-8 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">
                Diagnosis and Medications
              </h3>
              <div>
                <Label htmlFor="diagnosis" className="font-semibold">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={prescription.diagnosis}
                  onChange={handlePrescriptionChange}
                  placeholder="Enter patient's diagnosis"
                  className="min-h-[100px] text-sm font-medium"
                />
              </div>
              <div>
                <Label className="font-semibold">Medications</Label>
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !medication.name && "text-muted-foreground"
                          )}
                        >
                          {medication.name || "Select medicine"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <Input
                            placeholder="Type a command or search..."
                            type="text"
                            value={prescription.medications[index].name}
                            onChange={(e)=>{handleMedicationChange(index, "name", e.target.value)}}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                          />
                          <CommandList>
                            <CommandEmpty>No medicine found.</CommandEmpty>
                            <CommandGroup>
                              {commonMedications.map((med) => (
                                <CommandItem
                                  key={med.value}
                                  onSelect={() => {
                                    handleMedicationChange(
                                      index,
                                      "name",
                                      med.label
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      medication.name === med.label
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {med.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      placeholder="0-0-0"
                      value={medication.frequency}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      className="font-medium"
                    />
                    <Input
                      placeholder="Duration"
                      value={medication.duration}
                      onChange={(e) =>
                        handleMedicationChange(
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
                      onClick={() => removeMedication(index)}
                      disabled={prescription.medications.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addMedication}
                  variant="outline"
                  className="mt-2 font-semibold"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Medication
                </Button>
              </div>
            </div>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Recommended Lab Tests</h3>
              {labTests.map((test, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter lab test"
                    value={test}
                    onChange={(e) => handleLabTestChange(index, e.target.value)}
                    className="font-medium"
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
            <Button className="w-full font-semibold" onClick={handleSavePrescription}>
              Save Prescription, Vitals, and Lab Tests
            </Button>
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
</div>)
}
