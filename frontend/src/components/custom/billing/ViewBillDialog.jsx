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
import { ScrollArea } from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";

const ViewBillDialog = ({ isOpen, setIsOpen, billData }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [selectedServices, setSelectedServices] = useState([]);
 console.log(billData)

  React.useEffect(() => {
    if (billData?.services) {
      setSelectedServices(billData.services.map((_, index) => index));
    }
  }, [billData]);

  const toggleAllServices = (checked) => {
    if (checked) {
      setSelectedServices(services.map((_, index) => index));
    } else {
      setSelectedServices([]);
    }
  };

  const toggleService = (index, checked) => {
    setSelectedServices(prev => {
      if (checked) {
        return [...prev, index];
      } else {
        return prev.filter(i => i !== index);
      }
    });
  };

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
         
        }
      }
    `,
  });

  if (!billData) return null;

  const services = billData.services || [];

  const getBillStatus = (bill) => {
    if (!bill) return 'N/A';
    return bill.amountPaid === bill.totalAmount ? "Paid" : "Due";
  }

  const calculateSelectedTotals = () => {
    return services.reduce((acc, service, index) => {
      if (selectedServices.includes(index)) {
        acc.subTotal += (service.quantity || 0) * (service.rate || 0);
      }
      return acc;
    }, { subTotal: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onOpenChange={setIsOpen} className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh]">
          <div 
            ref={componentRef}
            className={isPrinting ? 'print-content' : ''}
          >
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
                    <Label className="font-semibold mr-2">Patient Name:</Label>
                    <p>{billData.patientInfo?.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Bill Number:</Label>
                    <p>B{billData._id?.slice(-6) || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Date:</Label>
                    <p>{billData.createdAt ? format(new Date(billData.createdAt), "MMM dd, yyyy") : 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Time:</Label>
                    <p>{billData.createdAt ? format(new Date(billData.createdAt), "hh:mm a") : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 no-print">Bill Items</h3>
                  <Table className="border-2 border-gray-200">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-200">
                        <TableHead className="border-r border-gray-300 w-16 no-print">
                          <Checkbox 
                            checked={selectedServices.length === services.length}
                            onCheckedChange={toggleAllServices}
                          />
                        </TableHead>
                        <TableHead className="border-r border-gray-300 w-16 hidden print:table-cell">No.</TableHead>
                        <TableHead className="border-r border-gray-300 w-1/2">Service Name</TableHead>
                        <TableHead className="border-r border-gray-300 w-24">Quantity</TableHead>
                        <TableHead className="border-r border-gray-300 w-24">Price (INR)</TableHead>
                        <TableHead className="w-24">Total (INR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service, index) => (
                        <TableRow 
                          key={index} 
                          className={`border-b border-gray-200 ${
                            !selectedServices.includes(index) && isPrinting ? 'hidden' : ''
                          }`}
                        >
                          <TableCell className="border-r border-gray-200 no-print">
                            <Checkbox 
                              checked={selectedServices.includes(index)}
                              onCheckedChange={(checked) => toggleService(index, checked)}
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-200 hidden print:table-cell">
                            {selectedServices.includes(index) ? selectedServices.indexOf(index) + 1 : ''}
                          </TableCell>
                          <TableCell className="border-r border-gray-200">{service.name || 'N/A'}</TableCell>
                          <TableCell className="border-r border-gray-200">{service.quantity || 0}</TableCell>
                          <TableCell className="border-r border-gray-200">{(service.rate || 0).toFixed(2)}</TableCell>
                          <TableCell>{((service.quantity || 0) * (service.rate || 0)).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col items-end space-y-0.5 mt-1 ">
                  <div className="flex justify-end w-48 items-center text-sm">
                    <span className="text-gray-600 mr-3">Sub Total:</span>
                    <span>₹{calculateSelectedTotals().subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end w-48 items-center text-sm">
                    <span className="text-gray-600 mr-3">Discount:</span>
                    <span>₹{(billData.additionalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
                    <span className="font-medium mr-3">Net Total:</span>
                    <span className="font-medium">
                      ₹{(calculateSelectedTotals().subTotal - (billData.additionalDiscount || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-end w-48 items-center text-sm">
                    <span className="text-gray-600 mr-3">Paid:</span>
                    <span className="text-green-600">₹{(billData.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
                    <span className="text-gray-600 mr-3">Balance:</span>
                    <span className="text-red-600">₹{((billData.totalAmount || 0) - (billData.amountPaid || 0)).toFixed(2)}</span>
                  </div>
                  <div className="text-xs mt-0.5">
                    <span className="font-medium">Status: </span>{getBillStatus(billData)}
                  </div>
                </div>
                <div className="mt-1">
                  <h3 className="text-lg font-semibold mb-1">Payment History</h3>
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
        </ScrollArea>
        <DialogFooter className="flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2">
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
