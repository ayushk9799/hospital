import React, { forwardRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplate } from "../../../templates/headertemplate";
import { parseAge } from "../../../assets/Data";
import { mergedLabReportTemplateStringExperiment2 } from "../../../templatesExperiments/labtemplateExperiment";
import { mergedLabReportTemplateStringDefault } from "../../../templates/labReportTemplate";

// Styles specific to the merged report
const styles = {
  // Print-specific styles for page breaks and layout
  page: {
    pageBreakInside: "auto",
    pageBreakAfter: "auto",
    pageBreakBefore: "auto",
  },
  header: {
    pageBreakInside: "avoid",
    pageBreakAfter: "avoid",
    breakInside: "avoid-page",
  },
  reportTitle: {
    pageBreakAfter: "avoid",
    breakAfter: "avoid-page",
  },
  tableHeader: {
    pageBreakAfter: "avoid",
    breakAfter: "avoid-page",
  },
  tableRow: {
    pageBreakInside: "avoid",
    breakInside: "avoid-page",
  },
  sectionTitle: {
    pageBreakAfter: "avoid",
    breakAfter: "avoid-page",
  },
  footer: {
    position: "fixed",
    bottom: "10mm",
    left: "10mm",
    right: "10mm",
    backgroundColor: "white",
  },
};

const MergedLabReportPDF = forwardRef((props, ref) => {
  const { reportsData, patientData, hospital } = props;

  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplateArray
  );
  const mergeTemplate = useSelector((state) => state.templates.mergeTemplate);

  const headerTemplateString =
    headerTemplates?.length > 0 ? headerTemplates[0].value : headerTemplate;

  const mergeTemplateString =mergeTemplate||mergedLabReportTemplateStringDefault;

  // Add general print styles to the document
  

  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplate
  );

  const templateFunction = new Function(
    "React",
    "HospitalHeader",
    "styles",
    `return ${mergeTemplateString};`
  );

  try {
    const ComponentFunction = templateFunction(React, HospitalHeader, styles);
    return ComponentFunction(reportsData, { ...patientData, age: parseAge(patientData.patient?.age||patientData.age) }, hospital, ref);
  } catch (error) {
    console.error("Error rendering merged lab report:", error);
    return React.createElement(
      "div",
      null,
      "Error rendering merged lab report template"
    );
  }
});

export default MergedLabReportPDF;
