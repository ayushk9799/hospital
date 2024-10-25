import React, { useRef, useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { Button } from "../../ui/button";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { PrinterIcon } from "lucide-react";
import { numberToWords } from "../../../assets/Data";
import { stylesFont } from "../reports/LabReportPDF";
import { useSelector } from "react-redux";
import HospitalHeader from "../../../utils/print/HospitalHeader";
import { AlertCircle } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const ViewBillDialog = ({ isOpen, setIsOpen, billData }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');

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
          padding: 10mm;
        }
      }
    `,
  });

  if (!billData) return null;

  const services = billData.services || [];
  const totalAmountInWords = numberToWords(billData.totalAmount.toFixed(0) || 0);

  const getBillStatus = (bill) => {
    if (!bill) return 'N/A';
    return bill.amountPaid === bill.totalAmount ? "Paid" : "Due";
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onOpenChange={setIsOpen} className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
        <div 
          ref={componentRef}
          className={isPrinting ? 'print-content' : ''}
        >
          <div className="hidden print:block mb-4">
            <HospitalHeader />
          </div>
          <div className="print:pb-10"> {/* Add padding to the bottom */}
            <div className="no-print">
              <DialogHeader>
                <DialogTitle>Bill Details</DialogTitle>
                <DialogDescription>Full details of the bill</DialogDescription>
              </DialogHeader>
            </div>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="w-1/3 font-semibold">Patient Name:</Label>
                    <p className="w-2/3">{billData.patientInfo?.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="w-1/3 font-semibold">Bill Number:</Label>
                    <p className="w-2/3">B{billData._id?.slice(-6) || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="w-1/3 font-semibold">Date:</Label>
                    <p className="w-2/3">{billData.createdAt ? format(new Date(billData.createdAt), "MMM dd, yyyy") : 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="w-1/3 font-semibold">Time:</Label>
                    <p className="w-2/3">{billData.createdAt ? format(new Date(billData.createdAt), "hh:mm a") : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 no-print">Bill Items</h3>
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
                  <span className="font-semibold">Bill Status: </span>{getBillStatus(billData)}
                </div>
                {/* <div className="w-full text-left text-sm mt-1">
                  <span className="font-semibold">Invoice By: </span>{billData.physician || 'N/A'}
                </div> */}
              </div>
              {/* Add this new section for the payment table */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                {billData?.payments && billData?.payments?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Date</TableHead>
                          {!isMobile && <TableHead className="w-[80px]">Time</TableHead>}
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billData.payments.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                            {!isMobile && (
                              <TableCell className="text-xs">
                                {new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                              </TableCell>
                            )}
                            <TableCell className="text-xs font-medium">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-xs">{payment.paymentMethod}</TableCell>
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
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:space-y-0 sm:space-x-2">
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
