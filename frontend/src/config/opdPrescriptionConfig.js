export const DEFAULT_PRESCRIPTION_FORM_CONFIG = {
  sections: [
    {
      id: "prescriptionInfo",
      title: "Prescription Details",
      className: "bg-secondary/10 rounded-lg p-3 mb-4",
      fields: [
        {
          id: "chiefComplaints",
          label: "Chief Complaints",
          type: "textarea",
        },
        {
          id: "diagnosis",
          label: "Diagnosis",
          type: "multiselect",
          component: "MultiSelectInput",
          suggestions: "diagnosisTemplate",
        },
        {
          id: "comorbidities",
          label: "Comorbidities",
          type: "multiselect",
          component: "MultiSelectInput",
          suggestions: "comorbidities",
          extraComponent: "ComorbidityHandling",
        },
        {
          id: "vitals",
          label: "Vitals",
          type: "vitals",
        },
        {
          id: "labTests",
          label: "Lab Tests",
          type: "multiselect",
          suggestions: "labTests",
        },
        {
          id: "treatment",
          label: "Treatment",
          type: "textarea",
        },
        {
          id: "medications",
          label: "Medications",
          type: "medicineAdvice",
        },
        {
          id: "additionalInstructions",
          label: "Notes",
          type: "textarea",
        },
        {
          id: "advice",
          label: "Advice",
          type: "textarea",
        },
        {
          id: "followUp",
          label: "Follow Up",
          type: "date",
        },
      ],
    },
  ],
};

export const getPrescriptionFormConfig = () => {
  return DEFAULT_PRESCRIPTION_FORM_CONFIG;
};
