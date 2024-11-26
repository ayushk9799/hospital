import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { PrinterIcon, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { numberToWords } from "../../../assets/Data";
import HospitalHeader from "../../../utils/print/HospitalHeader";
import { ScrollArea } from "../../ui/scroll-area";

const BillModal = ({ isOpen, onClose, billData, hospitalInfo, completedBill }) => {
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

  const getBillStatus = (bill) => {
    if (!bill) return "N/A";
    return bill.amountPaid === bill.totalAmount ? "Paid" : "Due";
  };

  const bill = completedBill?.bill || billData;
  const patient = completedBill?.patient || billData?.patientInfo;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh]">
          <div ref={componentRef} className={isPrinting ? "print-content" : ""}>
            <div className="hidden print:block mb-2">
              <HospitalHeader />
            </div>
            <div className="print:pb-6">
              <div className="no-print">
                <DialogHeader className="pb-2">
                  <DialogTitle>Bill Details</DialogTitle>
                </DialogHeader>
              </div>

              <div className="grid gap-2 py-1">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Name:</Label>
                    <p>{patient?.name || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">UHID No:</Label>
                    <p>{patient?.registrationNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Contact:</Label>
                    <p>{patient?.phone || patient?.contactNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">IPD No:</Label>
                    <p>{completedBill?.admissionRecord?.ipdNumber || completedBill?.admission?.ipdNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Invoice Number:</Label>
                    <p>{bill?.invoiceNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Date:</Label>
                    <p>
                      {bill?.createdAt
                        ? format(new Date(bill.createdAt), "dd/MM/yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-md">
                  <div className="border-2 p-6 rounded-lg shadow-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold">Payment Receipt</h3>
                      <p className="text-sm text-gray-600">
                        {bill?.createdAt
                          ? format(new Date(bill.createdAt), "dd/MM/yyyy hh:mm a")
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">Sub Total:</span>
                        <span className="font-medium">₹{(bill?.subtotal || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">Discount:</span>
                        <span className="font-medium">₹{(bill?.additionalDiscount || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                        <span className="font-semibold">Net Total:</span>
                        <span className="font-semibold">
                          ₹{((bill?.subtotal || 0) - (bill?.additionalDiscount || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">Paid:</span>
                        <span className="text-green-600 font-medium">
                          ₹{(bill?.amountPaid || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                        <span className="font-semibold">Balance:</span>
                        <span className="text-red-600 font-semibold">
                          ₹{((bill?.totalAmount || 0) - (bill?.amountPaid || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center mt-4 pt-2 border-t-2 border-gray-200">
                        <div className="font-medium text-base">
                          <span>Status: </span>
                          <span className={getBillStatus(bill) === "Paid" ? "text-green-600" : "text-red-600"}>
                            {getBillStatus(bill)}
                          </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                          <p>Amount in words:</p>
                          <p className="font-medium">
                            {numberToWords(bill?.totalAmount || 0)} Rupees Only
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {(bill?.payments || completedBill?.payment) && (
                  <div className="mt-1">
                    <h3 className="text-lg font-semibold mb-1">Payment History</h3>
                    {(bill?.payments?.length > 0 || completedBill?.payment?.length > 0) ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Date</TableHead>
                            <TableHead className="w-[80px]">Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(completedBill?.payment || bill?.payments)?.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">
                                {format(new Date(payment.createdAt), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell className="text-xs">
                                {format(new Date(payment.createdAt), "hh:mm a")}
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                ₹{payment.amount?.toFixed(2) || "0.00"}
                              </TableCell>
                              <TableCell className="text-xs">
                                {payment.paymentMethod || "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-gray-500 py-4">
                        <AlertCircle size={18} />
                        <span>No payment history found</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
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
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default BillModal;
