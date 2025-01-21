import React, { forwardRef } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplate } from "../templates/headertemplate";
// import { opdPrescriptionTemplateString } from "../templatesExperiments/opdPrescription";
export const opdPrescriptionTemplateStringDefault = `( patient, vitals, prescription, labTests, selectedComorbidities, hospital, ref) => {
  const capitalizeAll = (str) => {
    return str?.toUpperCase() || '';
  };

  const VitalItem = ({ label, value, unit }) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return React.createElement("div", { style: { fontSize: "12px" } },
      React.createElement("div", null,
        React.createElement("span", { style: { fontWeight: "bold" } },
          label === "O2" ? React.createElement(React.Fragment, null, "O", React.createElement("sub", null, "2"), "%") : capitalizeAll(label),
          ": "
        ),
        React.createElement("span", null,
          value, " ", unit
        )
      )
    );
  };

  const vitalItems = [
    { label: "Temperature", value: vitals.temperature, unit: "°C" },
    { label: "Heart Rate", value: vitals.heartRate, unit: "bpm" },
    { label: "Blood Pressure", value: vitals.bloodPressure, unit: "mmHg" },
    { label: "Respiratory Rate", value: vitals.respiratoryRate, unit: "bpm" },
    { label: "Height", value: vitals.height, unit: "cm" },
    { label: "Weight", value: vitals.weight, unit: "kg" },
    { label: "BMI", value: vitals.bmi, unit: "" },
    { label: "O2", value: vitals.oxygenSaturation, unit: "%" },
  ];

  const presentVitals = vitalItems.filter(item => 
    item.value !== undefined && item.value !== null && item.value !== ''
  );

  return React.createElement("div", { ref: ref, style: { width: "100%",padding: "25px" } ,className: "print-content"},
    
         React.createElement("div", { className: " print:block mb-2" },
      React.createElement(HospitalHeader, { hospitalInfo: hospital })
    ),
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
      React.createElement("div"),
      React.createElement("h1", { style: { fontSize: "15px", color: "#1a5f7a", fontWeight: "bold", textAlign: "center", flex: 1 } }, "OPD Prescription"),
      React.createElement("div", { style: { fontSize: "14px", color: "#2c3e50" } }, format(new Date(), "dd/MM/yyyy"))
    ),

    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" } },
      React.createElement("div", { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Name:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.name || '')
      ),
      React.createElement("div", { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Age/Sex:"),
        React.createElement("span", { style: { fontSize: "14px" } }, \`\${patient?.age || ''}/ \${patient?.gender || ''}\`)
      ),
      React.createElement("div", { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "UHID No:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.registrationNumber || '')
      ),
      React.createElement("div", { style: { display: "flex", gap: "5px" } },
        React.createElement("span", { style: { fontWeight: "bold", fontSize: "14px" } }, "Contact:"),
        React.createElement("span", { style: { fontSize: "14px" } }, patient?.contactNumber || '')
      )
    ),

    presentVitals.length > 0 && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Vitals"),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px" } },
        presentVitals.map((item, index) => 
          React.createElement(VitalItem, { key: index, ...item })
        )
      )
    ),

    prescription?.chiefComplaints && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Chief Complaints"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.chiefComplaints)
    ),

    prescription?.diagnosis && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Diagnosis"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.diagnosis)
    ),

    selectedComorbidities?.length > 0 && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Comorbidities"),
      selectedComorbidities.map((comorbidity, index) =>
        React.createElement("div", { key: index, style: { fontSize: "14px" } }, comorbidity.name)
      )
    ),
    labTests?.length > 0 && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Lab Tests"),
      React.createElement("div", { style: { fontSize: "14px" } }, labTests.join(', '))
    ),
 prescription?.treatment && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Treatment"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.treatment)
    ),

prescription?.medications?.length > 0 &&
  React.createElement("div", { style: { marginBottom: "14px" } },
    prescription.medications.some(medication => medication.name) && (
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Medications")
    ),
    React.createElement("div", { style: { width: "100%" } },
      prescription.medications
        .filter(medication => medication.name) // Only include medications with a name
        .map((medication, index) =>
          React.createElement("div", { key: index, style: { display: "grid", gridTemplateColumns: "5% 35% 30% 30%", marginBottom: "3px", fontSize: "14px" } },
            React.createElement("span", null, \`\${index + 1}.\`),
            React.createElement("span", null, medication.name),
            React.createElement("span", null, medication.frequency),
            React.createElement("span", null, \`\${medication.duration} days\`)
          )
        )
    )
  ),
prescription?.additionalInstructions && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Notes"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.additionalInstructions)
    ),
    prescription?.advice && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Advice"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.advice)
    ),

   

    prescription?.followUp && React.createElement("div", { style: { marginBottom: "10px" } },
      React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#34495e", marginBottom: "5px" } }, "Follow Up"),
      React.createElement("div", { style: { fontSize: "14px" } }, prescription.followUp)
    ),

    React.createElement("div", { style: { marginTop: "20px", textAlign: "right", fontSize: "14px" } }, "Doctor's Signature")
  );
}`;

const OPDPrescriptionTemplate = forwardRef((props, ref) => {
  const {
    patient,
    vitals,
    prescription,
    labTests,
    selectedComorbidities,
    hospital,
  } = props;
  const headerTemplateString = useSelector(
    (state) => state.templates.headerTemplate
  );
  const opdPrescriptionTemplateDatabase = useSelector(
    (state) => state.templates.opdPrescriptionTemplate
  );
  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplate
  );
  // Create a function that returns JSX from the template string
  const templateFunction = new Function(
    "React",
    "HospitalHeader",
    "format",

    `return (${
      opdPrescriptionTemplateDatabase || opdPrescriptionTemplateStringDefault
    });`
  );

  try {
    // Get the component function
    const ComponentFunction = templateFunction(React, HospitalHeader, format);
    // Execute the component function with the props
    return ComponentFunction(
      patient,
      vitals,
      prescription,
      labTests,
      selectedComorbidities,
      hospital,
      ref
    );
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
