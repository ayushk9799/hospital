import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import { format } from "date-fns";
import { useSelector } from "react-redux";
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
import { PrinterIcon, X } from "lucide-react";
import { numberToWords } from "../../../assets/Data";
import HospitalHeader from "../../../utils/print/HospitalHeader";
import { AlertCircle } from "lucide-react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { ScrollArea } from "../../ui/scroll-area";

const OPDProcedureBillDialog = ({ isOpen, setIsOpen, procedureData }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);

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
          margin: 20mm;
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
          padding: 20px;
        }
      }
    `,
  });

  if (!procedureData) return null;
  const { opdProcedure, servicesBill, payments } = procedureData;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh]">
          <div ref={componentRef} className={isPrinting ? "print-content" : ""}>
            <div className="hidden print:block mb-2">
              <HospitalHeader hospitalInfo={hospitalInfo} />
            </div>
            <div className="print:pb-6">
              <div className="no-print">
                <DialogHeader className="pb-2">
                  <DialogTitle>OPD Procedure Bill</DialogTitle>
                </DialogHeader>
              </div>

              {/* Patient Information */}
              <div className="grid gap-2 py-1">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Name:</Label>
                    <p>{opdProcedure.name || "N/A"}</p>
                  </div>
                  { opdProcedure.registrationNumber && <div className="flex items-center">
                    <Label className="font-semibold mr-2">UHID. No:</Label>
                    <p>{opdProcedure.registrationNumber || "N/A"}</p>
                  </div> }
                  
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Contact:</Label>
                    <p>{opdProcedure.contactNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Age/Gender:</Label>
                    <p>{`${opdProcedure.age || "N/A"} yrs/${
                      opdProcedure.gender || "N/A"
                    }`}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Address:</Label>
                    <p>{opdProcedure.address || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Procedure:</Label>
                    <p>{opdProcedure.procedureName || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Invoice No:</Label>
                    <p>{servicesBill.invoiceNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Date:</Label>
                    <p>
                      {opdProcedure.date
                        ? format(new Date(opdProcedure.date), "dd/MM/yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Services Table */}
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <Table className="border-2 border-gray-200">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gray-200">
                          <TableHead className="border-r border-gray-300 w-16">
                            No.
                          </TableHead>
                          <TableHead className="border-r border-gray-300 w-1/2">
                            Service Name
                          </TableHead>
                          <TableHead className="border-r border-gray-300 w-24">
                            Quantity
                          </TableHead>
                          <TableHead className="border-r border-gray-300 w-24">
                            Price (INR)
                          </TableHead>
                          <TableHead className="w-24">Total (INR)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {servicesBill.services.map((service, index) => (
                          <TableRow key={index} className="border-b border-gray-200">
                            <TableCell className="border-r border-gray-200">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border-r border-gray-200">
                              {service.name || "N/A"}
                            </TableCell>
                            <TableCell className="border-r border-gray-200">
                              {service.quantity || 0}
                            </TableCell>
                            <TableCell className="border-r border-gray-200">
                              {(service.rate || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {((service.quantity || 0) * (service.rate || 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Payment Summary */}
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="border rounded p-3 space-y-2 bg-white text-sm">
                        <h3 className="font-semibold text-base border-b pb-1">
                          Payment Summary
                        </h3>
                        <div className="flex flex-col items-end space-y-0.5">
                          <div className="flex justify-end w-full items-center">
                            <span className="text-gray-600 mr-3">Sub Total:</span>
                            <span>₹{servicesBill.subtotal.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-end w-full items-center">
                            <span className="text-gray-600 mr-3">Discount:</span>
                            <span>
                              ₹{(servicesBill.additionalDiscount || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-end w-full items-center border-t border-gray-200 pt-0.5">
                            <span className="font-medium mr-3">Net Total:</span>
                            <span className="font-medium">
                              ₹{servicesBill.totalAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-end w-full items-center">
                            <span className="text-gray-600 mr-3">Paid:</span>
                            <span className="text-green-600">
                              ₹{servicesBill.amountPaid.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-end w-full items-center border-t border-gray-200 pt-0.5">
                            <span className="text-gray-600 mr-3">Balance:</span>
                            <span className="text-red-600">
                              ₹{(servicesBill.totalAmount - servicesBill.amountPaid).toFixed(2)}
                            </span>
                          </div>

                          <div className="w-full text-right text-xs mt-0.5">
                            <span className="font-medium">Status: </span>
                            <span
                              className={
                                servicesBill.amountPaid === servicesBill.totalAmount
                                  ? "text-green-600 font-bold"
                                  : "text-red-600 font-bold"
                              }
                            >
                              {servicesBill.amountPaid === servicesBill.totalAmount
                                ? "Paid"
                                : "Due"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="mt-1">
                  <h3 className="text-lg font-semibold mb-1">Payment History</h3>
                  {payments && payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Date</TableHead>
                            {!isMobile && (
                              <TableHead className="w-[80px]">Time</TableHead>
                            )}
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">
                                {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                              </TableCell>
                              {!isMobile && (
                                <TableCell className="text-xs">
                                  {new Date(payment.createdAt).toLocaleTimeString(
                                    "en-IN",
                                    {
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    }
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="text-xs font-medium">
                                ₹
                                {payment.amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-xs">
                                {payment.paymentMethod}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-gray-500 py-4">
                      <AlertCircle size={18} />
                      <span>No payment history found</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
          </div>
        </ScrollArea>

        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default OPDProcedureBillDialog; 