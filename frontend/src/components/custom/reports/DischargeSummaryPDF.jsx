import React, { forwardRef } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { dischargeSummaryTemplateStringDefault } from "../../../templates/dischargesummary";
import { configBasedDischargeSummaryTemplate } from "../../../templatesExperiments/dischargeSummaryExperimental";
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

// Create the dynamic component
const DischargeSummaryPDF = forwardRef((props, ref) => {
  const { formData, patient, formConfig, hospital } = props;
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
          dischargeSummaryTemplateStringdatabase ||
          dischargeSummaryTemplateStringDefault
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
    return ComponentFunction(formData,patient,hospital,formConfig,ref);
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
