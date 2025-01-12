
export const dischargeSummaryTemplateStringDefault = `
(formData, patient, hospital, ref) => {
  const hasComorbidities = formData.comorbidities && formData.comorbidities.some((c) => c.name);
  const hasMedicineAdvice = formData.medicineAdvice && formData.medicineAdvice.some((m) => m.name || m.dosage || m.duration);
  const comorbiditiesString = formData.comorbidities?.filter((c) => c.name).map((c) => c.name).join(", ");

  const appendComorbidities = (content, type) => {
    if (!hasComorbidities || formData.comorbidityHandling === "separate") {
      return content;
    }
    if (type === formData.comorbidityHandling) {
      return \`\${content}\${content ? ", " : ""} \${comorbiditiesString}\`;
    }
    return content;
  };

  return React.createElement("div", { ref: ref, style: styles.page, className: "print-content" },
    React.createElement("div", { className: " print:block mb-2" },
      React.createElement(HospitalHeader, { hospitalInfo: hospital })
    ),
    React.createElement("div", { style: styles.title }, "Discharge Summary"),
    
    // Patient Info Section
    React.createElement("div", { style: { ...styles.section } },
      React.createElement("div", { style: { ...styles.patientInfoSection } },
        React.createElement("div", { style: { ...styles.row, marginBottom: "2px" } },
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Name: "),
            React.createElement("span", { style: styles.value }, patient?.name || "--")
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Age/Gender: "),
            React.createElement("span", { style: styles.value }, 
              patient?.age && patient?.gender ? \`\${patient?.age} yrs/\${patient?.gender}\` : "--"
            )
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "UHID No: "),
            React.createElement("span", { style: styles.value }, patient?.registrationNumber || "--")
          )
        ),
        React.createElement("div", { style: { ...styles.row, marginBottom: "2px" } },
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "IPD No: "),
            React.createElement("span", { style: styles.value }, patient?.ipdNumber || "--")
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Admit Date: "),
            React.createElement("span", { style: styles.value }, formatDate(formData.admissionDate))
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Discharge Date: "),
            React.createElement("span", { style: styles.value }, formatDate(formData.dateDischarged))
          )
        )
      )
    ),

    // Diagnosis Section
    formData.diagnosis && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Diagnosis:"),
      React.createElement("span", { style: styles.sectionContent }, 
        appendComorbidities(formData.diagnosis, "diagnosis")
      )
    ),

    // Clinical Summary Section
    formData.clinicalSummary && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Clinical Summary:"),
      React.createElement("span", { style: styles.sectionContent }, 
        appendComorbidities(formData.clinicalSummary, "clinical_summary")
      )
    ),

    // Comorbidities Section (if separate)
    (formData.comorbidityHandling === "separate" && hasComorbidities) && 
    React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Comorbidities:"),
      React.createElement("span", { style: styles.sectionContent }, comorbiditiesString)
    ),

    // Admission Vitals Section
    hasValue(formData.vitals?.admission) && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Admission Vitals:"),
      React.createElement("span", { style: styles.sectionContent },
        [
          formData.vitals.admission.bloodPressure && \`BP: \${formData.vitals.admission.bloodPressure} mmHg\`,
          formData.vitals.admission.heartRate && \`Heart Rate: \${formData.vitals.admission.heartRate} bpm\`,
          formData.vitals.admission.temperature && \`Temperature: \${formData.vitals.admission.temperature}°C\`,
          formData.vitals.admission.oxygenSaturation && \`O2 Saturation: \${formData.vitals.admission.oxygenSaturation}%\`,
          formData.vitals.admission.respiratoryRate && \`Respiratory Rate: \${formData.vitals.admission.respiratoryRate} breaths/min\`
        ].filter(Boolean).join(", ")
      )
    ),

    // Treatment Section
    formData.treatment && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Treatment:"),
      React.createElement("span", { style: styles.sectionContent }, formData.treatment)
    ),

    // Medicine/Advice Section
    hasMedicineAdvice && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Medicine/Advice:"),
      React.createElement("div", { style: { marginLeft: "150px" } },
        formData.medicineAdvice.map((med, index) => 
          (med.name || med.dosage || med.duration) && 
          React.createElement("div", { 
            key: index,
            style: { fontSize: "11px", marginBottom: "2px" }
          },
            React.createElement("span", { style: { display: "inline-block", width: "20px" } },
              \`\${index + 1}.\`
            ),
            React.createElement("span", { style: { display: "inline-block", minWidth: "200px" } },
              med.name
            ),
            med.dosage && React.createElement("span", { style: { display: "inline-block", minWidth: "150px" } },
              \`Dosage: \${med.dosage}\`
            ),
            med.duration && React.createElement("span", { style: { display: "inline-block" } },
              \`\${med.duration} Days\`
            )
          )
        )
      )
    ),

    // Doctor's Signature
    React.createElement("div", { 
      style: { width: "100%", textAlign: "right", marginTop: "10px" }
    },
      React.createElement("span", { 
        style: { fontSize: "13px", fontWeight: "bold" }
      }, "Doctor's Signature")
    )
  );
}`;