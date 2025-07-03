import React, { forwardRef } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplate } from "../templates/headertemplate";
// import { opdPrescriptionTemplateString } from "../templatesExperiments/opdPrescription";

export const opdPrescriptionTemplateStringDefault = `(
  patient,
  formData,
  sections,
  hospital,
  ref
) => {
  const FieldRenderer = ({ field }) => {
    const { id, type, label } = field;

    switch (type) {
      case "vitals": {
        const vitalItems = [
          { label: "Temperature", value: formData.vitals?.temperature, unit: "°C" },
          { label: "Heart Rate", value: formData.vitals?.heartRate, unit: "bpm" },
          { label: "Blood Pressure", value: formData.vitals?.bloodPressure, unit: "mmHg" },
          { label: "Respiratory Rate", value: formData.vitals?.respiratoryRate, unit: "bpm" },
          { label: "Height", value: formData.vitals?.height, unit: "cm" },
          { label: "Weight", value: formData.vitals?.weight, unit: "kg" },
          { label: "BMI", value: formData.vitals?.bmi, unit: "" },
          { label: "O2 Saturation", value: formData.vitals?.oxygenSaturation, unit: "%" },
        ];

        const presentVitals = vitalItems.filter(
          (item) => item.value !== undefined && item.value !== null && item.value !== ""
        );

        if (presentVitals.length === 0) return null;

        return React.createElement(
          "div",
          { style: { marginBottom: "10px" } },
          React.createElement(
            "div",
            { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } },
            label
          ),
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px" } },
            presentVitals.map((item, index) =>
              React.createElement(
                "div",
                { key: index, style: { fontSize: "12px" } },
                React.createElement("span", { style: { fontWeight: "bold" } }, \`\${item.label}: \`),
                React.createElement("span", null, \`\${item.value} \${item.unit}\`)
              )
            )
          )
        );
      }

      case "textarea": {
        const value = formData[id];
        if (!value) return null;
        return React.createElement(
          "div",
          { style: { display: "flex", gap: "5px", marginBottom: "10px", alignItems: "flex-start" } },
          React.createElement(
            "span",
            { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", minWidth: '150px' } },
            \`\${label}:\`
          ),
          React.createElement("div", { style: { fontSize: "14px", whiteSpace: "pre-wrap" } }, value)
        );
      }
      
      case "multiselect": {
        const value = formData[id];
        if (!value || value.length === 0) return null;
        const displayValue = value.map((item) => item.name).join(", ");
        if (!displayValue) return null;
        return React.createElement(
          "div",
          { style: { display: "flex", gap: "5px", marginBottom: "10px", alignItems: "flex-start" } },
          React.createElement(
            "span",
            { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", minWidth: '150px' } },
            \`\${label}:\`
          ),
          React.createElement("div", { style: { fontSize: "14px" } }, displayValue)
        );
      }

      case "medicineAdvice": {
        const medications = formData.medications;
        if (!medications || medications.length === 0 || !medications.some((med) => med.name))
          return null;
        return React.createElement(
          "div",
          { style: { marginBottom: "14px" } },
          React.createElement(
            "div",
            { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } },
            "Medications"
          ),
          React.createElement(
            "div",
            { style: { width: "100%" } },
            medications
              .filter((medication) => medication.name)
              .map((medication, index) =>
                React.createElement(
                  "div",
                  {
                    key: index,
                    style: {
                      display: "grid",
                      gridTemplateColumns: "5% 35% 25% 20% 15%",
                      marginBottom: "3px",
                      fontSize: "14px",
                    },
                  },
                  React.createElement("span", null, \`\${index + 1}.\`),
                  React.createElement("span", null, medication.name),
                  React.createElement("span", null, medication.frequency),
                  React.createElement("span", null, \`\${medication.duration} days\`),
                  React.createElement("span", null, medication.remarks)
                )
              )
          )
        );
      }
      case "date": {
        const value = formData[id];
        if (!value) return null;
        return React.createElement(
          "div",
          { style: { display: "flex", gap: "5px", marginBottom: "10px", alignItems: "flex-start" } },
          React.createElement(
            "span",
            { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", minWidth: '150px' } },
            \`\${label}:\`
          ),
          React.createElement("div", { style: { fontSize: "14px" } }, value?.split("-").reverse().join("/"))
        );
      }

      
      default:
        return null;
    }
  };

  return React.createElement(
    "div",
    { ref: ref, style: { width: "100%", padding: "25px" }, className: "print-content" },
    React.createElement(
      "div",
      { className: "print:block mb-2" },
      React.createElement(HospitalHeader, { hospitalInfo: hospital })
    ),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
      React.createElement("div"),
      React.createElement(
        "h1",
        { style: { fontSize: "15px", color: "#1a5f7a", fontWeight: "bold", textAlign: "center", flex: 1 } },
        "OPD Prescription"
      ),
      React.createElement("div", { style: { fontSize: "14px", color: "#2c3e50" } }, format(new Date(), "dd/MM/yyyy"))
    ),
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" } },
      React.createElement(
        "div",
        { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Name:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.name || "")
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Age/Sex:"),
        React.createElement("span", { style: { fontSize: "14px" } }, \`\${patient?.age || ""}/ \${patient?.gender || ""}\`)
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "UHID No:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.registrationNumber || "")
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Contact:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.contactNumber || "")
      )
    ),
    sections.map((section) =>
      section.fields.map((field) =>
        React.createElement(FieldRenderer, { key: field.id, field: field })
      )
    ),
    React.createElement(
      "div",
      { style: { marginTop: "20px", textAlign: "right", fontSize: "14px" } },
      "Doctor's Signature"
    )
  );
}`;

const OPDPrescriptionTemplate = forwardRef((props, ref) => {
  const { patient, formData, field, hospital } = props;
 

  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplateArray
  );
  const headerTemplateString =
    headerTemplates?.length > 0 ? headerTemplates[0].value : headerTemplate;

  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplate
  );

  const templateFunction = new Function(
    "React",
    "HospitalHeader",
    "format",
    `return (${opdPrescriptionTemplateStringDefault});`
  );

  try {
    const ComponentFunction = templateFunction(React, HospitalHeader, format);

    return ComponentFunction(patient, formData, field, hospital, ref);
  } catch (error) {
    console.error("Error rendering OPD prescription:", error);
    return React.createElement(
      "div",
      null,
      "Error rendering OPD prescription template"
    );
  }
});

export default OPDPrescriptionTemplate;
