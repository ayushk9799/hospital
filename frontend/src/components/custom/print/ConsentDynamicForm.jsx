import React, { forwardRef } from "react";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplate } from "../../../templates/headertemplate";
// import { consentFormTemplateStringDefault } from "../../../templatesExperiments/consentExperiment";


const ConsentDynamicForm = forwardRef((props, ref) => {
  const { patient, templateString } = props;
  const { hospitalInfo } = useSelector((state) => state.hospital);
  
  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplateArray
  );

  const headerTemplateString =
    headerTemplates?.length > 0
      ? headerTemplates[0].value
      : headerTemplate;

  const HospitalHeader = createDynamicComponentFromString(headerTemplateString);

  // Create a function that returns JSX from the template string
  const templateFunction = new Function(
    "React",
    "HospitalHeader",
    `return (${templateString });`
  );

  try {
    // Get the component function
    const ComponentFunction = templateFunction(React, HospitalHeader);
    // Execute the component function with the props
    return ComponentFunction(patient, hospitalInfo, ref);
  } catch (error) {
    console.error("Error rendering Consent form:", error);
    return React.createElement(
      "div",
      null,
      "Error rendering Consent form template"
    );
  }
});

export default ConsentDynamicForm;
