import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import OPDRxTemplate from "../../../templates/opdRx";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";
import {opdRxTemplateStringDefault} from '../../../templates/opdRx'


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
    setTimeout(handlePrint, 100);
  };

  if (opdRxTemplateArray.length <= 1) {
    return (
      <>
        <DropdownMenuItem onClick={() => handleTemplatePrint(opdRxTemplateArray[0])} className="font-bold">
          <Printer className="h-4 w-4 mr-2 " />
          Print OPD (Rx)
        </DropdownMenuItem>

        <div style={{ display: "none" }}>
          <div ref={componentRef} className="print-content">
            <OPDRxTemplate
              patient={patient}
              hospital={hospitalInfo}
              templateString={selectedTemplate?.value || opdRxTemplateStringDefault}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Printer className="h-4 w-4 mr-2" />
          Print OPD (Rx)
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {opdRxTemplateArray.map((template) => (
            <DropdownMenuItem
              key={template.name}
              onClick={() => handleTemplatePrint(template)}
            >
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>

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
};

export default OPDPrescriptionPrint;
