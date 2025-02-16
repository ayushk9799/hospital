import React, { forwardRef } from "react";
import { format, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplate } from "../templates/headertemplate";
//  import { opdRxTemplateStringExperimental } from "../templatesExperiments/opdRxExperimental";

export const opdRxTemplateStringDefault = `(patient, hospital, ref) => {
  return React.createElement("div", { className: "print-content" },
      
      React.createElement("div", { 
        style: {
          position: 'absolute',
          left: '25mm',
          top: '54mm',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
        }
      }, patient?.patient?.name || ''),

      React.createElement("div", { 
        style: {
          position: 'absolute',
          left: '160mm',
          top: '54mm',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        }
      }, patient?.bookingDate ? patient?.bookingDate.split('T')[0]?.split('-').reverse().join('/') : ''),

      React.createElement("div", { 
        style: {
          position: 'absolute',
          left: '30mm',
          top: '64mm',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        }
      }, \`\${patient?.patient?.age || ''} / \${patient?.patient?.gender || ''}\`),

      React.createElement("div", { 
        style: {
          position: 'absolute',
          left: '160mm',
          top: '64mm',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        }
      }, patient?.patient?.address || '')
  );
}`;

const OPDRxTemplate = forwardRef((props, ref) => {
  const { patient, hospital, templateString } = props;

  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplateArray
  );

  const headerTemplateString =
    headerTemplates?.length > 0 ? headerTemplates[0].value : headerTemplate;

 
  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplate
  );


  const templateFunction = new Function(
    "React",
    "HospitalHeader",
    "format",
    "addDays",
    `return (${templateString});`
  );

  try {
    const ComponentFunction = templateFunction(
      React,
      HospitalHeader,
      format,
      addDays
    );
    return ComponentFunction(patient, hospital, ref);
  } catch (error) {
    console.error("Error rendering OPD Rx:", error);
    return React.createElement("div", null, "Error rendering OPD Rx template");
  }
});

export default OPDRxTemplate;
