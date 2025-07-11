import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { Label } from "../../ui/label";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { useSelector } from "react-redux";
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
import PaymentReceipt from "../print/PaymentReceipt";
import { parseAge } from "../../../assets/Data";

const BillModal = ({
  isOpen,
  setShowBillModal,
  billData,
  hospitalInfo,
  completedBill,
}) => {
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
    setShowBillModal(false);
    document.body.style.pointerEvents = "";
    document.body.style = "";

    setTimeout(() => {
      document.body.style.pointerEvents = "";
      document.body.style = "";
    }, 300);
  };
  const bill = completedBill?.bill || billData;
  const patient = completedBill?.patient || billData?.patientInfo;
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
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh]">
          <div ref={componentRef} className={isPrinting ? "print-content" : ""}>
            <div className="hidden print:block mb-2">
              <HospitalHeader hospitalInfo={hospitalInfo} />
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
                    <Label className="font-semibold mr-2">Age/Gender:</Label>
                    <p>
                      {parseAge(patient?.age) || "N/A"}/{patient?.gender || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">UHID No:</Label>
                    <p>{patient?.registrationNumber || "N/A"}</p>
                  </div>

                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">IPD No:</Label>
                    <p>
                      {completedBill?.admissionRecord?.ipdNumber ||
                        completedBill?.admission?.ipdNumber ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Contact:</Label>
                    <p>{patient?.phone || patient?.contactNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Address:</Label>
                    <p>{patient?.address || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">
                      Invoice Number:
                    </Label>
                    <p>{bill?.invoiceNumber || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Date:</Label>
                    <p>
                      {bill?.createdAt
                        ? format(new Date(bill?.createdAt), "dd/MM/yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {(completedBill.admissionRecord?.operationName ||
                    completedBill.admission?.operationName) && (
                      <Label className="font-semibold mr-2">Operation:</Label>
                    )}

                  {completedBill.admissionRecord?.operationName ||
                    completedBill.admission?.operationName}
                </div>
                <div className="mx-auto w-full max-w-md">
                  <div className="border-2 p-6 rounded-lg shadow-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold">Payment Receipt</h3>
                      <p className="text-sm text-gray-600">
                        {bill?.createdAt
                          ? format(
                              new Date(bill.createdAt),
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
                          ₹{(bill?.subtotal || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-700 font-medium">
                          Discount:
                        </span>
                        <span className="font-medium">
                          ₹{(bill?.additionalDiscount || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                        <span className="font-semibold">Net Total:</span>
                        <span className="font-semibold">
                          ₹
                          {(
                            (bill?.subtotal || 0) -
                            (bill?.additionalDiscount || 0)
                          ).toFixed(2)}
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
                          ₹
                          {(
                            (bill?.totalAmount || 0) - (bill?.amountPaid || 0)
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center mt-4 pt-2 border-t-2 border-gray-200">
                        <div className="font-medium text-base">
                          <span>Status: </span>
                          <span
                            className={
                              getBillStatus(bill) === "Paid"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
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

                <div className="mt-4">
                  <div className="flex flex-row items-center mb-2 w-auto">
                    <h3 className="text-lg font-semibold ">Payment History</h3>
                    {completedBill?.payment?.length > 0 && (
                      <PaymentReceipt
                        payments={completedBill.payment}
                        billData={{
                          ...completedBill?.bill,
                          patient: completedBill?.patient,
                          operationName: completedBill?.admissionRecord?.operationName || completedBill?.admission?.operationName,
                        }}
                        styleData={true}
                      />
                    )}
                  </div>
                  {bill?.payments?.length > 0 ||
                  completedBill?.payment?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] h-[30px]">Date</TableHead>
                          <TableHead className="w-[80px] h-[30px]">Time</TableHead>
                          <TableHead className="h-[30px]">Amount</TableHead>
                          <TableHead className="h-[30px]">Method</TableHead>
                          <TableHead className="no-print h-[30px]">Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(completedBill?.payment || bill?.payments)?.map(
                          (payment, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">
                                {format(
                                  new Date(payment.createdAt),
                                  "dd/MM/yyyy"
                                )}
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
                              <TableCell className="no-print">
                                <PaymentReceipt
                                  payment={completedBill?.payment?.[0]}
                                  billData={{
                                    ...completedBill?.bill,
                                    patient: completedBill?.patient,
                                    operationName: completedBill?.admissionRecord?.operationName || completedBill?.admission?.operationName,
                                  }}
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
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 justify-end">
            <Button type="button" variant="secondary" onClick={handleClose}>
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
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default BillModal;
