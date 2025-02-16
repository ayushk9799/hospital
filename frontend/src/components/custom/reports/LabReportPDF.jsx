import React from "react";
import { format } from "date-fns";
import HospitalHeader from "../../../utils/print/HospitalHeader";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { useSelector } from "react-redux";
const LabReportPDF = React.forwardRef(
  ({ reportData, patientData, hospital }, ref) => {
    const reportEntries = Object.entries(reportData.report);
    const headerTemplateStrings = useSelector(
      (state) => state.templates.headerTemplateArray
    );
    const headerTemplateString =
      headerTemplateStrings?.length > 0
        ? headerTemplateStrings[0].value
        : headerTemplateStringDefault;
    const HospitalHeader = createDynamicComponentFromString(
      headerTemplateString || headerTemplateStringDefault
    );
    return (
      <div ref={ref} className="page">
        <HospitalHeader hospitalInfo={hospital} />

        <div className="patient-details">
          <div className="patient-column">
            <div className="patient-info">
              <span className="patient-label">Name:</span>
              <span className="patient-value">{patientData?.patientName}</span>
            </div>
            <div className="patient-info">
              <span className="patient-label">Age:</span>
              <span className="patient-value">{patientData?.patient?.age||patientData.age}</span>
            </div>
          </div>
          <div className="patient-column">
            <div className="patient-info">
              <span className="patient-label">Gender:</span>
              <span className="patient-value">
                {patientData?.patient?.gender||patientData.gender}
              </span>
            </div>
            <div className="patient-info">
              <span className="patient-label">Reg No/Lab No:</span>
              <span className="patient-value">
                {patientData?.registrationNumber||patientData.labNumber}
              </span>
            </div>
          </div>
          <div className="patient-column">
            <div className="patient-info">
              <span className="patient-label">Contact:</span>
              <span className="patient-value">
                {patientData?.contactNumber}
              </span>
            </div>
            <div className="patient-info">
              <span className="patient-label">Date:</span>
              <span className="patient-value">
                {format(reportData?.date, "dd/MM/yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="report-title">
          <h2>{reportData?.completeType}</h2>
        </div>
        <div className="report-container">
          {reportEntries.some(
            ([_, value]) => value.unit || value.normalRange
          ) && (
            <div className="report-row header">
              <div className="header-name">Test Name</div>
              <div className="header-value">Result</div>
              <div className="header-unit">Unit</div>
              <div className="header-range">Normal Range</div>
            </div>
          )}
          {reportEntries
            .filter(([_, value]) => value.value)
            .map(([key, value]) => (
              <div className="report-row" key={key}>
                {value.unit || value.normalRange ? (
                  <>
                    <div className="test-name">{key}</div>
                    <div className="test-value">{value.value}</div>
                    <div className="test-unit">{value.unit}</div>
                    <div className="test-range">{value.normalRange}</div>
                  </>
                ) : (
                  <div className="col-span-full">
                    <div className="font-bold mb-1">{key}</div>
                    <div className="whitespace-pre-wrap">{value.value}</div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }
);

export default LabReportPDF;
