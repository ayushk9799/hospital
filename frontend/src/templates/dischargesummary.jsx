export const dischargeSummaryTemplateStringDefault = `
(formData, patient, hospital,formConfig, ref) => {
  const hasComorbidities = formData.comorbidities && (Array.isArray(formData.comorbidities)?formData.comorbidities.some((c) => c.name):true);
  const hasMedicineAdvice = formData.medicineAdvice && formData.medicineAdvice.some((m) => m.name);
  const hasInvestigations = formData.investigations && formData.investigations.some((i) => i.name || i.category);
  const comorbiditiesString = Array.isArray(formData.comorbidities)?formData.comorbidities?.filter((c) => c.name).map((c) => c.name).join(", "):formData.comorbidities;

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
              patient?.age && patient?.gender ? \`\${patient?.age}/\${patient?.gender}\` : "--"
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

export const dischargeNLL = `(formData, patient, hospital, formConfig, ref) => {

  const hasValue = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(value => value !== "" && value !== null && value !== undefined);
  };

  // Get field value helper
  const getFieldValue = (field) => {
    if (field.id in patient) {
      return patient[field.id];
    }

    if (field.id.includes(".")) {
      return field.id.split(".").reduce((obj, key) => obj?.[key], formData);
    }

    switch (field.type) {
      case "multiselect":
        if (field.id === "diagnosis") {
          return formData.diagnosis ? formData.diagnosis.split(", ").map(d => ({ name: d })) : [];
        }
        if (field.id === "comorbidities") {
          return formData.comorbidities || [];
        }
        return formData[field.id] || [];
      case "investigations":
        return formData.investigations || [];
      case "medicineAdvice":
        return formData[field.id] || [];
      case "vitals":
        return formData.vitals?.[field.prefix] || {};
      default:
        return formData[field.id];
    }
  };


  // Field renderer with inline styles
  const renderField = (field) => {
    const value = getFieldValue(field);
   
    if (!field || !field.id) return null;

    switch (field.type) {
      case "vitals":
        const vitalsData = formData.vitals?.[field.prefix];
        return hasValue(vitalsData) && React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, field.label),
          React.createElement("div", { style: { fontSize: '14px', color: '#2c3e50', width: '80%', marginLeft: '5px', whiteSpace: 'pre-line' } },
            [
              vitalsData.bloodPressure && \`BP: \${vitalsData.bloodPressure} mmHg\`,
              vitalsData.heartRate && \`Heart Rate: \${vitalsData.heartRate} bpm\`,
              vitalsData.temperature && \`Temperature: \${vitalsData.temperature}°C\`,
              vitalsData.oxygenSaturation && \`O2 Saturation: \${vitalsData.oxygenSaturation}%\`,
              vitalsData.respiratoryRate && \`Respiratory Rate: \${vitalsData.respiratoryRate} breaths/min\`
            ].filter(Boolean).join(", ")
          )
        );

      case "investigations":
        return value && value.length > 0 && React.createElement("div", null,
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, field.label),
          React.createElement("div", { style: { border: '1px solid #ccc' } },
            React.createElement("div", { style: { marginLeft: '10px' } },
              value.filter(inv => inv.name && inv.report).map((investigation, index) => {
                const hasFindings = investigation.report?.findings && 
                  Object.values(investigation.report.findings).some(value => value);
                const hasImpression = investigation.report?.impression && 
                  Object.values(investigation.report.impression).some(value => value);
                const reportEntries = Object.entries(investigation.report || {})
                  .filter(([_, testData]) => testData.value);
                const halfLength = Math.ceil(reportEntries.length / 2);

                return React.createElement("div", {
                  key: index,
                  style: { 
                    marginLeft: '5px', 
                    marginBottom: '3px', 
                    display: 'flex', 
                    flexDirection: hasFindings || hasImpression ? 'row' : 'column' 
                  }
                },
                  React.createElement("div", null,
                    React.createElement("div", { 
                      style: { fontSize: '10px', marginBottom: '2px', fontWeight: 'bold' }
                    },
                      \`\${investigation.name.toUpperCase()} (\${formatDate(investigation.date)})\`
                    )
                  ),
                  (hasFindings || hasImpression) ? 
                    React.createElement("div", { style: { display: 'flex', flexDirection: 'row', width: '100%' } },
                      React.createElement("div", { style: { width: '100%' } },
                        investigation.report.findings && React.createElement("div", {
                          style: { marginLeft: '50px', fontSize: '9px', width: '100%' }
                        },
                          React.createElement("div", { style: { width: '100%', fontSize: '9px' } },
                            React.createElement("span", null, investigation.report.findings.value)
                          )
                        ),
                        investigation.report.impression && React.createElement("div", {
                          style: { marginLeft: '50px', fontSize: '9px', width: '100%', marginTop: '2px' }
                        },
                          React.createElement("div", { style: { width: '100%', fontSize: '9px' } },
                            React.createElement("span", null, investigation.report.impression.value)
                          )
                        )
                      )
                    ) :
                    React.createElement("div", { style: { display: 'flex', flexDirection: 'row' } },
                      React.createElement("div", { style: { width: '50%' } },
                        reportEntries.slice(0, halfLength).map(([testName, testData]) =>
                          testData.value && React.createElement("div", {
                            key: testName,
                            style: { display: 'flex', flexDirection: 'row', fontSize: '9px', marginBottom: '1px', marginLeft: '5px' }
                          },
                            React.createElement("div", { style: { width: '60%', fontSize: '9px' } },
                              React.createElement("span", null, formatLabel(testData.label) || testName)
                            ),
                            React.createElement("div", { style: { width: '20%', fontSize: '9px' } },
                              React.createElement("span", null, testData.value)
                            ),
                            testData.unit && React.createElement("div", { style: { width: '20%', fontSize: '9px' } },
                              React.createElement("span", null, testData.unit)
                            )
                          )
                        )
                      ),
                      React.createElement("div", { style: { width: '50%' } },
                        reportEntries.slice(halfLength).map(([testName, testData]) =>
                          testData.value && React.createElement("div", {
                            key: testName,
                            style: { display: 'flex', flexDirection: 'row', fontSize: '9px', marginBottom: '1px', marginLeft: '5px' }
                          },
                            React.createElement("div", { style: { width: '60%', fontSize: '9px' } },
                              React.createElement("span", null, formatLabel(testData.label) || testName)
                            ),
                            React.createElement("div", { style: { width: '20%', fontSize: '9px' } },
                              React.createElement("span", null, testData.value)
                            ),
                            testData.unit && React.createElement("div", { style: { width: '20%', fontSize: '9px' } },
                              React.createElement("span", null, testData.unit)
                            )
                          )
                        )
                      )
                    )
                );
              })
            )
          )
        );

      case "medicineAdvice":
        return value && value.length > 0 && React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '25%' } }, field.label + ":"),
          React.createElement("div", { style: { border: '1px solid #ccc', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', width: '75%' } },
            React.createElement("div", { style: { marginLeft: '20px' } },
              value.filter(med => med.name || med.dosage || med.duration).map((med, index) => 
                React.createElement("div", { 
                  key: index,
                  style: { fontSize: '14px', marginBottom: '2px' }
                },
                  React.createElement("span", { style: { display: 'inline-block', width: '20px' } },
                    \`\${index + 1}.\`
                  ),
                  React.createElement("span", { style: { display: 'inline-block', minWidth: '200px' } },
                    med.name
                  ),
                  (med.dosage && med.dosage !== "0-0-0") && React.createElement("span", { style: { display: 'inline-block', minWidth: '150px' } },
                    \`Dosage: \${med.dosage}\`
                  ),
                  med.duration && React.createElement("span", { style: { display: 'inline-block' } },
                    \`\${med.duration} Days\`
                  )
                )
              )
            )
          )
        );

      case "multiselect":
        if (field.id === "comorbidities") {
          const comorbiditiesString = value?.filter(c => c.name).map(c => c.name).join(", ");
          return comorbiditiesString && React.createElement("div", { style: { marginBottom: '16px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
            React.createElement("div", { style: { fontSize: '14px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, field.label),
            React.createElement("div", { style: { fontSize: '14px', color: '#2c3e50', width: '80%', marginLeft: '5px', whiteSpace: 'pre-line' } }, comorbiditiesString)
          );
        }
        if (field.id === "diagnosis") {
          return React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
            React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, field.label + ":"),
            React.createElement("div", { style: { fontSize: '14px', color: '#2c3e50', width: '80%', marginLeft: '5px', whiteSpace: 'pre-line' } }, 
              Array.isArray(value) ? value.map(item => item.name).join(", ") : value
            )
          );
        }
        return React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, field.label),
          React.createElement("div", { style: { fontSize: '14px', color: '#2c3e50', width: '80%', marginLeft: '5px', whiteSpace: 'pre-line' } }, 
            Array.isArray(value) ? value.join(", ") : value
          )
        );

      case "date":
        return React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '25%' } }, field.label + ":"),
          React.createElement("div", { style: { fontSize: '14px', width: '75%', marginLeft: '5px', whiteSpace: 'pre-line', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' } }, formatDate(value))
        );

      case "babyTable":
        return formData?.babyDetails?.length > 0 && React.createElement("div", null,
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '20%' } }, "BABY DETAILS"),
          React.createElement("table", { style: { width: '100%', borderCollapse: 'collapse' } },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "Baby No."),
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "Sex"),
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "Weight (gm)"),
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "Date"),
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "Time"),
                React.createElement("th", { style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', padding: '8px', border: '1px solid #ccc', textAlign: 'left' } }, "APGAR Score")
              )
            ),
            React.createElement("tbody", null,
              formData?.babyDetails.map((baby, index) => 
                React.createElement("tr", { key: index },
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, baby.number || "--"),
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, baby.sex || "--"),
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, baby.weight || "--"),
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, formatDate(baby.date) || "--"),
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, baby.time || "--"),
                  React.createElement("td", { style: { padding: '8px', border: '1px solid #ccc' } }, baby.apgar || "--")
                )
              )
            )
          )
        );

      case "textarea":
      case "text":
      default:
        return value && React.createElement("div", { style: { marginBottom: '10px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' } },
          React.createElement("div", { style: { fontSize: '16px', fontWeight: 'bold', color: '#34495e', width: '25%' } }, field.label + ":"),
          React.createElement("div", { style: { fontSize: '14px', width: '75%', marginLeft: '5px', whiteSpace: 'pre-line', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' } }, value)
        );
    }
  };

  return React.createElement("div", { ref: ref, className: "print-content" },

    React.createElement("div", { style: { borderColor: 'black', borderWidth: '1px', paddingBottom: '20px' } },
    React.createElement("div", { style: { marginBottom: '8px', paddingLeft: '8px', paddingRight: '8px' } },
      React.createElement(HospitalHeader, { hospitalInfo: hospital })
    ),
    React.createElement("div", { style: { fontSize: '18px', textAlign: 'center', marginBottom: '5px', color: '#1a5f7a', fontWeight: 'bold' } }, "Discharge Summary"),
    
    // Patient Info Section with 2 items per row
    React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px' } },
      // Name
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Name:"),
        React.createElement("span", { style: { color: '#1a202c' } }, patient?.name || "--")
      ),
      // Age/Gender
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Age/Gender:"),
        React.createElement("span", { style: { color: '#1a202c' } }, 
          patient?.age && patient?.gender ? \`\${patient?.age}/\${patient?.gender}\` : "--"
        )
      ),
  React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Address:"),
        React.createElement("span", { style: { color: '#1a202c' } }, 
          patient?.address && patient?.address ? \`\${patient?.address}\` : "--"
        )
      ),
      // UHID
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "UHID No:"),
        React.createElement("span", { style: { color: '#1a202c' } }, patient?.registrationNumber || "--")
      ),
      // Contact
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Contact:"),
        React.createElement("span", { style: { color: '#1a202c' } }, patient?.contactNumber || "--")
      ),
      // Admit Date
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Admit Date:"),
        React.createElement("span", { style: { color: '#1a202c' } }, formatDate(formData.admissionDate))
      ),
      // Discharge Date
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement("span", { style: { fontWeight: '600', color: '#4a5568', minWidth: '120px' } }, "Discharge Date:"),
        React.createElement("span", { style: { color: '#1a202c' } }, formatDate(formData.dateDischarged))
      )
    ),

    // Render form config sections
    (formConfig?.sections || [])
      .filter(section => section.id !== "patientInfo")
      .map((section, sectionIndex) => 
        React.createElement("div", { key: sectionIndex, style : { marginLeft: '24px', marginRight: '24px', marginTop: '8px', marginBottom: '8px' } },
          section.fields
            .filter(field => !field.hidden)
            .map((field, fieldIndex) => renderField(field))
        )
      ),

   // Doctor's Signature
    React.createElement("div", { 
      style: { width: '100%', textAlign: 'right', marginTop: '20px', paddingRight: '50px' }
    },
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 'bold' } }, 
        "Doctor's Signature"
      )
    )
)
  )
}`
