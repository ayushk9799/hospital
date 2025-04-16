import { stylesFont } from "../../components/custom/reports/LabReportPDF";
import { useSelector } from "react-redux";
import { headerTemplateString } from "../../templates/headertemplate";
// import {headerTemplateString2 as headerTemplateStringExperimental} from "../../templatesExperiments/HospitalHeaderTemplate";
import React from 'react';

const HospitalHeader = ({ hospitalInfo }) => {
  return (
    <div className="mb-2 border-b border-[#000000] pb-2 ">
      <div>
        <h1
          className="text-4xl tracking-wide text-center text-[#1a5f7a] uppercase"
          style={{fontFamily:"Tinos"}}
        >
          {hospitalInfo?.name}
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ marginLeft: 50 }}>
          <img
            src={hospitalInfo?.hospitalLogoBlob}
            alt="Clinic Logo"
            className="w-[100px] h-[100px]"
          />
        </div>
        <div className="ml-8">
          <p className="text-center text-[#333333]">{hospitalInfo?.address}</p>
          <h2 className="text-center text-[#1a5f7a] text-xl ">
            {hospitalInfo?.doctorName}
          </h2>
          <p className="text-center text-[#333333]">
            {hospitalInfo?.doctorInfo}
          </p>
          <p className="text-center text-[#333333]">
            Mob : {hospitalInfo?.contactNumber}
          </p>
        </div>
        <div>
          <img
            src={hospitalInfo?.hospitalLogo2Blob}
            alt="Clinic Logo"
            className="w-[100px] h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

// Function to create a dynamic component from a template string
export const createDynamicComponentFromString = (templateString) => {
  return React.memo(({ hospitalInfo }) => {
    // Create a function that returns JSX from the template string
    const templateFunction = new Function(
      'React',
      'hospitalInfo',
      `return (${templateString});`
    );

    try {
      // Execute the template function with the required parameters
      return templateFunction(React, hospitalInfo);
    } catch (error) {
      console.error('Error rendering dynamic component:', error);
      return <div>Error rendering template</div>;
    }
  });
};

// Example of how to use the template string from backend


export default HospitalHeader;
