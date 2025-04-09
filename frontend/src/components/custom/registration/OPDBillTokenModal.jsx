import React, { useRef, useEffect, useState, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import OPDRxTemplate from "../../../templates/opdRx";
import OPDPrescriptionPrint from "../print/OPDPrescriptionPrint";
import { opdRxTemplateStringDefault } from "../../../templates/opdRx";

import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "../../ui/dropdown-menu";
import OPDBillTokenPrint from "../../custom/registration/OPDBillTokenPrint";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { PrinterIcon } from "lucide-react";
import SimplePrintHeader from "../../../utils/print/SimplePrintHeader";
import { useSelector } from "react-redux";
import PaymentReceipt from "../print/PaymentReceipt";

const OPDBillTokenModal = ({
  isOpen,
  setIsOpen,
  patientData,
  services,
  selectedServices,
  onSelectService,
  onSelectAll,
  onClose,
}) => {
  const componentRef = useRef();
  console.log(patientData);
  const { hospitalInfo } = useSelector((state) => state.hospital);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = "";
      document.body.style = "";

      setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style = "";
      }, 300);
    }

    return () => {
      document.body.style.pointerEvents = "";
      document.body.style = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.pointerEvents = "";
    document.body.style = "";

    setTimeout(() => {
      document.body.style.pointerEvents = "";
      document.body.style = "";
    }, 300);
  };
  const [isPrinting, setIsPrinting] = useState(false);
  const opdRxTemplateRef = useRef();
  const opdRxTemplateArray = useSelector(
    (state) => state.templates.opdRxTemplateArray || []
  );

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsPrinting(false);
          resolve();
        }, 0);
      });
    },
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 5mm;
        }
        
        body {
          margin: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  });

  const handleTemplatePrint = useReactToPrint({
    content: () => {
      console.log(opdRxTemplateRef.current);
      return opdRxTemplateRef.current;
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
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

  if (!patientData) return null;

  const { patient, bill, payment, admissionRecord, visit } = patientData;
  console.log(admissionRecord);
  console.log(patient);
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto lg:max-w-6xl gap-0">
        <DialogHeader>
          <DialogTitle>OPD Bill Token</DialogTitle>
        </DialogHeader>

        <div
          id="printArea"
          ref={componentRef}
          className={`${
            isPrinting
              ? "print-content print-landscape"
              : "flex flex-row lg:flex-row"
          } w-full `}
        >
          <OPDBillTokenPrint
            patientData={patientData}
            hospital={hospitalInfo}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <div className="">
            <PaymentReceipt
              payments={payment}
              billData={{ ...patientData.bill, patient: patientData.patient }}
              styleData={true}
            />
          </div>
          <div className="flex gap-2">
            {opdRxTemplateArray.length <= 1 ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => handleTemplatePrint()}
                >
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print OPD Rx
                </Button>
                <div style={{ display: "none" }}>
                  <div ref={opdRxTemplateRef} className="print-content">
                    <OPDRxTemplate
                      patient={{ ...admissionRecord, patient: patient }}
                      hospital={hospitalInfo}
                      templateString={
                        opdRxTemplateArray[0]?.value ||
                        opdRxTemplateStringDefault
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <PrinterIcon className="mr-2 h-4 w-4" />
                    Print OPD Rx
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <OPDPrescriptionPrint
                      patient={{ ...admissionRecord, patient: patient }}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="w-full sm:w-auto" onClick={handlePrint}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Token
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OPDBillTokenModal;
