import React from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { labReportTemplateStringExperiment2 } from "../../../templatesExperiments/labtemplateExperiment";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { labReportTemplateStringDefault } from "../../../templates/labReportTemplate";

// Define styles
const styles = {
  page: {
    fontFamily: "Tinos, serif",
    backgroundColor: "white",
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    boxSizing: "border-box",
    position: "relative",
    // Add print-specific styles for page breaks
    "@media print": {
      pageBreakInside: "auto",
      pageBreakAfter: "auto",
      pageBreakBefore: "auto",
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    // Prevent breaking header across pages
    pageBreakInside: "avoid",
    breakInside: "avoid-page",
  },
  header: {
    marginBottom: "5px",
    borderBottom: "1px solid #000000",
    paddingBottom: "2px",
    pageBreakAfter: "avoid",
  },
  clinicName: {
    fontSize: "24pt",
    textAlign: "center",
    fontFamily: "Tinos, serif",
    marginBottom: "3mm",
    color: "#1a5f7a",
    fontWeight: "bold",
  },
  clinicInfo: {
    fontSize: "10pt",
    textAlign: "center",
    color: "#333333",
    marginBottom: "2mm",
    flex: 1,
  },
  doctorInfo: {
    fontSize: "12pt",
    textAlign: "center",
    marginTop: "3mm",
    letterSpacing: "1pt",
    color: "#1a5f7a",
  },
  reportContainer: {
    marginTop: "5px",
    borderTop: "2px solid #ecf0f1",
    borderBottom: "2px solid #ecf0f1",
    paddingBottom: "60mm", // Add padding to prevent overlap with footer
  },
  reportRow: {
    display: "flex",
    borderBottom: "1px solid #ecf0f1",
    padding: "3px 0",
    alignItems: "center",
    pageBreakInside: "avoid", // Prevent breaking inside rows
    breakInside: "avoid-page",
  },
  reportRowHeader: {
    backgroundColor: "#f8f9fa",
    padding: "8px 0",
    pageBreakAfter: "avoid", // Don't break after header row
  },
  headerName: {
    fontSize: "11pt",
    fontWeight: "bold",
    paddingRight: "2mm",
  },
  headerUnit: {
    fontSize: "11pt",
    fontWeight: "bold",
    textAlign: "center",
  },
  headerValue: {
    fontSize: "11pt",
    fontWeight: "bold",
    textAlign: "center",
  },
  headerRange: {
    fontSize: "11pt",
    fontWeight: "bold",
    textAlign: "right",
  },
  testName: {
    fontSize: "10pt",
    color: "#2c3e50",
    fontWeight: "bold",
    paddingRight: "2mm",
  },
  testValue: {
    width: "25%",
    fontSize: "10pt",
    textAlign: "center",
  },
  testUnit: {
    width: "20%",
    fontSize: "10pt",
    textAlign: "center",
  },
  testRange: {
    width: "25%",
    fontSize: "10pt",
    textAlign: "right",
  },
  patientDetails: {
    marginTop: "5px",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "2mm",
    border: "1px solid #e2e8f0",
    pageBreakInside: "avoid", // Keep patient details together
    breakInside: "avoid-page",
  },
  patientColumn: {
    flex: 1,
    padding: "0 2mm",
  },
  patientInfo: {
    display: "flex",
    marginBottom: "2mm",
    alignItems: "center",
  },
  patientLabel: {
    fontSize: "10pt",
    fontWeight: "bold",
    color: "#34495e",
    marginRight: "2mm",
    minWidth: "20mm",
  },
  patientValue: {
    fontSize: "10pt",
    color: "#2c3e50",
  },
  reportTitle: {
    textAlign: "center",
    margin: "10px 0",
    pageBreakAfter: "avoid", // Don't break between title and content
  },
  reportTitleH2: {
    margin: 0,
    fontSize: "14pt",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    bottom: "7mm",
    left: "10mm",
    right: "10mm",
    paddingTop: "5mm",
    "@media print": {
      position: "fixed", // Fixed position in print mode
      backgroundColor: "white", // Ensure footer has background
    },
  },
  footerText: {
    fontSize: "8pt",
    color: "#666",
    marginBottom: "2mm",
    textAlign: "center",
  },
  signature: {
    marginTop: "10mm",
    textAlign: "right",
    paddingRight: "20mm",
    borderTop: "1px solid #000",
    paddingTop: "4mm",
  },
  signatureText: {
    fontSize: "10pt",
    fontWeight: "bold",
  },
};

const LabReportPDF = React.forwardRef(
  ({ reportData, patientData, hospital }, ref) => {

    console.log(patientData)
    const headerTemplateStrings = useSelector(
      (state) => state.templates.headerTemplateArray
    );
    const labReportTemplate = useSelector(
      (state) => state.templates.labReportUiTemplate
    );
    const headerTemplateString =
      headerTemplateStrings?.length > 0
        ? headerTemplateStrings[0].value
        : headerTemplateStringDefault;

    const HospitalHeader = createDynamicComponentFromString(
      headerTemplateString || headerTemplateStringDefault
    );

    // Add general print styles to the document
   

    // Create a function that returns JSX from the template string
    const templateFunction = new Function(
      "React",
      "HospitalHeader",
      "styles",
      `return (${labReportTemplate||labReportTemplateStringDefault});`
    );

    try {
     
      // Get the component function
      const ComponentFunction = templateFunction(React, HospitalHeader, styles);
      // Execute the component function with the props
      return ComponentFunction(reportData, patientData, hospital, ref);
    } catch (error) {
      console.error("Error rendering dynamic lab report:", error);
      return React.createElement(
        "div",
        null,
        "Error rendering lab report template"
      );
    }
  }
);

export default LabReportPDF;
