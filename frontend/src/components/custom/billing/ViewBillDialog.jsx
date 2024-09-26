import React, { useRef, useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { Button } from "../../ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { numberToWords } from "../../../assets/Data"; // Add this import

const PrintHeader = () => (
  <div className="hidden print:block mb-4">
    <h1 className="text-2xl font-bold text-center">Your Hospital Name</h1>
    <p className="text-center">123 Hospital Street, City, Country</p>
    <p className="text-center">Phone: (123) 456-7890</p>
  </div>
);

// Update the PrintFooter component
const PrintFooter = () => (
  <div className="hidden print:block print:fixed print:bottom-10 print:left-0 print:right-0 text-center text-sm">
    <p>Mohan nagar near police station, gaya mob-12121</p>
  </div>
);

const ViewBillDialog = ({ isOpen, setIsOpen, billData }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);

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
          margin: 10mm;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .print-only {
          display: block !important;
        }
        .no-print {
          display: none !important;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
        }
      }
    `,
  });

  if (!billData) return null;

  const services = billData.services || [];
  const totalAmountInWords = numberToWords(billData.totalAmount.toFixed(0) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div 
          ref={componentRef}
          className={isPrinting ? 'print-content' : ''}
        >
          <PrintHeader />
          <div className="print:pb-10 print:bg-red-500"> {/* Add padding to the bottom */}
            <div className="no-print">
              <DialogHeader>
                <DialogTitle>Bill Details</DialogTitle>
                <DialogDescription>Full details of the bill</DialogDescription>
              </DialogHeader>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-right">Patient Name</Label>
                  <p className="font-medium">{billData.patientInfo?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-right">Bill Number</Label>
                  <p className="font-medium">B{billData._id?.slice(-6) || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-right">Date and Time</Label>
                  <p className="font-medium">{billData.createdAt ? format(new Date(billData.createdAt), "MMM dd, yyyy hh:mm a") : 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Bill Items</h3>
                <Table className="border-2 border-gray-200">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-200">
                      <TableHead className="border-r border-gray-300 w-16">S.No</TableHead>
                      <TableHead className="border-r border-gray-300 w-1/2">Service Name</TableHead>
                      <TableHead className="border-r border-gray-300 w-24">Quantity</TableHead>
                      <TableHead className="border-r border-gray-300 w-24">Price (INR)</TableHead>
                      <TableHead className="w-24">Total (INR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service, index) => (
                      <TableRow key={index} className="border-b border-gray-200">
                        <TableCell className="border-r border-gray-200">{index + 1}</TableCell>
                        <TableCell className="border-r border-gray-200">{service.name || 'N/A'}</TableCell>
                        <TableCell className="border-r border-gray-200">{service.quantity || 0}</TableCell>
                        <TableCell className="border-r border-gray-200">{(service.rate || 0).toFixed(2)}</TableCell>
                        <TableCell>{((service.quantity || 0) * (service.rate || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex justify-between w-full items-center bg-gray-100 p-2">
                  <div className="flex-grow ml-2">
                    <span className="font-semibold">Discount:</span>
                    <span className="ml-2">₹{(billData.additionalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-4 mr-6">
                    <span className="font-semibold">Total Amount: ₹{(billData.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="w-full text-left text-sm italic mt-1">
                  <span className="font-semibold">Total in words: </span>{totalAmountInWords} Rupees Only
                </div>
                <div className="w-full text-left text-sm mt-1">
                  <span className="font-semibold">Invoice By: </span>{billData.physician || 'N/A'}
                </div>
              </div>
            </div>
            <PrintFooter />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBillDialog;