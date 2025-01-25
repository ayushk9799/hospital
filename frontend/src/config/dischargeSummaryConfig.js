// Default discharge summary form configuration
export const DEFAULT_FORM_CONFIG = {
  sections: [
    {
      id: "patientInfo",
      title: "Patient Information",
      className: "bg-secondary/10 rounded-lg p-3 mb-4",
      fields: [
        { id: "name", label: "Name", type: "text", width: "full" },
        { id: "age", label: "Age", type: "text", width: "half" },
        { id: "gender", label: "Gender", type: "text", width: "half" },
        {
          id: "registrationNumber",
          label: "UHID No",
          type: "text",
          width: "full",
          searchable: true,
        },
        { id: "ipdNumber", label: "IPD No", type: "text", width: "full" },
        { id: "contactNumber", label: "Contact", type: "text", width: "full" },
        { id: "address", label: "Address", type: "text", width: "full" },
        { id: "roomNumber", label: "Room", type: "text", width: "full" },
        {
          id: "admissionDate",
          label: "Admit Date",
          type: "date",
          width: "full",
        },
        {
          id: "dateDischarged",
          label: "Discharge Date",
          type: "date",
          width: "full",
        },
        {
          id: "timeDischarged",
          label: "Discharge Time",
          type: "time",
          width: "full",
        },
        {
          id:"admittedTime",
          label:"Admitted Time",
          type:"time",
          width:"full"
        },
        {
          id:"husbandName",
          label:"Husband Name",
          type:"text",
          width:"full"
        }

      ],
    },
    {
      id: "clinicalInfo",
      fields: [
        {
          id: "diagnosis",
          label: "Diagnosis",
          type: "multiselect",
          component: "MultiSelectInput",
          suggestions: "diagnosisTemplate",
          width: "full",
        },
        {
          id: "clinicalSummary",
          label: "Clinical Summary",
          type: "textarea",
          width: "full",
        },
        {
          id: "comorbidities",
          label: "Comorbidities",
          type: "multiselect",
          component: "MultiSelectInput",
          suggestions: "comorbidities",
          width: "full",
          extraComponent: "ComorbidityHandling",
        },
        {
          id: "admissionVitals",
          label: "Admission Vitals",
          type: "vitals",
          prefix: "admission",
          width: "full",
        },
        {
          id: "conditionOnAdmission",
          label: "Condition on Admission",
          type: "textarea",
          width: "full",
        },
        {
          id: "investigations",
          label: "Investigations",
          type: "investigations",
          width: "full",
        },
        {
          id: "treatment",
          label: "Treatment",
          type: "textarea",
          width: "full",
        },
        {
          id: "babyDetails",
          label: "Baby Details",
          type: "babyTable",
          component: "BabyTable",
          width: "full",
        },
        {
          id: "dischargeVitals",
          label: "Discharge Vitals",
          type: "vitals",
          prefix: "discharge",
          width: "full",
        },
        {
          id: "conditionOnDischarge",
          label: "Condition on Discharge",
          type: "textarea",
          width: "full",
        },
        {
          id: "medicineAdvice",
          label: "Medicine/Advice",
          type: "medicineAdvice",
          width: "full",
        },
      ],
    },
  ],
};

// Example of a simplified form configuration
export const SIMPLIFIED_FORM_CONFIG = {
  sections: [
    {
      id: "patientInfo",
      title: "Patient Information",
      className: "bg-secondary/10 rounded-lg p-3 mb-4",
      fields: [
        { id: "name", label: "Name", type: "text", width: "full" },
        { id: "age", label: "Age", type: "text", width: "half" },
        { id: "gender", label: "Gender", type: "text", width: "half" },
        {
          id: "registrationNumber",
          label: "UHID No",
          type: "text",
          width: "full",
          searchable: true,
        },
        { id: "ipdNumber", label: "IPD No", type: "text", width: "full" },
      ],
    },
    {
      id: "clinicalInfo",
      fields: [
        {
          id: "diagnosis",
          label: "Diagnosis",
          type: "multiselect",
          component: "MultiSelectInput",
          suggestions: "diagnosisTemplate",
          width: "full",
        },
        {
          id: "clinicalSummary",
          label: "Clinical Summary",
          type: "textarea",
          width: "full",
        },
        {
          id: "babyDetails",
          label: "Baby Details",
          type: "babyTable",
          component: "BabyTable",
          width: "full",
        },
        {
          id: "treatment",
          label: "Treatment",
          type: "textarea",
          width: "full",
        },
        {
          id: "medicineAdvice",
          label: "Medicine/Advice",
          type: "medicineAdvice",
          width: "full",
        },
      ],
    },
  ],
};

// Function to get form configuration based on user role or preferences
export const getFormConfig = () => {
  return DEFAULT_FORM_CONFIG;
};

// Helper function to merge custom fields with default configuration
export const mergeFormConfig = (defaultConfig, customConfig) => {
  if (!customConfig) return defaultConfig;

  return {
    sections: defaultConfig.sections.map((section) => {
      const customSection = customConfig.sections.find(
        (s) => s.id === section.id
      );
      if (!customSection) return section;

      return {
        ...section,
        ...customSection,
        fields: section.fields.map((field) => {
          const customField = customSection.fields.find(
            (f) => f.id === field.id
          );
          return customField ? { ...field, ...customField } : field;
        }),
      };
    }),
  };
};
