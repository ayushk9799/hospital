import React, { forwardRef } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { dischargeSummaryTemplateStringDefault } from "../../../templates/dischargesummary";
import { dischargeSummaryTemplateString } from "../../../templatesExperiments/dischargeSummaryExperimental";
import { headerTemplateString } from "../../../templates/headertemplate";

// Keep the styles object as is
const styles = {
  title: {
    fontSize: "15px",
    textAlign: "center",
    marginBottom: "5px",
    color: "#1a5f7a",
    fontWeight: "bold",
  },
  section: {
    marginBottom: "3px",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#34495e",
    width: "20%",
  },
  sectionContent: {
    fontSize: "12px",
    color: "#2c3e50",
    width: "80%",
    marginLeft: "5px",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
  },
  label: {
    fontSize: "14px",
    color: "black",
    width: "40%",
    fontWeight: "bold",
  },
  value: {
    fontSize: "11px",
    color: "#2c3e50",
    width: "60%",
  },
  text: {
    fontSize: "11px",
    marginLeft: "150px",
  },
  patientInfoSection: {
    width: "100%",
  },
  column: {
    width: "33%",
    paddingRight: "5px",
  },
  infoItem: {
    flex: 1,
    flexBasis: "33%",
    marginBottom: "3px",
  },
  investigationsSection: {
    marginBottom: "5px",
  },
  investigationContainer: {
    marginLeft: "5px",
    marginBottom: "5px",
  },
  investigationTitle: {
    fontSize: "9px",
    marginBottom: "2px",
    fontWeight: "bold",
  },
  investigationRow: {
    display: "flex",
    flexDirection: "row",
    fontSize: "9px",
    marginBottom: "1px",
  },
  investigationCell1: {
    width: "60%",
    fontSize: "12px",
  },
  investigationCell2: {
    width: "20%",
    fontSize: "12px",
  },
  columnContainer: {
    width: "49%",
    paddingRight: "2px",
  },
};

// Helper functions to be used in template
const formatDate = (date) => {
  if (!date) return "--";
  return format(new Date(date), "dd-MM-yyyy");
};

const hasValue = (obj) => {
  if (!obj) return false;
  return !Object.values(obj).every(
    (value) => value === "" || value === null || value === undefined
  );
};

// Template string for the discharge summary
// export const dischargeSummaryTemplateString = `
// (formData, patient, hospital, ref) => {
//   const hasComorbidities = formData.comorbidities && formData.comorbidities.some((c) => c.name);
//   const hasMedicineAdvice = formData.medicineAdvice && formData.medicineAdvice.some((m) => m.name || m.dosage || m.duration);
//   const comorbiditiesString = formData.comorbidities?.filter((c) => c.name).map((c) => c.name).join(", ");

//   const appendComorbidities = (content, type) => {
//     if (!hasComorbidities || formData.comorbidityHandling === "separate") {
//       return content;
//     }
//     if (type === formData.comorbidityHandling) {
//       return \`\${content}\${content ? ", " : ""} \${comorbiditiesString}\`;
//     }
//     return content;
//   };

//   return React.createElement("div", { ref: ref, style: styles.page, className: "print-content" },
//     React.createElement("div", { className: " print:block mb-2" },
//       //React.createElement(HospitalHeader, { hospitalInfo: hospital })
//        React.createElement("div", { className: "mb-2 border-b border-[#000000] pb-2" },
//   React.createElement("div", { 
//     style: { 
//       display: "flex", 
//       alignItems: "flex-start",
//       gap: "10px",
//       marginBottom: "10px",
//       paddingTop: "10px"
//     } 
//   },
//     React.createElement("img", {
//       src: hospital?.hospitalLogo2Blob,
//       alt: "Clinic Logo",
//       style: {
//         width: "140px",
//         height: "120px",
//         objectFit: "contain"
//       }
//     }),
//     React.createElement("div", { style: { flex: 1 } },
//       React.createElement("h1", { 
//         className: "text-[72px] tracking-wide text-[#1a5f7a] uppercase font-bold",
//         style: { 
//         marginTop:"-20px"
//         }
//       }, hospital?.name),
//       React.createElement("div", { 
//         style: {
//           display: "flex",
//           fontSize: "12px",
//           color: "#333333",
//           marginTop: "5px",
//           gap: "10px"
//         }
//       },
//         React.createElement("div", {
//           style: {
//             border: "2px solid #000",
//             borderRadius: "30px",
//             padding: "4px 12px",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             flexDirection: "column",
//           }
//         },
//           React.createElement("div", { style: { fontSize: "14px" }, className:"font-bold" }, 
//             "गोलपत्थर से उत्तर, मुरारपुर मोड़ जी0 बी0 रोड, गया"
//           ),
//           React.createElement("div", { style: { fontSize: "16px" }, className:"font-bold" }, 
//             "Mob:- 7463811885"
//           )
//         ),
//         React.createElement("div", {
//           style: {
//             border: "2px solid #000",
//             borderRadius: "30px",
//             padding: "4px 25px",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             flexDirection: "column"
//           }
//         },
//           React.createElement("div", { style: { fontSize: "14px" }, className:"font-bold" }, 
//             "जेल गेट के सामने, गया"
//           ),
//           React.createElement("div", { style: { fontSize: "16px" }, className:"font-bold" }, 
//             "Mob:- 9199029251"
//           )
//         )
//       )
//     )
//   )
// ),
//     ),
//     React.createElement("div", { style: styles.title }, "Discharge Summary"),
    
//     // Patient Info Section
//     React.createElement("div", { style: { ...styles.section } },
//       React.createElement("div", { style: { ...styles.patientInfoSection } },
//         React.createElement("div", { style: { ...styles.row, marginBottom: "2px" } },
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "Name: "),
//             React.createElement("span", { style: styles.value }, patient?.name || "--")
//           ),
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "Age/Gender: "),
//             React.createElement("span", { style: styles.value }, 
//               patient?.age && patient?.gender ? \`\${patient?.age} yrs/\${patient?.gender}\` : "--"
//             )
//           ),
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "UHID No: "),
//             React.createElement("span", { style: styles.value }, patient?.registrationNumber || "--")
//           )
//         ),
//         React.createElement("div", { style: { ...styles.row, marginBottom: "2px" } },
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "IPD No: "),
//             React.createElement("span", { style: styles.value }, patient?.ipdNumber || "--")
//           ),
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "Admit Date: "),
//             React.createElement("span", { style: styles.value }, formatDate(formData.admissionDate))
//           ),
//           React.createElement("span", { style: styles.infoItem },
//             React.createElement("span", { style: styles.label }, "Discharge Date: "),
//             React.createElement("span", { style: styles.value }, formatDate(formData.dateDischarged))
//           )
//         )
//       )
//     ),

//     // Diagnosis Section
//     formData.diagnosis && React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Diagnosis:"),
//       React.createElement("span", { style: styles.sectionContent }, 
//         appendComorbidities(formData.diagnosis, "diagnosis")
//       )
//     ),

//     // Clinical Summary Section
//     formData.clinicalSummary && React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Clinical Summary:"),
//       React.createElement("span", { style: styles.sectionContent }, 
//         appendComorbidities(formData.clinicalSummary, "clinical_summary")
//       )
//     ),

//     // Comorbidities Section (if separate)
//     (formData.comorbidityHandling === "separate" && hasComorbidities) && 
//     React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Comorbidities:"),
//       React.createElement("span", { style: styles.sectionContent }, comorbiditiesString)
//     ),

//     // Admission Vitals Section
//     hasValue(formData.vitals?.admission) && React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Admission Vitals:"),
//       React.createElement("span", { style: styles.sectionContent },
//         [
//           formData.vitals.admission.bloodPressure && \`BP: \${formData.vitals.admission.bloodPressure} mmHg\`,
//           formData.vitals.admission.heartRate && \`Heart Rate: \${formData.vitals.admission.heartRate} bpm\`,
//           formData.vitals.admission.temperature && \`Temperature: \${formData.vitals.admission.temperature}°C\`,
//           formData.vitals.admission.oxygenSaturation && \`O2 Saturation: \${formData.vitals.admission.oxygenSaturation}%\`,
//           formData.vitals.admission.respiratoryRate && \`Respiratory Rate: \${formData.vitals.admission.respiratoryRate} breaths/min\`
//         ].filter(Boolean).join(", ")
//       )
//     ),

//     // Treatment Section
//     formData.treatment && React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Treatment:"),
//       React.createElement("span", { style: styles.sectionContent }, formData.treatment)
//     ),

//     // Medicine/Advice Section
//     hasMedicineAdvice && React.createElement("div", { style: styles.section },
//       React.createElement("span", { style: styles.sectionTitle }, "Medicine/Advice:"),
//       React.createElement("div", { style: { marginLeft: "150px" } },
//         formData.medicineAdvice.map((med, index) => 
//           (med.name || med.dosage || med.duration) && 
//           React.createElement("div", { 
//             key: index,
//             style: { fontSize: "11px", marginBottom: "2px" }
//           },
//             React.createElement("span", { style: { display: "inline-block", width: "20px" } },
//               \`\${index + 1}.\`
//             ),
//             React.createElement("span", { style: { display: "inline-block", minWidth: "200px" } },
//               med.name
//             ),
//             med.dosage && React.createElement("span", { style: { display: "inline-block", minWidth: "150px" } },
//               \`Dosage: \${med.dosage}\`
//             ),
//             med.duration && React.createElement("span", { style: { display: "inline-block" } },
//               \`\${med.duration} Days\`
//             )
//           )
//         )
//       )
//     ),

//     // Doctor's Signature
//     React.createElement("div", { 
//       style: { width: "100%", textAlign: "right", marginTop: "10px" }
//     },
//       React.createElement("span", { 
//         style: { fontSize: "13px", fontWeight: "bold" }
//       }, "Doctor's Signatuure")
//     )
//   );
// }`;

// Create the dynamic component
const DischargeSummaryPDF = forwardRef((props, ref) => {
  const { formData, patient, hospital } = props;
  const dischargeSummaryTemplateStringdatabase = useSelector(
    (state) => state.templates.dischargeSummaryTemplate
  );
  // Create a function that returns JSX from the template string
  const templateFunction = new Function(
    "React",
    "styles",
    "HospitalHeader",
    "formatDate",
    "hasValue",
    `return (${
      dischargeSummaryTemplateStringdatabase||dischargeSummaryTemplateStringDefault
    });`
  );
  const headerTemplateString = useSelector(
    (state) => state.templates.headerTemplate
  );
  const HospitalHeader = createDynamicComponentFromString(headerTemplateString);
  try {
    // Get the component function
    const ComponentFunction = templateFunction(
      React,
      styles,
      HospitalHeader,
      formatDate,
      hasValue
    );
    // Execute the component function with the props
    return ComponentFunction(formData, patient, hospital, ref);
  } catch (error) {
    console.error("Error rendering dynamic discharge summary:", error);
    return React.createElement(
      "div",
      null,
      "Error rendering discharge summary template"
    );
  }
});

export default DischargeSummaryPDF;
