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
import { ScrollArea } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { useSelector } from "react-redux";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Checkbox } from "../../ui/checkbox";
import PaymentReceipt from "../print/PaymentReceipt";

const LabDetailsModal = ({ isOpen, setShowModal, labData, hospitalInfo }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [printPaymentHistory, setPrintPaymentHistory] = useState(true);
  const isMobile = useMediaQuery("(max-width: 640px)");

  React.useEffect(() => {
    if (labData?.labTests) {
      setSelectedTests(labData.labTests.map((_, index) => index));
    }
  }, [labData]);

  React.useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = "";
      document.body.style = "";
    }
    return () => {
      document.body.style = "";
    };
  }, [isOpen]);

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

  const handleClose = () => {
    setShowModal(false);
    document.body.style.pointerEvents = "";
    document.body.style = "";
  };

  const headerTemplateStrings = useSelector(
    (state) => state.templates.headerTemplateArray
  );
  const headerTemplateString =
    headerTemplateStrings?.length > 0
      ? headerTemplateStrings[0].value
      : headerTemplateStringDefault;
  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplateStringDefault
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "warning";
      case "Registered":
      case "Pending":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!labData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh] pr-3">
          <div ref={componentRef} className={isPrinting ? "print-content" : ""}>
            <div className="hidden print:block mb-2">
              <HospitalHeader hospitalInfo={hospitalInfo} />
            </div>
            <div className="print:pb-6">
              <div className="no-print">
                <DialogHeader className="pb-2">
                  <DialogTitle>Lab Registration Details</DialogTitle>
                </DialogHeader>
              </div>

              <div className="grid gap-2 py-1">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Name:</Label>
                    <p>{labData?.patientName || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Age/Gender:</Label>
                    <p>
                      {labData?.age || "N/A"}/{labData?.gender || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">UHID No:</Label>
                    <p>{labData?.registrationNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Lab No:</Label>
                    <p>{labData?.labNumber || "N/A"}</p>
                  </div>
                  {labData.billDetails?.invoiceNumber && (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Invoice No:</Label>
                      <p>{labData.billDetails?.invoiceNumber}</p>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Contact:</Label>
                    <p>{labData?.contactNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Address:</Label>
                    <p>{labData?.address || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Booking Date:</Label>
                    <p>
                      {labData?.bookingDate
                        ? format(new Date(labData.bookingDate), "dd/MM/yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  {labData?.referredBy && (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Referred By:</Label>
                      <p>{labData.referredBy.name || "N/A"}</p>
                    </div>
                  )}
                </div>

                {/* <div className="mx-auto w-full max-w-md">
                  <div className="border-2 p-6 rounded-lg shadow-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold">
                        Lab Registration Receipt
                      </h3>
                      <p className="text-sm text-gray-600">
                        {labData.createdAt
                          ? format(
                              new Date(labData.createdAt),
                              "dd/MM/yyyy hh:mm a"
                            )
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">
                          Sub Total:
                        </span>
                        <span className="font-medium">
                          ₹{labData.paymentInfo.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">
                          Discount:
                        </span>
                        <span className="font-medium">
                          ₹{labData.paymentInfo.additionalDiscount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                        <span className="font-semibold">Net Total:</span>
                        <span className="font-semibold">
                          ₹
                          {(
                            labData.paymentInfo.totalAmount -
                            labData.paymentInfo.additionalDiscount
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">Paid:</span>
                        <span className="text-green-600 font-medium">
                          ₹{labData.paymentInfo.amountPaid.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                        <span className="font-semibold">Balance:</span>
                        <span className="text-red-600 font-semibold">
                          ₹{labData.paymentInfo.balanceDue.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center mt-4 pt-2 border-t-2 border-gray-200">
                        <div className="font-medium text-base">
                          <span>Status: </span>
                          <Badge
                            variant={getStatusBadgeVariant(labData.status)}
                          >
                            {labData.status}
                          </Badge>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                          <p>Amount in words:</p>
                          <p className="font-medium">
                            {numberToWords(labData.paymentInfo.totalAmount)}{" "}
                            Rupees Only
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Lab Tests Section */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Lab Tests</h3>
                  <Table className="border-2 border-gray-200">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-200">
                        <TableHead className="w-16 hidden print:table-cell">
                          No.
                        </TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                       
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labData?.labTests?.map((test, index) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200"
                        >
                          <TableCell className="hidden print:table-cell">
                            {index + 1}
                          </TableCell>
                          <TableCell>{test.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(test.reportStatus)}
                            >
                              {test.reportStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{test.price?.toFixed(2) || "0.00"}
                          </TableCell>
                         
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell className="hidden print:table-cell"></TableCell>
                        <TableCell colSpan={2} className="text-right">
                          Total:
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {labData?.labTests
                            ?.reduce((sum, test) => sum + (test.price || 0), 0)
                            ?.toFixed(2)}
                        </TableCell>
                        
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="flex justify-end">
                    <div className="mt-4 border-2 rounded-lg p-4 bg-gray-50 w-1/2">
                      <h4 className="text-lg font-semibold mb-3">
                        Payment Summary
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span>
                            ₹{labData.paymentInfo.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Discount:</span>
                          <span>
                            ₹{labData.paymentInfo.additionalDiscount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Net Amount:</span>
                          <span>
                            ₹
                            {(
                              labData.paymentInfo.totalAmount -
                              labData.paymentInfo.additionalDiscount
                            )?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Amount Paid:</span>
                          <span>
                            ₹{labData.paymentInfo.amountPaid?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600 font-medium border-t pt-2">
                          <span>Balance Due:</span>
                          <span>
                            ₹{labData.paymentInfo.balanceDue?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-4 ${!printPaymentHistory ? "no-print" : ""}`}
                >
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2 mb-2 no-print">
                      <Checkbox
                        id="printPaymentHistory"
                        checked={printPaymentHistory}
                        onCheckedChange={setPrintPaymentHistory}
                      />
                      <Label htmlFor="printPaymentHistory">
                        Include Payment History in Print
                      </Label>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Payment History
                  </h3>
                  {labData?.paymentInfo?.paymentMethod?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {!isMobile && <TableHead>Time</TableHead>}
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="no-print">Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {labData.paymentInfo.paymentMethod.map(
                          (payment, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {format(
                                  new Date(labData.createdAt),
                                  "dd/MM/yyyy"
                                )}
                              </TableCell>
                              {!isMobile && (
                                <TableCell>
                                  {format(
                                    new Date(labData.createdAt),
                                    "hh:mm a"
                                  )}
                                </TableCell>
                              )}
                              <TableCell>
                                ₹{payment.amount?.toFixed(2)}
                              </TableCell>
                              <TableCell>{payment.method}</TableCell>
                              <TableCell className="no-print">
                                <PaymentReceipt
                                  payment={payment}
                                  billData={labData}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-gray-500 py-4">
                      <AlertCircle size={18} />
                      <span>No payment history found</span>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                {labData?.notes && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700">{labData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 justify-end">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Details
            </Button>
          </div>
        </ScrollArea>

        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default LabDetailsModal;
