export const dischargeSummaryTemplateStringDefault = `
(formData, patient, hospital, ref) => {
  const hasComorbidities = formData.comorbidities && formData.comorbidities.some((c) => c.name);
  const hasMedicineAdvice = formData.medicineAdvice && formData.medicineAdvice.some((m) => m.name);
  const hasInvestigations = formData.investigations && formData.investigations.some((i) => i.name || i.category);
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

  const formatLabel = (label) => {
    if (!label) return "";
    const regex = /^\([^)]+\)|^(?:\\S+\\s?){1,3}/;
    const match = label.match(regex);
    return match ? match[0].trim() : label;
  };

  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
  };

  const hasValue = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(value => value !== "" && value !== null && value !== undefined);
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
        ),
        React.createElement("div", { style: styles.row },
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Room: "),
            React.createElement("span", { style: styles.value }, patient?.roomNumber || "--")
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Contact: "),
            React.createElement("span", { style: styles.value }, patient?.contactNumber || "--")
          ),
          React.createElement("span", { style: styles.infoItem },
            React.createElement("span", { style: styles.label }, "Address: "),
            React.createElement("span", { style: { ...styles.value, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" } },
              patient?.address || "--"
            )
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

    // Condition on Admission Section
    formData.conditionOnAdmission && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Condition on Admission:"),
      React.createElement("span", { style: styles.sectionContent }, formData.conditionOnAdmission)
    ),

    // Admission Vitals Section
    (formData.vitals?.admission && hasValue(formData.vitals.admission)) && 
    React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Admission Vitals:"),
      React.createElement("span", { style: styles.sectionContent },
        React.createElement("span", null,
          formData.vitals.admission.bloodPressure && React.createElement("span", null,
            "BP: ", React.createElement("strong", null, formData.vitals.admission.bloodPressure), " mmHg, "
          ),
          formData.vitals.admission.heartRate && React.createElement("span", null,
            "Heart Rate: ", React.createElement("strong", null, formData.vitals.admission.heartRate), " bpm, "
          ),
          formData.vitals.admission.temperature && React.createElement("span", null,
            "Temperature: ", React.createElement("strong", null, formData.vitals.admission.temperature), "°C, "
          ),
          formData.vitals.admission.oxygenSaturation && React.createElement("span", null,
            "O", React.createElement("sub", null, "2"), " Saturation: ",
            React.createElement("strong", null, formData.vitals.admission.oxygenSaturation), "%, "
          ),
          formData.vitals.admission.respiratoryRate && React.createElement("span", null,
            "Respiratory Rate: ", React.createElement("strong", null, formData.vitals.admission.respiratoryRate), " breaths/min"
          )
        )
      )
    ),

    // Investigations Section
    hasInvestigations && React.createElement("div", { style: { marginBottom: "3px" } },
      React.createElement("div", null,
        React.createElement("span", { style: styles.sectionTitle }, "Investigations")
      ),
      React.createElement("div", { 
        style: { 
          marginLeft: "15px", 
          marginTop: "5px", 
          width: "100%" 
        } 
      },
        formData.investigations.map((investigation, index) => {
          const hasFindings = investigation.report?.findings && 
            Object.values(investigation.report.findings).some(value => value);
          const reportEntries = Object.entries(investigation.report || {})
            .filter(([_, testData]) => testData.value);
          const halfLength = Math.ceil(reportEntries.length / 2);

          return React.createElement("div", {
            key: index,
            style: {
              marginLeft: "5px",
              marginBottom: "5px",
              display: "flex",
              flexDirection: hasFindings ? "row" : "column"
            }
          },
            React.createElement("div", null,
              React.createElement("div", { 
                style: { 
                  fontSize: "9px", 
                  marginBottom: "2px", 
                  fontWeight: "bold" 
                } 
              },
                \`\${investigation.name.toUpperCase()} (\${formatDate(investigation.date)})\`
              )
            ),
            hasFindings ? 
              React.createElement("div", { style: { display: "flex", flexDirection: "row" } },
                React.createElement("div", null,
                  investigation.report.findings && React.createElement("div", {
                    style: {
                      marginLeft: "50px",
                      fontSize: "12px"
                    }
                  },
                    React.createElement("div", { style: { width: "100%", fontSize: "12px",border:"1px solid red" } },
                      React.createElement("span", null, investigation.report.findings.value)
                    )
                  )
                )
              ) :
              React.createElement("div", { style: { display: "flex", flexDirection: "row" } },
                React.createElement("div", { style: { width: "50%" } },
                  reportEntries.slice(0, halfLength).map(([testName, testData]) =>
                    testData.value && React.createElement("div", {
                      key: testName,
                      style: { 
                        display: "flex", 
                        flexDirection: "row", 
                        fontSize: "9px", 
                        marginBottom: "1px",
                        marginLeft: "5px" 
                      }
                    },
                      React.createElement("div", { style: { width: "60%", fontSize: "12px" } },
                        React.createElement("span", null, formatLabel(testData.label) || testName)
                      ),
                      React.createElement("div", { style: { width: "20%", fontSize: "12px" } },
                        React.createElement("span", null, testData.value)
                      ),
                      testData.unit && React.createElement("div", { style: { width: "20%", fontSize: "12px" } },
                        React.createElement("span", null, testData.unit)
                      )
                    )
                  )
                ),
                React.createElement("div", { style: { width: "50%" } },
                  reportEntries.slice(halfLength).map(([testName, testData]) =>
                    testData.value && React.createElement("div", {
                      key: testName,
                      style: { 
                        display: "flex", 
                        flexDirection: "row", 
                        fontSize: "9px", 
                        marginBottom: "1px",
                        marginLeft: "5px" 
                      }
                    },
                      React.createElement("div", { style: { width: "60%", fontSize: "12px" } },
                        React.createElement("span", null, formatLabel(testData.label) || testName)
                      ),
                      React.createElement("div", { style: { width: "20%", fontSize: "12px" } },
                        React.createElement("span", null, testData.value)
                      ),
                      testData.unit && React.createElement("div", { style: { width: "20%", fontSize: "12px" } },
                        React.createElement("span", null, testData.unit)
                      )
                    )
                  )
                )
              )
          );
        })
      )
    ),

    // Treatment Section
    formData.treatment && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Treatment:"),
      React.createElement("span", { style: styles.sectionContent }, formData.treatment)
    ),

    // Discharge Vitals Section
    (formData.vitals?.discharge && hasValue(formData.vitals.discharge)) && 
    React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Discharge Vitals:"),
      React.createElement("span", { style: styles.sectionContent },
        React.createElement("span", null,
          formData.vitals.discharge.bloodPressure && React.createElement("span", null,
            "BP: ", React.createElement("strong", null, formData.vitals.discharge.bloodPressure), " mmHg, "
          ),
          formData.vitals.discharge.heartRate && React.createElement("span", null,
            "Heart Rate: ", React.createElement("strong", null, formData.vitals.discharge.heartRate), " bpm, "
          ),
          formData.vitals.discharge.temperature && React.createElement("span", null,
            "Temperature: ", React.createElement("strong", null, formData.vitals.discharge.temperature), "°C, "
          ),
          formData.vitals.discharge.oxygenSaturation && React.createElement("span", null,
            "O", React.createElement("sub", null, "2"), " Saturation: ",
            React.createElement("strong", null, formData.vitals.discharge.oxygenSaturation), "%, "
          ),
          formData.vitals.discharge.respiratoryRate && React.createElement("span", null,
            "Respiratory Rate: ", React.createElement("strong", null, formData.vitals.discharge.respiratoryRate), " breaths/min"
          )
        )
      )
    ),

    // Condition on Discharge Section
    formData.conditionOnDischarge && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Condition on Discharge:"),
      React.createElement("span", { style: styles.sectionContent }, formData.conditionOnDischarge)
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

    // Additional Notes Section
    formData.notes && React.createElement("div", { style: styles.section },
      React.createElement("span", { style: styles.sectionTitle }, "Additional Notes:"),
      React.createElement("span", { style: styles.sectionContent }, formData.notes)
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
