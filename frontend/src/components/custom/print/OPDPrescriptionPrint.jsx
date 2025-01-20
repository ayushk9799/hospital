import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import OPDRxTemplate from "../../../templates/opdRx";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";

const OPDPrescriptionPrint = ({ patient }) => {
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const componentRef = useRef();

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

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center w-full justify-start"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print OPD (Rx)
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content">
          <OPDRxTemplate patient={patient} hospital={hospitalInfo} />
        </div>
      </div>
    </>
  );
};

export default OPDPrescriptionPrint;
