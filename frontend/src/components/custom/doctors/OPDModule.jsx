import { useState, useEffect, useMemo, useRef } from "react";
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
import { fetchTemplates } from "../../../redux/slices/templatesSlice";
import { useToast } from "../../../hooks/use-toast";
import { PDFViewer } from "@react-pdf/renderer";
import OPDPrescriptionPDF from "../reports/OPDPrescriptionPDF";
import { comorbidities } from "../../../assets/Data";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import MultiSelectInput from "../MultiSelectInput";
import { Separator } from "../../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useReactToPrint } from 'react-to-print';

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
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const [prescription, setPrescription] = useState({
    diagnosis: "",
    treatment: "",
    medications: [{ name: "", frequency: "0-0-0", duration: "" }],
    additionalInstructions: "",
  });
  const [labTests, setLabTests] = useState([]);
  const dispatch = useDispatch();

  const [selectedLabTests, setSelectedLabTests] = useState([]);

  // const [comorbidities, setComorbidities] = useState([]);
  const [selectedComorbidities, setSelectedComorbidities] = useState([]);
  const { diagnosisTemplate=[],comorbidities=[],medicinelist=[], status } = useSelector((state) => state.templates);
  const [isPrinting,setIsPrinting]=useState(false)
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
  }, [status, dispatch]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);

 
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const prescriptionUpdateStatus = useSelector(
    (state) => state.patients.prescriptionUpdateStatus
  );
  const { toast } = useToast();

  const prescriptionRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => prescriptionRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsPrinting(false);
          resolve();
        }, 500);
      });
    },
    pageStyle:`
    @media print {
     @page {
          size: A4;
          margin: 20mm;
        }
       body * {
    visibility: hidden;
  }
  .prescription-container, 
  .prescription-container * {
    visibility: visible;
  }
  .prescription-container {
    position: absolute;
    padding:20px;
    width: 100%;
  }
      .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .title {
        font-size: 15px;
        color: #1a5f7a;
        font-weight: bold;
        text-align: center;
        flex: 1;
      }
      .date {
        font-size: 10px;
        color: #2c3e50;
      }
      .section {
        margin-bottom: 10px;
      }
      .patient-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 10px;
      }
      .info-row {
        display: flex;
        gap: 5px;
      }
      .label {
        font-weight: bold;
        font-size: 11px;
      }
      .value {
        font-size: 10px;
      }
      .section-title {
        font-size: 12px;
        font-weight: bold;
        color: #34495e;
        margin-bottom: 5px;
      }
      .section-content {
        font-size: 10px;
      }
      .vitals-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
      }
      .vital-item {
        font-size: 8px;
      }
      .vital-inner {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .vital-label {
        font-weight: bold;
        color: #34495e;
      }
      .vital-value {
        color: #2c3e50;
      }
      .medications-list {
        width: 100%;
      }
      .medication-row {
        display: grid;
        grid-template-columns: 5% 35% 30% 30%;
        margin-bottom: 3px;
        font-size: 10px;
      }
      .doctor-signature {
        margin-top: 20px;
        text-align: right;
        font-size: 10px;
      }
    }`
  });

  const handlePreviewClick = async () => {
    try {
      await handlePrint();
    } catch (error) {
      console.error('Print failed:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate prescription preview",
        variant: "destructive",
      });
    }
  };

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
        medications:
          patient.medications?.length > 0
            ? patient.medications
            : [{ name: "", frequency: "0-0-0", duration: "" }],
        additionalInstructions: patient.additionalInstructions || "",
      });
      // Update labTests and selectedLabTests
      const patientLabTests =
        patient.labTests?.map((test) => ({ name: test })) || [];
      setLabTests(patientLabTests);
      setSelectedLabTests(patientLabTests);

      // Update comorbidities and selectedComorbidities
      const patientComorbidities =
        patient.comorbidities?.map((comorbidity) => ({ name: comorbidity })) ||
        [];
      // setComorbidities(patientComorbidities);
      setSelectedComorbidities(patientComorbidities);
      // Update selectedDiagnoses from patient data
      const patientDiagnoses =
        patient.diagnosis?.split(",").map((d) => ({ name: d.trim() })) || [];
      setSelectedDiagnoses(patientDiagnoses);
    }
  }, [patient]);

  const commonMedications = useMemo(() => {
    return medicinelist.map((item) => ({ name: item }));
  }, [medicinelist]);
  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => {
      const newVitals = { ...prev, [name]: value };
      // Calculate BMI if both height and weight are present
      if (name === "height" || name === "weight") {
        if (newVitals.height && newVitals.weight) {
          const heightInMeters = newVitals.height / 100;
          const bmi = (
            newVitals.weight /
            (heightInMeters * heightInMeters)
          ).toFixed(1);
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
    setSelectedComorbidities(
      selectedComorbidities.filter((c) => c.name !== name)
    );
  };

  const handleLabTestsChange = (newLabTests) => {
    setSelectedLabTests(newLabTests);
  };

  const handleRemoveLabTest = (name) => {
    setSelectedLabTests(selectedLabTests.filter((test) => test.name !== name));
  };

  const handleDiagnosisChange = (newDiagnoses) => {
    setSelectedDiagnoses(newDiagnoses);
    // Update the prescription diagnosis field by joining the names
    setPrescription((prev) => ({
      ...prev,
      diagnosis: newDiagnoses.map((d) => d.name).join(", "),
    }));
  };

  const handleRemoveDiagnosis = (name) => {
    const newDiagnoses = selectedDiagnoses.filter((d) => d.name !== name);
    setSelectedDiagnoses(newDiagnoses);
    setPrescription((prev) => ({
      ...prev,
      diagnosis: newDiagnoses.map((d) => d.name).join(", "),
    }));
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
      await dispatch(
        savePrescription({
          selectedVisitId: patient.ID,
          vitals,
          prescription,
          selectedPatientType: "OPD",
          labTests: selectedLabTests.map((test) => test.name),
          comorbidities: selectedComorbidities.map((c) => c.name),
        })
      ).unwrap();

      toast({
        variant: "success",
        title: "Saved Successfully!",
        description: "Prescription updated successfully!",
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
    <div className="space-y-2">
      <div className="flex justify-between items-center border-b border-gray-300 pb-2">
        <h2 className="text-xl font-bold hidden lg:block">
          Prescription for: {patient.patient.name}{" "}
        </h2>
        <h2 className="text-md font-bold lg:hidden">{patient.patient.name} </h2>
        <div className="space-x-2 flex">
          <Button
            className="font-semibold hidden lg:block"
            size="sm"
            variant="outline"
            onClick={handlePreviewClick}
          >
            Preview PDF
          </Button>
          <Button
            className="font-semibold"
            size="sm"
            disabled={prescriptionUpdateStatus === "loading"}
            onClick={handleSavePrescription}
          >
            {prescriptionUpdateStatus === "loading" ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-125px)] md:pr-4">
        <Tabs defaultValue="vitals" className="w-full lg:hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger className="px-2" value="medications">
              Medications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vitals">
            <div className="px-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label
                    htmlFor="temperature"
                    className="text-xs font-semibold"
                  >
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    value={vitals.temperature}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate" className="text-xs font-semibold">
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="heartRate"
                    name="heartRate"
                    value={vitals.heartRate}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="bloodPressure"
                    className="text-xs font-semibold"
                  >
                    Blood Pressure (mmHg)
                  </Label>
                  <Input
                    id="bloodPressure"
                    name="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="respiratoryRate"
                    className="text-xs font-semibold"
                  >
                    Respiratory Rate (bpm)
                  </Label>
                  <Input
                    id="respiratoryRate"
                    name="respiratoryRate"
                    value={vitals.respiratoryRate}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs font-semibold">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    value={vitals.height}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-xs font-semibold">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    value={vitals.weight}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="bmi" className="text-xs font-semibold">
                    BMI
                  </Label>
                  <Input
                    id="bmi"
                    name="bmi"
                    value={vitals.bmi}
                    readOnly
                    className="h-8 text-sm font-medium bg-gray-100"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="oxygenSaturation"
                    className="text-xs font-semibold"
                  >
                    O₂ Saturation (%)
                  </Label>
                  <Input
                    id="oxygenSaturation"
                    name="oxygenSaturation"
                    value={vitals.oxygenSaturation}
                    onChange={handleVitalChange}
                    className="h-8 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="diagnosis">
            <div className="pt-4 p-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Diagnosis and Treatment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnosis" className="text-xs font-semibold">
                    Diagnosis
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <MultiSelectInput
                        suggestions={diagnosisTemplate.map((item) => ({
                          name: item
                        }))}
                        selectedValues={selectedDiagnoses}
                        setSelectedValues={handleDiagnosisChange}
                        placeholder="Select diagnosis"
                      />
                    </div>
                    <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                      {selectedDiagnoses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedDiagnoses.map((diagnosis, index) => (
                            <Badge
                              key={index}
                              variant="primary"
                              className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
                            >
                              {diagnosis.name}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() =>
                                  handleRemoveDiagnosis(diagnosis.name)
                                }
                              />
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No diagnoses selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="treatment" className="text-xs font-semibold">
                    Treatment
                  </Label>
                  <Textarea
                    id="treatment"
                    name="treatment"
                    value={prescription.treatment}
                    onChange={handlePrescriptionChange}
                    placeholder="Enter recommended treatment"
                    className="min-h-[100px] text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tests">
            <div className="grid grid-cols-1 px-1 gap-4 bg-gray-50">
              <div className="pt-2 bg-gray-50">
                <h3 className="text-lg font-semibold">Recommended Lab Tests</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={allLabTests}
                      selectedValues={selectedLabTests}
                      setSelectedValues={handleLabTestsChange}
                      placeholder="Select lab tests"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                    {selectedLabTests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedLabTests.map((test, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {test.name}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveLabTest(test.name)}
                            />
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No lab tests selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 bg-gray-50">
                <h3 className="text-lg font-semibold">Comorbidities</h3>
                <div className=" space-y-2">
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={comorbidities.map((name) => ({ name }))}
                      selectedValues={selectedComorbidities}
                      setSelectedValues={handleComorbiditiesChange}
                      placeholder="Select comorbidities"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                    {selectedComorbidities?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedComorbidities?.map((comorbidity, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
                          >
                           ayush
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() =>
                                handleRemoveComorbidity(comorbidity.name)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No comorbidities selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="medications">
            <div className="pt-0 px-1 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Medications</h3>
              <div className="space-y-4">
                {prescription.medications?.map((medication, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-md shadow-sm"
                  >
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      <SearchSuggestion
                        suggestions={commonMedications}
                        placeholder="Select medicine"
                        value={medication.name}
                        setValue={(value) =>
                          handleMedicationChange(index, "name", value)
                        }
                        onSuggestionSelect={(suggestion) =>
                          handleMedicationSuggestionSelect(index, suggestion)
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Frequency (e.g., 1-0-1)"
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
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      disabled={prescription.medications.length === 1}
                      className="w-full mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addMedication}
                  variant="outline"
                  className="w-full font-semibold"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Medication
                </Button>
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="text-lg font-semibold">
                  Additional Instructions
                </h3>
                <Textarea
                  id="additionalInstructions"
                  name="additionalInstructions"
                  value={prescription.additionalInstructions}
                  onChange={handlePrescriptionChange}
                  placeholder="Any additional instructions or notes"
                  className="min-h-[100px] text-sm font-medium"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="hidden lg:block">
          <div className="px-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Vitals</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="temperature" className="text-xs font-semibold">
                  Temperature (°F)
                </Label>
                <Input
                  id="temperature"
                  name="temperature"
                  value={vitals.temperature}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label htmlFor="heartRate" className="text-xs font-semibold">
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="heartRate"
                  name="heartRate"
                  value={vitals.heartRate}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="bloodPressure"
                  className="text-xs font-semibold"
                >
                  Blood Pressure (mmHg)
                </Label>
                <Input
                  id="bloodPressure"
                  name="bloodPressure"
                  value={vitals.bloodPressure}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="respiratoryRate"
                  className="text-xs font-semibold"
                >
                  Respiratory Rate (bpm)
                </Label>
                <Input
                  id="respiratoryRate"
                  name="respiratoryRate"
                  value={vitals.respiratoryRate}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs font-semibold">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  name="height"
                  value={vitals.height}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-xs font-semibold">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  value={vitals.weight}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label htmlFor="bmi" className="text-xs font-semibold">
                  BMI
                </Label>
                <Input
                  id="bmi"
                  name="bmi"
                  value={vitals.bmi}
                  readOnly
                  className="h-8 text-sm font-medium bg-gray-100"
                />
              </div>
              <div>
                <Label
                  htmlFor="oxygenSaturation"
                  className="text-xs font-semibold"
                >
                  O₂ Saturation (%)
                </Label>
                <Input
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  value={vitals.oxygenSaturation}
                  onChange={handleVitalChange}
                  className="h-8 text-sm font-medium"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 p-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Diagnosis and Treatment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis" className="text-xs font-semibold">
                  Diagnosis
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={diagnosisTemplate.map((item) => ({
                        name: item
                      }))}
                      selectedValues={selectedDiagnoses}
                      setSelectedValues={handleDiagnosisChange}
                      placeholder="Select diagnosis"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                    {selectedDiagnoses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDiagnoses.map((diagnosis, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
                          >
                            {diagnosis.name}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() =>
                                handleRemoveDiagnosis(diagnosis.name)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No diagnoses selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="treatment" className="text-xs font-semibold">
                  Treatment
                </Label>
                <Textarea
                  id="treatment"
                  name="treatment"
                  value={prescription.treatment}
                  onChange={handlePrescriptionChange}
                  placeholder="Enter recommended treatment"
                  className="min-h-[100px] text-sm font-medium"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 px-1 gap-4 bg-gray-50">
            <div className="pt-2 bg-gray-50">
              <h3 className="text-lg font-semibold">Recommended Lab Tests</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <MultiSelectInput
                    suggestions={allLabTests}
                    selectedValues={selectedLabTests}
                    setSelectedValues={handleLabTestsChange}
                    placeholder="Select lab tests"
                  />
                </div>
                <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                  {selectedLabTests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedLabTests.map((test, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {test.name}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveLabTest(test.name)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No lab tests selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 bg-gray-50">
              <h3 className="text-lg font-semibold">Comorbidities</h3>
              <div className=" space-y-2">
                <div className="flex gap-2">
                  <MultiSelectInput
                    suggestions={comorbidities.map((name) => ({ name }))}
                    selectedValues={selectedComorbidities}
                    setSelectedValues={handleComorbiditiesChange}
                    placeholder="Select comorbidities"
                  />
                </div>
                <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                  {selectedComorbidities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedComorbidities.map((comorbidity, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
                        >
                          {comorbidity.name}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                              handleRemoveComorbidity(comorbidity.name)
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No comorbidities selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 px-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Medications</h3>
            <div>
              {prescription.medications?.map((medication, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <SearchSuggestion
                    suggestions={commonMedications}
                    placeholder="Select medicine"
                    value={medication.name}
                    setValue={(value) =>
                      handleMedicationChange(index, "name", value)
                    }
                    onSuggestionSelect={(suggestion) =>
                      handleMedicationSuggestionSelect(index, suggestion)
                    }
                  />
                  <Input
                    placeholder="0-0-0"
                    value={medication.frequency}
                    onChange={(e) =>
                      handleMedicationChange(index, "frequency", e.target.value)
                    }
                    className="font-medium"
                  />
                  <Input
                    placeholder="Duration"
                    value={medication.duration}
                    onChange={(e) =>
                      handleMedicationChange(index, "duration", e.target.value)
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
          <div className="space-y-2 px-1 pt-4 mb-4 bg-gray-50">
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
        </div>
      </ScrollArea>
      <div>
        <OPDPrescriptionPDF
          ref={prescriptionRef}
          patient={patient.patient}
          vitals={vitals}
          prescription={prescription}
          labTests={labTests}
          selectedComorbidities={selectedComorbidities}
          hospital={hospital}
        />
      </div>
    </div>
  );
}
