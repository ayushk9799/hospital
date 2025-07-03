import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { useSelector, useDispatch } from "react-redux";
import { savePrescription } from "../../../redux/slices/patientSlice";
import { fetchTemplates } from "../../../redux/slices/templatesSlice";
import { useToast } from "../../../hooks/use-toast";
import OPDPrescriptionTemplate from "../../../templates/opdPrescription";
import { useReactToPrint } from "react-to-print";
import { fetchDoctorPrescriptionTemplates } from "../../../redux/slices/doctorPrescriptionSlice";
import { DEFAULT_PRESCRIPTION_FORM_CONFIG } from "../../../config/opdPrescriptionConfig";
import FormField from "./form-fields/FormField";
import { fetchDoctorData } from "../../../redux/slices/doctorDataSlice";
import { parseAge } from "../../../assets/Data";
import { fetchTextTemplates } from "../../../redux/slices/textTemplatesSlice";

const generateInitialStateFromConfig = (config) => {
  const initialState = {
    vitals: {},
  };

  if (!config || !config.sections) {
    return initialState;
  }

  config.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const { id, type, disabled, suggestions } = field;

      if (disabled) {
        return;
      }

      switch (type) {
        case "vitals":
          initialState.vitals = {
            temperature: "",
            heartRate: "",
            bloodPressure: "",
            respiratoryRate: "",
            height: "",
            weight: "",
            oxygenSaturation: "",
            bmi: "",
          };
          break;
        case "medicineAdvice":
          initialState.medications = [
            { name: "", frequency: "0-0-0", duration: "", remarks: "" },
          ];
          break;
        case "multiselect":
          initialState[id] = [];
          if (id === "diagnosis") {
            initialState.diagnosis = [];
          }
          break;
        case "text":
          initialState[id] = "";
          break;
        case "textarea":
          initialState[id] = "";
          break;

         
        default:
          break;
      }
    });
  });

  return initialState;
};

export default function OPDModule({ patient, doctorId }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const prescriptionRef = useRef();

  const { templates: doctorTemplates, status: doctorTemplatesStatus } =
    useSelector((state) => state.doctorPrescription);
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const {
    labTestsTemplate,
    diagnosisTemplate = [],
    comorbidities: comorbiditiesTemplate = [],
    status: templatesStatus,
  } = useSelector((state) => state.templates);
  const { currentDoctorData } = useSelector((state) => state.doctorData);
  const { templates: textTemplates } = useSelector(
    (state) => state.textTemplates
  );

  const prescriptionUpdateStatus = useSelector(
    (state) => state.patients.prescriptionUpdateStatus
  );

  const [formData, setFormData] = useState(() =>
    generateInitialStateFromConfig(DEFAULT_PRESCRIPTION_FORM_CONFIG)
  );

  useEffect(() => {
    if (templatesStatus === "idle") {
      dispatch(fetchTemplates());
    }
    if (doctorTemplatesStatus === "idle") {
      dispatch(fetchDoctorPrescriptionTemplates());
    }
  }, [templatesStatus, dispatch, doctorTemplatesStatus]);

  useEffect(() => {
    if (patient?.doctor?._id) {
      dispatch(fetchDoctorData(patient.doctor._id));
    }
  }, [patient?.doctor?._id, dispatch]);

  const formConfig = useMemo(() => {
    if (doctorTemplates && patient.doctor?._id) {
      const doctorTemplate = doctorTemplates.find((template) =>
        template.associatedDoctors.some(
          (doc) => doc._id === patient.doctor?._id
        )
      );
      if (doctorTemplate) {
        return doctorTemplate.value;
      }
    }
    return DEFAULT_PRESCRIPTION_FORM_CONFIG;
  }, [doctorTemplates, patient.doctor?._id, patient]);

  // Helper function to create field type map from form configuration
  const getFieldTypeMap = (config) => {
    const fieldTypeMap = {};
    if (!config || !config.sections) return fieldTypeMap;

    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (!field.disabled) {
          fieldTypeMap[field.id] = field.type;
        }
      });
    });

    return fieldTypeMap;
  };

  // Helper function to preprocess data based on field type
  const preprocessDataForFieldType = (value, fieldType, fieldId) => {
    if (value === undefined || value === null) {
      return fieldType === "multiselect" ? [] : value;
    }

    switch (fieldType) {
      case "multiselect":
        // Handle multiselect field type compatibility
        if (typeof value === "string") {
          // Split comma-separated string into array of objects
          return value
            .split(",")
            .map((item) => ({ name: item.trim() }))
            .filter((item) => item.name);
        } else if (Array.isArray(value)) {
          // If already array, check if it's array of strings or objects
          if (value.length > 0 && typeof value[0] === "string") {
            // Convert array of strings to array of objects
            return value.map((item) => ({ name: item }));
          } else if (
            value.length > 0 &&
            typeof value[0] === "object" &&
            value[0].name !== undefined
          ) {
            // Already in correct format
            return value;
          }
        }
        return [];

      case "diagnosis":
        // Diagnosis can be stored as string but displayed as multiselect
        if (typeof value === "string") {
          return value
            .split(",")
            .map((d) => ({ name: d.trim() }))
            .filter((d) => d.name);
        } else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "string") {
            return value.map((item) => ({ name: item }));
          }
        }
        return Array.isArray(value) ? value : [];

      case "medicineAdvice":
        // Medications should be an array
        return Array.isArray(value) ? value : [];

      case "vitals":
        // Vitals should be an object
        return typeof value === "object" && value !== null ? value : {};

      default:
        // For text, textarea, and other simple types, return as-is
        return value;
    }
  };

  useEffect(() => {
    let newFormData = generateInitialStateFromConfig(formConfig);
    

    if (patient) {
      const fieldTypeMap = getFieldTypeMap(formConfig);

      newFormData = Object.keys(newFormData).reduce(
        (acc, key) => {
          const prescription = patient.prescription || {};
          const fieldType = fieldTypeMap[key];

          if (key === "vitals") {
            // Handle vitals specially
            if (patient.vitals) {
              for (const vitalKey in acc.vitals) {
                acc.vitals[vitalKey] = patient.vitals[vitalKey] || "";
              }
            }
          } else if (key === "medications") {
            // Handle medications specially for backward compatibility
            const medsFromPrescription = prescription.medications;
            const medsFromLegacy = patient.medications;
            const rawMedications =
              medsFromPrescription && medsFromPrescription.length > 0
                ? medsFromPrescription
                : medsFromLegacy && medsFromLegacy.length > 0
                ? medsFromLegacy
                : newFormData.medications;

            acc[key] = preprocessDataForFieldType(
              rawMedications,
              "medicineAdvice",
              key
            );
          } else {
           
            // Use generic preprocessing for all other fields
            let rawValue;

            if (prescription[key] !== undefined) {
              rawValue = prescription[key];
            } else if (patient[key] !== undefined) {
              rawValue = patient[key];
            } else if (patient.vitals && patient.vitals[key] !== undefined) {
              rawValue = patient.vitals[key];
            } else {
              rawValue = newFormData[key];
            }


            // Apply preprocessing based on field type
            acc[key] = preprocessDataForFieldType(rawValue, fieldType, key);
          }

          return acc;
        },
        { ...newFormData }
      );
    }

    setFormData(newFormData);
  }, [patient, formConfig]);
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newVitals = { ...prev.vitals, [name]: value };

      if (name === "height" || name === "weight") {
        const height = name === "height" ? value : newVitals.height;
        const weight = name === "weight" ? value : newVitals.weight;
        if (height && weight) {
          const heightInMeters = height / 100;
          newVitals.bmi = (weight / (heightInMeters * heightInMeters)).toFixed(
            1
          );
        } else {
          newVitals.bmi = "";
        }
      }
      return { ...prev, vitals: newVitals };
    });
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return { ...prev, medications: newMedications };
    });
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: "", frequency: "0-0-0", duration: "" },
      ],
    }));
  };

  const removeMedication = (index) => {
    setFormData((prev) => {
      const newMedications = prev.medications.filter((_, i) => i !== index);
      return { ...prev, medications: newMedications };
    });
  };

  const handleMultiSelectChange = (fieldId, values) => {
    setFormData((prev) => ({ ...prev, [fieldId]: values }));
  };

  const handleRemoveValue = (fieldId, valueName) => {
    setFormData((prev) => {
      const newValues = prev[fieldId].filter((v) => v.name !== valueName);
      return { ...prev, [fieldId]: newValues };
    });
  };

  // Helper function to dynamically build prescription payload based on form configuration
  const buildPrescriptionPayload = () => {
    const prescription = {};

    // Always include vitals if they exist
    if (formData.vitals) {
      prescription.vitals = formData.vitals;
    }

    // Iterate through form configuration to build payload dynamically
    formConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const { id, type, disabled } = field;

        // Skip disabled fields
        if (disabled) {
          return;
        }

        // Skip vitals as they're handled separately above
        if (type === "vitals") {
          return;
        }

        // Handle different field types
        switch (type) {
          case "medicineAdvice":
            if (formData.medications) {
              prescription.medications = formData.medications;
            }
            break;

          case "multiselect":
            if (formData[id] && Array.isArray(formData[id])) {
              // Convert array of objects with name property to array of strings
              prescription[id] = formData[id].map((item) => item.name);
            }
            break;

          case "diagnosis":
            if (formData[id] && Array.isArray(formData[id])) {
              // Diagnosis is typically stored as comma-separated string
              prescription[id] = formData[id].map((d) => d.name).join(", ");
            }
            break;

          default:
            // Handle regular text fields, textareas, etc.
            if (formData[id] !== undefined) {
              prescription[id] = formData[id];
            }
            break;
        }
      });
    });

    return prescription;
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

    const payload = {
      prescription: buildPrescriptionPayload(),
      selectedPatientType: "OPD",
      selectedVisitId: patient.ID,
    };

    try {
      await dispatch(savePrescription(payload)).unwrap();

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

  const [isPrinting, setIsPrinting] = useState(false);
  const handlePrint = useReactToPrint({
    content: () => {
      return prescriptionRef.current;
    },

    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsPrinting(false);
          resolve();
        }, 500);
      });
    },

    pageStyle: `
    @media print {
     @page {
          size: A4;
          margin: 20mm;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }`,
  });

  const [suggestions, setSuggestions] = useState({});
  useEffect(() => {
    setSuggestions({
      diagnosisTemplate: currentDoctorData.diagnosis.map((item) => ({
        name: item,
      })),
      comorbidities: currentDoctorData.comorbidities.map((name) => ({
        name,
      })),
      labTests: labTestsTemplate.map((test) => ({ name: test.name })),
    });
  }, [currentDoctorData]);


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
            onClick={handlePrint}
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
        <div
          className="p-1 bg-gray-50"
          key={`form-${
            JSON.stringify(formConfig) !==
            JSON.stringify(DEFAULT_PRESCRIPTION_FORM_CONFIG)
              ? "doctor"
              : "default"
          }`}
        >
          {formConfig.sections.map((section) => (
            <div key={section.id} className={section.className}>
              <div className="space-y-6">
                {section.fields
                  .filter((field) => !field.disabled)
                  .map((field) => (
                    <FormField
                      key={field.id}
                      formConfig={formConfig}
                      field={field}
                      doctorData={patient.doctor}
                      formData={formData}
                      handleChange={handleChange}
                      handleVitalChange={handleVitalChange}
                      handleMultiSelectChange={handleMultiSelectChange}
                      handleRemoveValue={handleRemoveValue}
                      handleMedicationChange={handleMedicationChange}
                      addMedication={addMedication}
                      removeMedication={removeMedication}
                      suggestions={suggestions}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div style={{display:"none"}}>
        <OPDPrescriptionTemplate
          patient={{ ...patient.patient, age: parseAge(patient?.patient?.age) , registrationNumber:patient?.registrationNumber }}
          formData={formData}
          field={formConfig.sections}
          hospital={hospital}
          
          ref={prescriptionRef}
        />
      </div>
    </div>
  );
}
