import React, { forwardRef } from "react";
import { format } from "date-fns";
import HospitalHeader from "../../../utils/print/HospitalHeader";

// Keep the exact same styles but convert to CSS
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
    width:"20%"
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
    color: "#2c3e50",
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

// Convert components to use regular HTML elements
const TruncatedText = ({ children, style }) => (
  <span
    style={{
      ...style,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    }}
  >
    {children}
  </span>
);

const ConditionalText = ({ label, value, style }) => {
  if (!value) return null;
  return (
    <span style={style}>
      <span style={styles.label}>{label}: </span>
      <span style={styles.value}>{value}</span>
    </span>
  );
};

const ConditionalSection = ({ title, content }) => {
  if (!content) return null;
  return (
    <div style={styles.section}>
      <span style={styles.sectionTitle}>{title}:</span>
      <span style={styles.sectionContent}>{content}</span>
    </div>
  );
};

const InvestigationDisplay = ({ investigation }) => {
  const { name, date, report } = investigation;

  const formatLabel = (label) => {
    if (!label) return "";
    const regex = /^\([^)]+\)|^(?:\S+\s?){1,3}/;
    const match = label.match(regex);
    return match ? match[0].trim() : label;
  };

  const reportEntries = Object.entries(report)?.filter(
    ([_, testData]) => testData.value
  );
  const halfLength = Math.ceil(reportEntries.length / 2);

  const hasFindings =
    report.findings && Object.values(report.findings).some((value) => value);

  return (
    <div
      style={{
        ...styles.investigationContainer,
        display: "flex",
        flexDirection: hasFindings ? "row" : "column",
      }}
    >
      <div >
        <div style={styles.investigationTitle}>
          {name.toUpperCase()}{" "}
          ({format(new Date(date), "dd-MM-yyyy")})
        </div>
      </div>

      {hasFindings ? (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>
            {report.findings && (
              <div
                style={{
                  ...styles.investigationRow,
                  marginLeft: "50px",
                  fontSize: "12px",
                 
                }}
              >
                <div style={styles.investigationCell1}>
                  <span>{report.findings.value}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "50%" }}>
            {reportEntries.slice(0, halfLength).map(
              ([testName, testData]) =>
                testData.value && (
                  <div
                    key={testName}
                    style={{ ...styles.investigationRow, marginLeft: "5px" }}
                  >
                    <div style={styles.investigationCell1}>
                      <span>{formatLabel(testData.label) || testName}</span>
                    </div>
                    <div style={styles.investigationCell2}>
                      <span>{testData.value}</span>
                    </div>
                    {testData.unit && (
                      <div style={styles.investigationCell2}>
                        <span>{testData.unit}</span>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
          <div style={{ width: "50%" }}>
            {reportEntries.slice(halfLength).map(
              ([testName, testData]) =>
                testData.value && (
                  <div
                    key={testName}
                    style={{ ...styles.investigationRow, marginLeft: "5px" }}
                  >
                    <div style={styles.investigationCell1}>
                      <span>{formatLabel(testData.label) || testName}</span>
                    </div>
                    <div style={styles.investigationCell2}>
                      <span>{testData.value}</span>
                    </div>
                    {testData.unit && (
                      <div style={styles.investigationCell2}>
                        <span>{testData.unit}</span>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DischargeSummaryPDF = forwardRef(
  ({ formData, patient, hospital }, ref) => {
    const hasComorbidities =
      formData.comorbidities && formData.comorbidities.some((c) => c.name);
    const hasInvestigations =
      formData.investigations &&
      formData.investigations.some((i) => i.name || i.category);
    const hasMedicineAdvice =
      formData.medicineAdvice &&
      formData.medicineAdvice.some((m) => m.name || m.dosage || m.duration);

    const comorbiditiesString = formData.comorbidities
      ?.filter((c) => c.name)
      .map((c) => c.name)
      .join(", ");

    const renderComorbidities = () => {
      return (
        <div style={styles.section}>
          <span style={styles.sectionTitle}>Comorbidities:</span>
          <span style={styles.sectionContent}>{comorbiditiesString}</span>
        </div>
      );
    };

    const appendComorbidities = (content, type) => {
      if (!hasComorbidities || formData.comorbidityHandling === "separate") {
        return content;
      }
      if (type === formData.comorbidityHandling) {
        return `${content}${content ? ", " : ""} ${comorbiditiesString}`;
      } else {
        return content;
      }
    };

    return (
      <div ref={ref} style={styles.page} className="print-content">
        <div className="hidden print:block mb-2">
          <HospitalHeader hospitalInfo={hospital} />
        </div>
        <div style={styles.title}>Discharge Summary</div>

        <div style={{ ...styles.section }}>
          <div style={{ ...styles.patientInfoSection }}>
            <div style={{ ...styles.row, marginBottom: "2px" }}>
              <span style={styles.infoItem}>
                <span style={styles.label}>Name: </span>
                <span style={styles.value}>{patient?.name || "--"}</span>
              </span>
              <span style={styles.infoItem}>
                <span style={styles.label}>Age/Gender: </span>
                <span style={styles.value}>
                  {patient?.age && patient?.gender
                    ? `${patient?.age} yrs/${patient?.gender}`
                    : "--"}
                </span>
              </span>
              <span style={styles.infoItem}>
                <span style={styles.label}>UHID No: </span>
                <span style={styles.value}>
                  {patient?.registrationNumber || "--"}
                </span>
              </span>
            </div>

            <div style={{ ...styles.row, marginBottom: "2px" }}>
              <span style={styles.infoItem}>
                <span style={styles.label}>IPD No: </span>
                <span style={styles.value}>{patient?.ipdNumber || "--"}</span>
              </span>
              <span style={styles.infoItem}>
                <span style={styles.label}>Admit Date: </span>
                <span style={styles.value}>
                  {formData.admissionDate || "--"}
                </span>
              </span>
              <span style={styles.infoItem}>
                <span style={styles.label}>Discharge Date: </span>
                <span style={styles.value}>
                  {formData.dateDischarged || "--"}
                </span>
              </span>
            </div>

            <div style={styles.row}>
              <span style={styles.infoItem}>
                <span style={styles.label}>Room: </span>
                <span style={styles.value}>{patient?.roomNumber || "--"}</span>
              </span>
              <span style={styles.infoItem}>
                <span style={styles.label}>Contact: </span>
                <span style={styles.value}>
                  {patient?.contactNumber || "--"}
                </span>
              </span>
              <span style={{ ...styles.infoItem }}>
                <span style={styles.label}>Address: </span>
                <TruncatedText style={styles.value}>
                  {patient?.address || "--"}
                </TruncatedText>
              </span>
            </div>
          </div>
        </div>

        <ConditionalSection
          title="Diagnosis"
          content={appendComorbidities(formData.diagnosis, "diagnosis")}
        />

        <ConditionalSection
          title="Clinical Summary"
          content={appendComorbidities(
            formData.clinicalSummary,
            "clinical_summary"
          )}
        />

        {formData.comorbidityHandling === "separate" && renderComorbidities()}

        {formData.vitals.admission && (
          <div style={styles.section}>
            <span style={styles.sectionTitle}>Admission Vitals</span>
            <span style={styles.sectionContent}>
              {formData.vitals.admission.bloodPressure && (
                <>
                  BP:{" "}
                  <strong>{formData.vitals.admission.bloodPressure}</strong>{" "}
                  mmHg,{" "}
                </>
              )}
              {formData.vitals.admission.heartRate && (
                <>
                  Heart Rate:{" "}
                  <strong>{formData.vitals.admission.heartRate}</strong> bpm,{" "}
                </>
              )}
              {formData.vitals.admission.temperature && (
                <>
                  Temperature:{" "}
                  <strong>{formData.vitals.admission.temperature}</strong>°C,{" "}
                </>
              )}
              {formData.vitals.admission.oxygenSaturation && (
                <>
                    O<sub>2</sub> Saturation:{" "}

                  <strong>{formData.vitals.admission.oxygenSaturation}</strong>
                  %,{" "}
                </>
              )}
              {formData.vitals.admission.respiratoryRate && (
                <>
                  Respiratory Rate:{" "}
                  <strong>{formData.vitals.admission.respiratoryRate}</strong>{" "}
                  breaths/min
                </>
              )}
            </span>
          </div>
        )}

        <ConditionalSection
          title="Condition on Admission"
          content={formData.conditionOnAdmission}
        />

        {formData.investigations && formData.investigations.length > 0 && (
          <div style={{marginBottom: "3px"}}>
            <div >
              <span style={styles.sectionTitle}>Investigations</span>
            </div>

            <div
              style={{
                ...styles.investigationsSection,
                marginLeft: "15px",
                marginTop: "5px",
                width: "100%",
               
              }}
            >
              {formData.investigations.map((investigation, index) => (
                <InvestigationDisplay
                  key={index}
                  investigation={investigation}
                />
              ))}
            </div>
          </div>
        )}

        <ConditionalSection title="Treatment" content={formData.treatment} />

        {formData.vitals.discharge && (
          <div style={styles.section}>
            <span style={styles.sectionTitle}>Discharge Vitals</span>
            <span style={styles.sectionContent}>
              {formData.vitals.discharge.bloodPressure && (
                <>
                  BP:{" "}
                  <strong>{formData.vitals.discharge.bloodPressure}</strong>{" "}
                  mmHg,{" "}
                </>
              )}
              {formData.vitals.discharge.heartRate && (
                <>
                  Heart Rate:{" "}
                  <strong>{formData.vitals.discharge.heartRate}</strong> bpm,{" "}
                </>
              )}
              {formData.vitals.discharge.temperature && (
                <>
                  Temperature:{" "}
                  <strong>{formData.vitals.discharge.temperature}</strong>°C,{" "}
                </>
              )}
              {formData.vitals.discharge.oxygenSaturation && (
                <>
                    O<sub>2</sub> Saturation:{" "}

                  <strong>{formData.vitals.discharge.oxygenSaturation}</strong>
                  %,{" "}
                </>
              )}
              {formData.vitals.discharge.respiratoryRate && (
                <>
                  Respiratory Rate:{" "}
                  <strong>{formData.vitals.discharge.respiratoryRate}</strong>{" "}
                  breaths/min
                </>
              )}
            </span>
          </div>
        )}

        <ConditionalSection
          title="Condition on Discharge"
          content={formData.conditionOnDischarge}
        />

        {hasMedicineAdvice && (
          <div style={styles.section}>
            <span style={styles.sectionTitle}>Medicine/Advice</span>
            <div style={{ marginLeft: "150px" }}>
              {formData.medicineAdvice.map(
                (med, index) =>
                  (med.name || med.dosage || med.duration) && (
                    <div
                      key={index}
                      style={{ fontSize: "11px", marginBottom: "2px" }}
                    >
                      <span style={{ display: "inline-block", width: "20px" }}>
                        {index + 1}.
                      </span>
                      <span
                        style={{ display: "inline-block", minWidth: "200px" }}
                      >
                        {med.name}
                      </span>
                      {med.dosage && (
                        <span
                          style={{ display: "inline-block", minWidth: "150px" }}
                        >
                          Dosage: {med.dosage}
                        </span>
                      )}
                      {med.duration && (
                        <span style={{ display: "inline-block" }}>
                          {med.duration} Days
                        </span>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        <ConditionalSection title="Additional Notes" content={formData.notes} />

        <div style={{ width: "100%", textAlign: "right", marginTop: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "bold" }}>
            Doctor's Signature
          </span>
        </div>
      </div>
    );
  }
);

export default DischargeSummaryPDF;
