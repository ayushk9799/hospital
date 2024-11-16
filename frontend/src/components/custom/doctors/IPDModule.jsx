import { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { PlusCircle, Trash2, Loader2, X } from "lucide-react";
import SearchSuggestion from "../registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { savePrescription } from "../../../redux/slices/patientSlice";
import { useToast } from "../../../hooks/use-toast";
import { fetchItems } from "../../../redux/slices/pharmacySlice";
import { labCategories } from "../../../assets/Data";
import { Badge } from "../../ui/badge";
import { comorbidities } from "../../../assets/Data";
import MultiSelectInput from "../MultiSelectInput";
import { ScrollArea } from "../../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { fetchTemplates } from "../../../redux/slices/templatesSlice";

// Add this at the top of the file, outside the component
const allLabTests = labCategories.flatMap((category) =>
  category.types.map((type) => ({ name: type }))
);

const comorbiditiesList = comorbidities.map((name) => ({ name }));

export default function IPDModule({ patient }) {
  console.log("patient", patient); 
  const [ipdAdmission, setIpdAdmission] = useState({
    bookingDate: patient.bookingDate,
    bookingNumber: patient.bookingNumber,
    patientName: patient.patient.name,
    contactNumber: patient.patient.contactNumber,
    registrationNumber: patient.patient._id,
    patient: patient.patient._id,
    diagnosis: "",
    notes: patient.notes || "",
    clinicalSummary: patient.clinicalSummary,
    comorbidities:
      patient.comorbidities?.map((comorbidity) => ({ name: comorbidity })) ||
      [],
    comorbidityHandling: "separate",
    conditionOnAdmission: patient.conditionOnAdmission || "",
    conditionOnDischarge: patient.conditionOnDischarge || "",
    treatment: patient.treatment || "",
    medications:
      patient.medications.length > 0
        ? patient.medications
        : [{ name: "", frequency: "0-0-0", duration: "" }],
    labTests:
      patient.labTests.length > 0
        ? patient.labTests.map((test) => ({ name: test }))
        : [{ name: "" }],
    vitals: {
      admission: {
        bloodPressure: patient.vitals.admission.bloodPressure || "",
        heartRate: patient.vitals.admission.heartRate || "",
        temperature: patient.vitals.admission.temperature || "",
        oxygenSaturation: patient.vitals.admission.oxygenSaturation || "",
        respiratoryRate: patient.vitals.admission.respiratoryRate || "",
        weight: patient.vitals.admission.weight || "",
        height: patient.vitals.admission.height || "",
      },
      discharge: {
        bloodPressure: patient.vitals.discharge.bloodPressure || "",
        heartRate: patient.vitals.discharge.heartRate || "",
        temperature: patient.vitals.discharge.temperature || "",
        oxygenSaturation: patient.vitals.discharge.oxygenSaturation || "",
        respiratoryRate: patient.vitals.discharge.respiratoryRate || "",
      },
      weight: patient.vitals.weight || "",
      height: patient.vitals.height || "",
    },
    status: "Admitted",
    assignedDoctor: "", // You might want to set this based on the logged-in doctor
    assignedRoom: "",
    assignedBed: "",
    insuranceDetails: {
      provider: "",
      policyNumber: "",
      coverageType: "",
    },
  });

  // Add this useEffect to update the state when the patient prop changes
  useEffect(() => {
    if (patient) {
      setIpdAdmission((prev) => ({
        ...prev,
        bookingDate: patient.bookingDate,
        bookingNumber: patient.bookingNumber,
        patientName: patient.patient.name,
        contactNumber: patient.patient.contactNumber,
        registrationNumber: patient.patient._id,
        comorbidities:
          patient.comorbidities?.map((comorbidity) => ({
            name: comorbidity,
          })) || [],
        patient: patient.patient._id,
        diagnosis: patient.diagnosis || "",
        notes: patient.notes || "",
        clinicalSummary: patient.clinicalSummary,
        treatment: patient.treatment || "",
        medications:
          patient.medications.length > 0
            ? patient.medications
            : [{ name: "", frequency: "0-0-0", duration: "" }],
        labTests:
          patient.labTests.length > 0
            ? patient.labTests.map((test) => ({ name: test }))
            : [{ name: "" }],
        vitals: {
          admission: {
            bloodPressure: patient.vitals.admission.bloodPressure || "",
            heartRate: patient.vitals.admission.heartRate || "",
            temperature: patient.vitals.admission.temperature || "",
            oxygenSaturation: patient.vitals.admission.oxygenSaturation || "",
            respiratoryRate: patient.vitals.admission.respiratoryRate || "",
            weight: patient.vitals.admission.weight || "",
            height: patient.vitals.admission.height || "",
          },
          discharge: {
            bloodPressure: patient.vitals.discharge.bloodPressure || "",
            heartRate: patient.vitals.discharge.heartRate || "",
            temperature: patient.vitals.discharge.temperature || "",
            oxygenSaturation: patient.vitals.discharge.oxygenSaturation || "",
            respiratoryRate: patient.vitals.discharge.respiratoryRate || "",
          },
          weight: patient.vitals.weight || "",
          height: patient.vitals.height || "",
        },
        status: "Admitted",
        assignedDoctor: "",
        assignedRoom: "",
        assignedBed: "",
        insuranceDetails: {
          provider: "",
          policyNumber: "",
          coverageType: "",
        },
      }));

      // Update selectedDiagnoses from patient data
      const patientDiagnoses = patient.diagnosis
        ? patient.diagnosis.split(",").map((d) => ({ name: d.trim() }))
        : [];
      setSelectedDiagnoses(patientDiagnoses);
    }
  }, [patient]);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const prescriptionUpdateStatus = useSelector(
    (state) => state.patients.prescriptionUpdateStatus
  );
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const { diagnosisTemplate, status } = useSelector((state) => state.templates);

  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
  }, [status, dispatch]);

  const commonMedications = useMemo(() => {
    return medicines.map((item) => ({ name: item.name }));
  }, [medicines]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIpdAdmission((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e, type) => {
    const { name, value } = e.target;
    setIpdAdmission((prev) => {
      const newVitals = {
        ...prev.vitals,
        [type]: {
          ...prev.vitals[type],
          [name]: value,
        },
      };

      // Calculate BMI if height or weight changes
      if (type === "admission" && (name === "height" || name === "weight")) {
        const height =
          name === "height"
            ? parseFloat(value)
            : parseFloat(prev.vitals.admission.height);
        const weight =
          name === "weight"
            ? parseFloat(value)
            : parseFloat(prev.vitals.admission.weight);

        if (height && weight) {
          const heightInMeters = height / 100;
          const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
          newVitals.admission.bmi = bmi;
        }
      }

      return { ...prev, vitals: newVitals };
    });
  };

  const handleMedicationChange = (index, field, value) => {
    setIpdAdmission((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return { ...prev, medications: newMedications };
    });
  };

  const handleMedicationSuggestionSelect = (index, suggestion) => {
    handleMedicationChange(index, "name", suggestion.name);
  };

  const addMedication = () => {
    setIpdAdmission((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: "", frequency: "", duration: "" },
      ],
    }));
  };

  const removeMedication = (index) => {
    setIpdAdmission((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const removeLabTest = (index) => {
    setIpdAdmission((prev) => ({
      ...prev,
      labTests: prev.labTests.filter((_, i) => i !== index),
    }));
  };

  const handleSaveIPDAdmission = async () => {
    if (!patient.ID) {
      toast({
        title: "Error",
        description: "No patient selected!",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        savePrescription({
          selectedVisitId: patient.ID,
          vitals: ipdAdmission.vitals,
          clinicalSummary: ipdAdmission.clinicalSummary,
          notes: ipdAdmission.notes,
          prescription: {
            diagnosis: ipdAdmission.diagnosis,
            treatment: ipdAdmission.treatment,
            medications: ipdAdmission.medications,
          },
          conditionOnAdmission: ipdAdmission.conditionOnAdmission,
          conditionOnDischarge: ipdAdmission.conditionOnDischarge,
          comorbidities: ipdAdmission.comorbidities.map(
            (comorbidity) => comorbidity.name
          ),
          selectedPatientType: "IPD",
          labTests: ipdAdmission.labTests.map((test) => test.name),
        })
      ).unwrap();

      toast({
        variant: "success",
        title: "Saved Successfully!",
        description: "IPD prescription saved successfully!",
      });
    } catch (error) {
      console.error("Error saving IPD prescription:", error);
      toast({
        title: "Error",
        description: "Failed to save IPD prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComorbiditiesChange = (newComorbidities) => {
    setIpdAdmission((prev) => ({ ...prev, comorbidities: newComorbidities }));
  };

  const handleRemoveComorbidity = (name) => {
    setIpdAdmission((prev) => ({
      ...prev,
      comorbidities: prev.comorbidities.filter((val) => val.name !== name),
    }));
  };

  const handleDiagnosisChange = (newDiagnoses) => {
    setSelectedDiagnoses(newDiagnoses);
    setIpdAdmission((prev) => ({
      ...prev,
      diagnosis: newDiagnoses.map((d) => d.name).join(", "),
    }));
  };

  const handleRemoveDiagnosis = (name) => {
    const newDiagnoses = selectedDiagnoses.filter((d) => d.name !== name);
    setSelectedDiagnoses(newDiagnoses);
    setIpdAdmission((prev) => ({
      ...prev,
      diagnosis: newDiagnoses.map((d) => d.name).join(", "),
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center border-b border-gray-300 pb-2">
        <div>
          <h2 className="text-xl font-bold hidden lg:block">
            IPD Admission for: {ipdAdmission.patientName}
          </h2>
          <h2 className="text-md font-bold lg:hidden">
            {ipdAdmission.patientName}
          </h2>
        </div>
        <div className="space-x-2">
          <Button
            className="font-semibold"
            size="sm"
            onClick={handleSaveIPDAdmission}
            disabled={prescriptionUpdateStatus === "loading"}
          >
            {prescriptionUpdateStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-125px)] md:pr-4">
        <Tabs defaultValue="vitals" className="w-full lg:hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="lab">Tests</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>
          <TabsContent value="vitals">
            {/* Admission Vitals */}
            <div className="px-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Admission Vitals</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="admission-temperature"
                    className="text-xs font-semibold"
                  >
                    Temperature (°C)
                  </Label>
                  <Input
                    id="admission-temperature"
                    name="temperature"
                    value={ipdAdmission.vitals.admission.temperature}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-heartRate"
                    className="text-xs font-semibold"
                  >
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="admission-heartRate"
                    name="heartRate"
                    value={ipdAdmission.vitals.admission.heartRate}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-bloodPressure"
                    className="text-xs font-semibold"
                  >
                    Blood Pressure (mmHg)
                  </Label>
                  <Input
                    id="admission-bloodPressure"
                    name="bloodPressure"
                    value={ipdAdmission.vitals.admission.bloodPressure}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-respiratoryRate"
                    className="text-xs font-semibold"
                  >
                    Respiratory Rate (bpm)
                  </Label>
                  <Input
                    id="admission-respiratoryRate"
                    name="respiratoryRate"
                    value={ipdAdmission.vitals.admission.respiratoryRate}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-height"
                    className="text-xs font-semibold"
                  >
                    Height (cm)
                  </Label>
                  <Input
                    id="admission-height"
                    name="height"
                    value={ipdAdmission.vitals.admission.height}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-weight"
                    className="text-xs font-semibold"
                  >
                    Weight (kg)
                  </Label>
                  <Input
                    id="admission-weight"
                    name="weight"
                    value={ipdAdmission.vitals.admission.weight}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-bmi"
                    className="text-xs font-semibold"
                  >
                    BMI
                  </Label>
                  <Input
                    id="admission-bmi"
                    name="bmi"
                    value={ipdAdmission.vitals.admission.bmi || ""}
                    readOnly
                    className="h-8 text-sm font-medium bg-gray-100"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="admission-oxygenSaturation"
                    className="text-xs font-semibold"
                  >
                    O₂ Saturation (%)
                  </Label>
                  <Input
                    id="admission-oxygenSaturation"
                    name="oxygenSaturation"
                    value={ipdAdmission.vitals.admission.oxygenSaturation}
                    onChange={(e) => handleVitalChange(e, "admission")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            {/* Discharge Vitals */}
            <div className="pt-4 px-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Discharge Vitals</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="discharge-temperature"
                    className="text-xs font-semibold"
                  >
                    Temperature (°C)
                  </Label>
                  <Input
                    id="discharge-temperature"
                    name="temperature"
                    value={ipdAdmission.vitals.discharge.temperature}
                    onChange={(e) => handleVitalChange(e, "discharge")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="discharge-heartRate"
                    className="text-xs font-semibold"
                  >
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="discharge-heartRate"
                    name="heartRate"
                    value={ipdAdmission.vitals.discharge.heartRate}
                    onChange={(e) => handleVitalChange(e, "discharge")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="discharge-bloodPressure"
                    className="text-xs font-semibold"
                  >
                    Blood Pressure (mmHg)
                  </Label>
                  <Input
                    id="discharge-bloodPressure"
                    name="bloodPressure"
                    value={ipdAdmission.vitals.discharge.bloodPressure}
                    onChange={(e) => handleVitalChange(e, "discharge")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="discharge-respiratoryRate"
                    className="text-xs font-semibold"
                  >
                    Respiratory Rate (bpm)
                  </Label>
                  <Input
                    id="discharge-respiratoryRate"
                    name="respiratoryRate"
                    value={ipdAdmission.vitals.discharge.respiratoryRate}
                    onChange={(e) => handleVitalChange(e, "discharge")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="discharge-oxygenSaturation"
                    className="text-xs font-semibold"
                  >
                    O₂ Saturation (%)
                  </Label>
                  <Input
                    id="discharge-oxygenSaturation"
                    name="oxygenSaturation"
                    value={ipdAdmission.vitals.discharge.oxygenSaturation}
                    onChange={(e) => handleVitalChange(e, "discharge")}
                    className="h-8 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="diagnosis">
            <div className="pt-0 p-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Diagnosis and Treatment</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <Label htmlFor="diagnosis" className="text-xs font-semibold">
                    Diagnosis
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <MultiSelectInput
                        suggestions={diagnosisTemplate.map((item) => ({
                          name: item,
                        }))}
                        selectedValues={selectedDiagnoses}
                        setSelectedValues={handleDiagnosisChange}
                        placeholder="Select diagnoses"
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
                    value={ipdAdmission.treatment}
                    onChange={handleInputChange}
                    placeholder="Enter recommended treatment"
                    className="min-h-[100px] text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            {/* Clinical Summary */}
            <div className="pt-4 p-1 bg-gray-50">
              <h3 className="text-lg font-semibold">Clinical Summary</h3>
              <Textarea
                name="clinicalSummary"
                value={ipdAdmission.clinicalSummary}
                onChange={handleInputChange}
                placeholder="Enter clinical summary"
                className="min-h-[80px] text-sm font-medium"
              />
            </div>
            {/* Additional Notes */}
            <div className="space-y-2 px-1 pt-4 mb-4 bg-gray-50">
              <h3 className="text-lg font-semibold">Additional Notes</h3>
              <Textarea
                name="notes"
                value={ipdAdmission.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes"
                className="min-h-[80px] text-sm font-medium"
              />
            </div>
          </TabsContent>
          <TabsContent value="lab">
            <div className="grid grid-cols-1 gap-4 px-1 pt-4 bg-gray-50">
              {/* Lab Tests */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Lab Tests</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={allLabTests}
                      selectedValues={ipdAdmission.labTests}
                      setSelectedValues={(newLabTests) =>
                        setIpdAdmission((prev) => ({
                          ...prev,
                          labTests: newLabTests,
                        }))
                      }
                      placeholder="Select lab tests"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                    {ipdAdmission.labTests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ipdAdmission.labTests.map((test, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {test.name}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => removeLabTest(index)}
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

              {/* Comorbidities */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Comorbidities</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MultiSelectInput
                      suggestions={comorbiditiesList}
                      selectedValues={ipdAdmission.comorbidities}
                      setSelectedValues={handleComorbiditiesChange}
                      placeholder="Select comorbidities"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                    {ipdAdmission.comorbidities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ipdAdmission.comorbidities.map((val, index) => (
                          <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded"
                          >
                            {val.name}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveComorbidity(val.name)}
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
            {/* Medications */}
            <div className="pt-0 px-1 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Medications</h3>
              <div className="space-y-4">
                {ipdAdmission.medications?.map((medication, index) => (
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
                      disabled={ipdAdmission.medications.length === 1}
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
            </div>
            {/* Additional Notes */}
            <div className="space-y-2 px-1 pt-4 mb-4 bg-gray-50">
              <h3 className="text-lg font-semibold">Additional Notes</h3>
              <Textarea
                name="notes"
                value={ipdAdmission.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes"
                className="min-h-[100px] text-sm font-medium"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Desktop view */}
        <div className="hidden lg:block">
          {/* Admission Vitals */}
          <div className="px-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Admission Vitals</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label
                  htmlFor="admission-temperature"
                  className="text-xs font-semibold"
                >
                  Temperature (°C)
                </Label>
                <Input
                  id="admission-temperature"
                  name="temperature"
                  value={ipdAdmission.vitals.admission.temperature}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-heartRate"
                  className="text-xs font-semibold"
                >
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="admission-heartRate"
                  name="heartRate"
                  value={ipdAdmission.vitals.admission.heartRate}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-bloodPressure"
                  className="text-xs font-semibold"
                >
                  Blood Pressure (mmHg)
                </Label>
                <Input
                  id="admission-bloodPressure"
                  name="bloodPressure"
                  value={ipdAdmission.vitals.admission.bloodPressure}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-respiratoryRate"
                  className="text-xs font-semibold"
                >
                  Respiratory Rate (bpm)
                </Label>
                <Input
                  id="admission-respiratoryRate"
                  name="respiratoryRate"
                  value={ipdAdmission.vitals.admission.respiratoryRate}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-height"
                  className="text-xs font-semibold"
                >
                  Height (cm)
                </Label>
                <Input
                  id="admission-height"
                  name="height"
                  value={ipdAdmission.vitals.admission.height}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-weight"
                  className="text-xs font-semibold"
                >
                  Weight (kg)
                </Label>
                <Input
                  id="admission-weight"
                  name="weight"
                  value={ipdAdmission.vitals.admission.weight}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-bmi"
                  className="text-xs font-semibold"
                >
                  BMI
                </Label>
                <Input
                  id="admission-bmi"
                  name="bmi"
                  value={ipdAdmission.vitals.admission.bmi || ""}
                  readOnly
                  className="h-8 text-sm font-medium bg-gray-100"
                />
              </div>
              <div>
                <Label
                  htmlFor="admission-oxygenSaturation"
                  className="text-xs font-semibold"
                >
                  O₂ Saturation (%)
                </Label>
                <Input
                  id="admission-oxygenSaturation"
                  name="oxygenSaturation"
                  value={ipdAdmission.vitals.admission.oxygenSaturation}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis and Treatment */}
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
                        name: item,
                      }))}
                      selectedValues={selectedDiagnoses}
                      setSelectedValues={handleDiagnosisChange}
                      placeholder="Select diagnoses"
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
                  value={ipdAdmission.treatment}
                  onChange={handleInputChange}
                  placeholder="Enter recommended treatment"
                  className="min-h-[100px] text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div className="pt-4 p-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Clinical Summary</h3>
            <Textarea
              name="clinicalSummary"
              value={ipdAdmission.clinicalSummary}
              onChange={handleInputChange}
              placeholder="Enter clinical summary"
              className="min-h-[100px] text-sm font-medium"
            />
          </div>

          {/* Lab Tests and Comorbidities */}
          <div className="grid grid-cols-2 gap-4 px-1 pt-4 bg-gray-50">
            {/* Lab Tests */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Lab Tests</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <MultiSelectInput
                    suggestions={allLabTests}
                    selectedValues={ipdAdmission.labTests}
                    setSelectedValues={(newLabTests) =>
                      setIpdAdmission((prev) => ({
                        ...prev,
                        labTests: newLabTests,
                      }))
                    }
                    placeholder="Select lab tests"
                  />
                </div>
                <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                  {ipdAdmission.labTests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {ipdAdmission.labTests.map((test, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {test.name}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => removeLabTest(index)}
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

            {/* Comorbidities */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Comorbidities</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <MultiSelectInput
                    suggestions={comorbiditiesList}
                    selectedValues={ipdAdmission.comorbidities}
                    setSelectedValues={handleComorbiditiesChange}
                    placeholder="Select comorbidities"
                  />
                </div>
                <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
                  {ipdAdmission.comorbidities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {ipdAdmission.comorbidities.map((val, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className="flex items-center bg-blue-100 text-blue-800 px-1 py-0.5 text-xs rounded"
                        >
                          {val.name}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveComorbidity(val.name)}
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

          {/* Medications */}
          <div className="pt-4 px-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Medications</h3>
            <div>
              {ipdAdmission.medications?.map((medication, index) => (
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
                    placeholder="Frequency"
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
                    disabled={ipdAdmission.medications.length === 1}
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

          {/* Discharge Vitals */}
          <div className="pt-4 px-1 bg-gray-50">
            <h3 className="text-lg font-semibold">Discharge Vitals</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label
                  htmlFor="discharge-temperature"
                  className="text-xs font-semibold"
                >
                  Temperature (°C)
                </Label>
                <Input
                  id="discharge-temperature"
                  name="temperature"
                  value={ipdAdmission.vitals.discharge.temperature}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="discharge-heartRate"
                  className="text-xs font-semibold"
                >
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="discharge-heartRate"
                  name="heartRate"
                  value={ipdAdmission.vitals.discharge.heartRate}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="discharge-bloodPressure"
                  className="text-xs font-semibold"
                >
                  Blood Pressure (mmHg)
                </Label>
                <Input
                  id="discharge-bloodPressure"
                  name="bloodPressure"
                  value={ipdAdmission.vitals.discharge.bloodPressure}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="discharge-respiratoryRate"
                  className="text-xs font-semibold"
                >
                  Respiratory Rate (bpm)
                </Label>
                <Input
                  id="discharge-respiratoryRate"
                  name="respiratoryRate"
                  value={ipdAdmission.vitals.discharge.respiratoryRate}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
              <div>
                <Label
                  htmlFor="discharge-oxygenSaturation"
                  className="text-xs font-semibold"
                >
                  O₂ Saturation (%)
                </Label>
                <Input
                  id="discharge-oxygenSaturation"
                  name="oxygenSaturation"
                  value={ipdAdmission.vitals.discharge.oxygenSaturation}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 px-1 pt-4 mb-4 bg-gray-50">
            <h3 className="text-lg font-semibold">Additional Notes</h3>
            <Textarea
              name="notes"
              value={ipdAdmission.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes"
              className="min-h-[100px] text-sm font-medium"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
