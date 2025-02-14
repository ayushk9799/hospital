import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import OPDRxTemplate from "../../../templates/opdRx";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";

const OPDPrescriptionPrint = ({ patient }) => {
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const opdRxTemplateArray = useSelector(
    (state) => state.templates.opdRxTemplateArray || []
  );
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-content {
          width: 210mm;
          min-height: 297mm;
          position: relative;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      }
    `,
  });

  const componentRef = useRef();

  const handleTemplatePrint = (template) => {
    setSelectedTemplate(template);
    setTimeout(
      handlePrint,
     100);
  };

  if (opdRxTemplateArray.length === 1) {
    return (
      <>
        <Button
          variant="ghost"
          className="flex items-center w-full justify-start"
          onClick={() => handleTemplatePrint(opdRxTemplateArray[0])}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print OPD (Rx)
        </Button>

        <div style={{ display: "none" }}>
          <div ref={componentRef} className="print-content">
            <OPDRxTemplate
              patient={patient}
              hospital={hospitalInfo}
              templateString={selectedTemplate?.value || opdRxTemplateArray[0]?.value}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {opdRxTemplateArray.map((template) => (
        <Button
          key={template.name}
          variant="ghost"
          className="flex items-center w-full justify-start mb-2"
          onClick={() => handleTemplatePrint(template)}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print OPD Rx ({template.name})
        </Button>
      ))}

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content">
          <OPDRxTemplate
            patient={patient}
            hospital={hospitalInfo}
            templateString={
              selectedTemplate?.value || opdRxTemplateArray[0]?.value
            }
          />
        </div>
      </div>
    </>
  );
};

export default OPDPrescriptionPrint;
