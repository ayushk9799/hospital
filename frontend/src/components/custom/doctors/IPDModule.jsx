import { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import SearchSuggestion from "../registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { savePrescription } from "../../../redux/slices/patientSlice";
import { useToast } from "../../../hooks/use-toast";
import { fetchItems } from "../../../redux/slices/pharmacySlice";
import { labCategories } from "../../../assets/Data";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import { comorbodities } from "../../../assets/Data";
import MultiSelectInput from "../MultiSelectInput";
import { ScrollArea } from "../../ui/scroll-area";

// Add this at the top of the file, outside the component
const allLabTests = labCategories.flatMap((category) =>
  category.types.map((type) => ({ name: type }))
);

const comorbiditiesList = comorbodities.map((name) => ({ name }));

export default function IPDModule({ patient }) {
  const [ipdAdmission, setIpdAdmission] = useState({
    bookingDate: patient.bookingDate,
    bookingNumber: patient.bookingNumber,
    patientName: patient.patient.name,
    contactNumber: patient.patient.contactNumber,
    registrationNumber: patient.patient._id,
    patient: patient.patient._id,
    diagnosis: patient.diagnosis || "",
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
    setIpdAdmission({
      bookingDate: patient.bookingDate,
      bookingNumber: patient.bookingNumber,
      patientName: patient.patient.name,
      contactNumber: patient.patient.contactNumber,
      registrationNumber: patient.patient._id,
      comorbidities:
        patient.comorbidities?.map((comorbidity) => ({ name: comorbidity })) ||
        [],
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
    });
  }, [patient]);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);

  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);

  const commonMedications = useMemo(() => {
    return medicines.map((item) => ({ name: item.name }));
  }, [medicines]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIpdAdmission((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e, type) => {
    const { name, value } = e.target;
    setIpdAdmission((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [type]: {
          ...prev.vitals[type],
          [name]: value,
        },
      },
    }));
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
        title: "Success",
        description: "IPD Admission saved successfully!",
      });
    } catch (error) {
      console.error("Error saving IPD Admission:", error);
      toast({
        title: "Error",
        description: "Failed to save IPD Admission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComorbiditiesChange = (newComorbidities) => {
    setIpdAdmission((prev) => ({ ...prev, comorbidities: newComorbidities }));
  };

  const handleRemoveSelected = (name) => {
    setIpdAdmission((prev) => ({
      ...prev,
      comorbidities: prev.comorbidities.filter((val) => val.name !== name),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">
          IPD Admission for: {ipdAdmission.patientName} (P
          {ipdAdmission.registrationNumber.slice(-4)})
        </h2>
        <div className="space-x-2">
          <Button className="font-semibold" size="sm" onClick={handleSaveIPDAdmission}>
            Save
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-115px)] pr-4">
        {/* Admission Vitals */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold">Admission Vitals</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(ipdAdmission.vitals.admission).map(([key, value]) => (
              <div key={key}>
                <Label
                  htmlFor={`admission-${key}`}
                  className="text-xs font-semibold"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  id={`admission-${key}`}
                  name={key}
                  value={value}
                  onChange={(e) => handleVitalChange(e, "admission")}
                  className="h-8 text-sm font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Clinical Summary</h3>
          <Textarea
            name="clinicalSummary"
            value={ipdAdmission.clinicalSummary}
            onChange={handleInputChange}
            placeholder="Enter clinical summary"
            className="min-h-[100px] text-sm font-medium"
          />
        </div>

        {/* Comorbidities */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Comorbidities</h3>
          <div className="mt-1 space-y-2">
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
                        onClick={() => handleRemoveSelected(val.name)}
                      />
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No comorbidities selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis and Treatment */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Diagnosis and Treatment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnosis" className="text-xs font-semibold">
                Diagnosis
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={ipdAdmission.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter patient's diagnosis"
                className="min-h-[100px] text-sm font-medium"
              />
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

        {/* Medications */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Medications</h3>
          {ipdAdmission.medications.map((medication, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <SearchSuggestion
                suggestions={commonMedications}
                placeholder="Select medicine"
                value={medication.name}
                setValue={(value) => handleMedicationChange(index, "name", value)}
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

        {/* Lab Tests */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Lab Tests</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <MultiSelectInput
                suggestions={allLabTests}
                selectedValues={ipdAdmission.labTests}
                setSelectedValues={(newLabTests) => setIpdAdmission(prev => ({ ...prev, labTests: newLabTests }))}
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
                <p className="text-gray-500 text-sm">No lab tests selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Discharge Vitals */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Discharge Vitals</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(ipdAdmission.vitals.discharge).map(([key, value]) => (
              <div key={key}>
                <Label
                  htmlFor={`discharge-${key}`}
                  className="text-xs font-semibold"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  id={`discharge-${key}`}
                  name={key}
                  value={value}
                  onChange={(e) => handleVitalChange(e, "discharge")}
                  className="h-8 text-sm font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">Additional Notes</h3>
          <Textarea
            name="notes"
            value={ipdAdmission.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes"
            className="min-h-[100px] text-sm font-medium"
          />
        </div>
      </ScrollArea>
    </div>
  );
}