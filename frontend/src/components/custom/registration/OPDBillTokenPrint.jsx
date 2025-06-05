import React from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
// import { opdBillTokenTemplateSingle ,opdBillTokenTemplateaad} from "../../../templatesExperiments/opdBilltokenExperiment";
import { opdBillTokenTemplateDefault } from "../../../templates/opdBillTokenTemplate";
// Define styles

const OPDBillTokenPrint = React.forwardRef(
  ({  patientData, hospital }, ref) => {

    const headerTemplateStrings = useSelector(
      (state) => state.templates.headerTemplateArray
    );
    const opdBillTokenTemplate = useSelector(
      (state) => state.templates.opdBillTokenTemplate
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
      `return (${opdBillTokenTemplate||opdBillTokenTemplateDefault});`
    );

    try {
     
      // Get the component function
      const ComponentFunction = templateFunction(React, HospitalHeader);
      // Execute the component function with the props
      return ComponentFunction( patientData, hospital, ref);
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

export default OPDBillTokenPrint;
