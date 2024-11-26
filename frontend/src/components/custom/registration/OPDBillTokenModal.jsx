import React, { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import { format } from "date-fns";
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A4 landscape;
          margin: 0;
          padding: 0;
        }
        
        * {
          margin: 0 !important;
          padding: 0 !important;
        }

        body {
          margin: 0;
          padding: 0;
        }

        #printArea {
          display: flex !important;
          flex-direction: row !important;
          width: 100% !important;
          height: 100% !important;
        }

        #printArea > div {
          width: 50% !important;
          padding: 8px 12px !important;
          border-bottom: none !important;
        }

        #printArea > div:first-child {
          border-right: 1px dashed #000 !important;
        }

        /* Simple Print Header Styles */
        .print-header {
          border-bottom: 1px solid #000 !important;
          padding-bottom: 4px !important;
          margin-bottom: 4px !important;
        }

        .print-header h1 {
          font-size: 16px !important;
          line-height: 1.2 !important;
          margin-bottom: 2px !important;
        }

        .print-header p {
          font-size: 14px !important;
          line-height: 1.2 !important;
        }

        /* Patient Details */
        .patient-details {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 4px !important;
          margin-top: 4px !important;
          padding: 4px !important;
          font-size: 12px !important;
        }

        .summary-section {
          width: 16rem !important;
          font-size: 12px !important;
        }

        /* Table Styles */
        table {
          margin-top: 4px !important;
          font-size: 12px !important;
        }

        td, th {
          padding: 2px 4px !important;
          line-height: 1.2 !important;
        }

        .grid {
          gap: 4px !important;
        }
      }
    `,
  });

  if (!patientData) return null;

  const { patient, bill, payment } = patientData;

  const BillCopy = ({ title }) => (
    <div className="w-full lg:w-1/2 p-2 lg:p-4 border-b lg:border-b-0 lg:border-r border-dashed border-red-500">
      <div className="mb-1 sm:mb-2">
        <SimplePrintHeader />
        <div className="flex justify-between items-center mt-2">
          <h2 className="font-bold">{title}</h2>
          <div className="text-sm">
            <span className="font-semibold">Invoice No: </span>
            <span>{bill?.invoiceNumber || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="patient-details text-sm border rounded-md p-1 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 pb-3 border-b">
            <div className="flex gap-2">
              <span className="font-semibold">Name:</span>
              <span>{patient.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Age/Sex:</span>
              <span>{patient.age}/{patient.gender}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">UHID No:</span>
              <span>{patient.registrationNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3">
            <div className="flex gap-2 whitespace-nowrap overflow-hidden">
              <span className="font-semibold flex-shrink-0">Address:</span>
              <span className="truncate" title={patient.address}>{patient.address}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Contact:</span>
              <span>{patient.contactNumber}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Date:</span>
              <span>{format(new Date(bill.createdAt), "dd/MM/yyyy")}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto  px-2">
          <Table className="border-2 border-gray-200 mt-2 w-full text-sm">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[40px]">No</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right w-[50px]">Qty</TableHead>
                <TableHead className="text-right w-[70px]">Rate</TableHead>
                <TableHead className="text-right w-[70px]">Amt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.services.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="py-1">{index + 1}</TableCell>
                  <TableCell className="py-1">
                    <div className="line-clamp-2">{service.name}</div>
                  </TableCell>
                  <TableCell className="text-right py-1">
                    {service.quantity}
                  </TableCell>
                  <TableCell className="text-right py-1">
                    ₹{service.rate}
                  </TableCell>
                  <TableCell className="text-right py-1">
                    ₹{service.quantity * service.rate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-end space-y-1 mt-2">
          <div className="summary-section flex justify-between w-full sm:w-48 text-sm px-2 sm:px-0">
            <span>Sub Total:</span>
            <span>₹{bill.subtotal}</span>
          </div>
          {bill.additionalDiscount > 0 && (
            <div className="summary-section flex justify-between w-full sm:w-48 text-sm text-red-600">
              <span>Discount:</span>
              <span>- ₹{bill.additionalDiscount}</span>
            </div>
          )}
          <div className="summary-section flex justify-between w-full sm:w-48 text-sm font-bold border-t border-gray-200 pt-1">
            <span>Total Amount:</span>
            <span>₹{bill.totalAmount}</span>
          </div>

          <div className="summary-section w-full sm:w-48 border-t border-gray-200 mt-1 pt-1">
            <div className="flex justify-between text-sm">
              <span>Amount Paid:</span>
              <span className="text-green-600">₹{bill.amountPaid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Amount:</span>
              <span className="text-red-600">
                ₹{Math.max(0, bill.totalAmount - bill.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span>Payment Method:</span>
              <span>{payment?.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-1">
              <span>Status:</span>
              <span
                className={
                  bill.totalAmount === bill.amountPaid
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {bill.totalAmount === bill.amountPaid ? "PAID" : "DUE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle>OPD Bill Token</DialogTitle>
        </DialogHeader>

        <div
          id="printArea"
          ref={componentRef}
          className="flex flex-col lg:flex-row border-red-500"
        >
          <BillCopy title="Hospital Copy" />
          <BillCopy title="Patient Copy" />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button className="w-full sm:w-auto" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OPDBillTokenModal;