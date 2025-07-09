import React, { useRef, useState, useMemo, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
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
import { numberToWords, parseAge } from "../../../assets/Data";
import { useSelector } from "react-redux";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { AlertCircle } from "lucide-react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { ScrollArea } from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { X } from "lucide-react";
import PaymentReceipt from "../print/PaymentReceipt";
import RenewalAlertDlg from "../renewal/RenewalAlertDlg";
import { formatCurrency } from "../../../assets/Data";

const ViewBillDialog = ({ isOpen, setIsOpen, billData, viewMode: viewModeProp }) => {
  const componentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const {settings} = useSelector((state) => state.hospitalSettings);
  const [viewMode, setViewMode] = useState(viewModeProp); 
  
  useEffect(() => {
    if (settings) {
      setViewMode(viewModeProp || settings.defaultBillPrintView || "list");
      
    }
  }, [settings, viewModeProp]);
  const [selectedServices, setSelectedServices] = useState([]);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);
  const headerTemplateStrings = useSelector(
    (state) => state.templates.headerTemplateArray
  );
  const headerTemplateString =
    headerTemplateStrings?.length > 0
      ? headerTemplateStrings[0].value
      : headerTemplateStringDefault;
  const HeaderComponent = createDynamicComponentFromString(
    headerTemplateString || headerTemplateStringDefault
  );
  const [printPaymentHistory, setPrintPaymentHistory] = useState(true);

  const services = billData?.services || [];

  const servicesGroupedByDate = useMemo(() => {
    if (!services || !Array.isArray(services)) return [];
    if (viewMode !== "datewise") return [];

    const grouped = services.reduce((acc, service, index) => {
      const date = service.date
        ? format(new Date(service.date), "yyyy-MM-dd")
        : "No Date";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ ...service, originalIndex: index });
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, services]) => ({
        date,
        services: services.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date) - new Date(b.date);
        }),
      }));
  }, [services, viewMode]);

  React.useEffect(() => {
    if (billData?.services) {
      setSelectedServices(billData.services.map((_, index) => index));
    }
  }, [billData]);
  React.useEffect(() => {
    return () => {
      document.body.style = "";
    };
  }, []);
  const toggleAllServices = (checked) => {
    if (checked) {
      setSelectedServices(services.map((_, index) => index));
    } else {
      setSelectedServices([]);
    }
  };

  const toggleService = (index, checked) => {
    setSelectedServices((prev) => {
      if (checked) {
        return [...prev, index];
      } else {
        return prev.filter((i) => i !== index);
      }
    });
  };

  const handlePrintMethod = () => {
    if (hospitalInfo.discontinuedDaysLeft < 0) {
      setIsRenewalDialogOpen(true);
    } else {
      handlePrint();
    }
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

  if (!billData) return null;

  const getBillStatus = (bill) => {
    if (!bill) return "N/A";
    return bill.amountPaid === bill.totalAmount ? "Paid" : "Due";
  };

  const calculateSelectedTotals = () => {
    const deselectedTotal = services.reduce((acc, service, index) => {
      if (!selectedServices.includes(index)) {
        acc += (service.quantity || 0) * (service.rate || 0);
      }
      return acc;
    }, 0);

    return {
      subTotal: (billData.subtotal || 0) - deselectedTotal,
    };
  };

  const renderTableBody = () => {
    if (viewMode === "datewise" && servicesGroupedByDate.length > 0) {
      return (
        <TableBody>
          {servicesGroupedByDate.map(({ date, services: dateServices }) => (
            <React.Fragment key={date}>
              <TableRow className="bg-gray-50 ">
                <TableCell
                  colSpan={4}
                  className="font-semibold  text-[13px] h-[25px] py-0"
                >
                  {date === "No Date"
                    ? "No Date"
                    : format(new Date(date), "dd/MM/yyyy")}
                </TableCell>
              </TableRow>
              {dateServices.map((service) => (
                <TableRow
                  key={service.originalIndex}
                  className={`border-b border-gray-200 ${
                    !selectedServices.includes(service.originalIndex) &&
                    isPrinting
                      ? "hidden"
                      : ""
                  }`}
                >
                  <TableCell className="border-r border-gray-200 no-print h-[25px] py-1">
                    <Checkbox
                      checked={selectedServices.includes(service.originalIndex)}
                      onCheckedChange={(checked) =>
                        toggleService(service.originalIndex, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="border-r border-gray-200 hidden print:table-cell h-[25px] py-1">
                    {selectedServices.includes(service.originalIndex)
                      ? selectedServices.filter(
                          (i) => i <= service.originalIndex
                        ).length
                      : ""}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 h-[25px] py-1">
                    {service.name || "N/A"}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 h-[25px] py-1">
                    {service.quantity || 0}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 h-[25px] py-1 text-right">
                    {formatCurrency(service.rate || 0)}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 h-[25px] py-1 text-right">
                    {formatCurrency((service.quantity || 0) * (service.rate || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      );
    }

    return (
      <TableBody>
        {services.map((service, index) => (
          <TableRow
            key={index}
            className={`border-b border-gray-200 ${
              !selectedServices.includes(index) && isPrinting ? "hidden" : ""
            }`}
          >
            <TableCell className="border-r border-gray-200 no-print h-[25px] py-1">
              <Checkbox
                checked={selectedServices.includes(index)}
                onCheckedChange={(checked) => toggleService(index, checked)}
              />
            </TableCell>
            <TableCell className="border-r border-gray-200 hidden print:table-cell h-[25px] py-1">
              {selectedServices.includes(index)
                ? selectedServices.filter((i) => i <= index).length
                : ""}
            </TableCell>
            <TableCell className="border-r border-gray-200 h-[25px] py-1">
              {service.name || "N/A"}
            </TableCell>
            {viewMode==="list" && <TableCell className="border-r border-gray-200 h-[25px] py-1">
              {service.date
                ? format(new Date(service.date), "dd/MM/yyyy")
                : "N/A"}
            </TableCell>
  }

            <TableCell className="border-r border-gray-200 h-[25px] py-1 text-center">
              {service.quantity || 0}
            </TableCell>
            <TableCell className="border-r border-gray-200 h-[25px] py-1 text-right">
              {formatCurrency(service.rate || 0)}
            </TableCell>
            <TableCell className="border-r border-gray-200 h-[25px] py-1 text-right">
              {formatCurrency((service.quantity || 0) * (service.rate || 0))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible rounded-lg">
        <ScrollArea className="max-h-[80vh] pr-3 ">
          <div ref={componentRef} className={isPrinting ? "print-content" : ""}>
            <div className="hidden print:block mb-2">
              <HeaderComponent hospitalInfo={hospitalInfo} />
            </div>
            <div className="print:pb-6">
              <div className="no-print">
                <DialogHeader className="pb-2">
                  <DialogTitle>Bill Details</DialogTitle>
                </DialogHeader>
              </div>
              <div className="grid gap-2 py-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <Label className="font-semibold mr-2">Name:</Label>
                    <p>{billData.patientInfo?.name || "N/A"}</p>
                  </div>
                  {billData.patientInfo?.registrationNumber ||
                  billData.patient?.registrationNumber ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">UHID No:</Label>
                      <p>
                        {billData.patientInfo?.registrationNumber ||
                          billData.patient?.registrationNumber}
                      </p>
                    </div>
                  ) : null}
                  {billData.patientInfo?.contactNumber ||
                  billData.patientInfo?.phone ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Contact:</Label>
                      <p>
                        {billData.patientInfo?.contactNumber ||
                          billData.patientInfo?.phone}
                      </p>
                    </div>
                  ) : null}
                  {billData.patientInfo?.ipdNumber ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">IPD No:</Label>
                      <p>{billData.patientInfo?.ipdNumber}</p>
                    </div>
                  ) : null}
                  {billData.patientInfo?.age || billData.patient?.age ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Age/Gender:</Label>
                      <p>{`${
                        parseAge(billData.patientInfo?.age || billData.patient?.age)
                      }/${
                        billData.patientInfo?.gender || billData.patient?.gender
                      }`}</p>
                    </div>
                  ) : null}
                  {billData.patientInfo?.address ||
                  billData.patient?.address ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Address:</Label>
                      <p>
                        {billData.patientInfo?.address ||
                          billData.patient?.address}
                      </p>
                    </div>
                  ) : null}
                  {billData.invoiceNumber ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">
                        Invoice Number:
                      </Label>
                      <p>{billData.invoiceNumber}</p>
                    </div>
                  ) : null}
                  {billData.admissionDate ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Admit Date:</Label>
                      <p>
                        {format(new Date(billData.admissionDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  ) : null}
                  {billData.dischargeDate ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">
                        Discharge Date:
                      </Label>
                      <p>
                        {format(new Date(billData.dischargeDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  ) : null}
                  {billData.createdAt &&
                  !billData.admissionDate &&
                  !billData.dischargeDate ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Date:</Label>
                      <p>
                        {format(new Date(billData.createdAt), "dd/MM/yyyy")}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div>
                  {" "}
                  {billData.operationName ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Operation:</Label>
                      <p>{billData.operationName}</p>
                    </div>
                  ) : null}
                </div>
                <div>
                  {billData.opdProcedure?.procedureName ? (
                    <div className="flex items-center">
                      <Label className="font-semibold mr-2">Proceudure:</Label>
                      <p>{billData.opdProcedure?.procedureName}</p>
                    </div>
                  ) : null}
                </div>
                {services.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="w-full">
                      <h3 className="text-lg font-semibold mb-1 no-print">
                        Bill Items
                      </h3>
                      <Table className="border-2 border-gray-200">
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-gray-200 ">
                            <TableHead className="border-r border-gray-300 w-16 no-print h-[30px] py-1">
                              <Checkbox
                                checked={
                                  selectedServices.length === services.length
                                }
                                onCheckedChange={toggleAllServices}
                              />
                            </TableHead>
                            <TableHead className="border-r border-gray-300 w-16 hidden print:table-cell h-[30px] py-1">
                              No.
                            </TableHead>
                            <TableHead className="border-r border-gray-300 w-1/3 h-[30px] py-1">
                              Service Name
                            </TableHead>

                            {(viewMode === "list" || !viewMode) && (
                              <TableHead className="border-r border-gray-300 w-24 h-[30px] py-1">
                                Date
                              </TableHead>
                            )}
                            <TableHead className="border-r border-gray-300 w-24 h-[30px] py-1 text-center">
                              Quantity
                            </TableHead>
                            <TableHead className="border-r border-gray-300 w-24 h-[30px] py-1 text-center">
                              Price (INR)
                            </TableHead>
                            <TableHead className="w-24 h-[30px] text-center">
                              Total (INR)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        {renderTableBody()}
                      </Table>
                    </div>
                    <RenewalAlertDlg
                      isOpen={isRenewalDialogOpen}
                      setIsOpen={setIsRenewalDialogOpen}
                    />

                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="border rounded px-3 space-y-2 bg-white text-sm">
                          <h3 className="font-semibold text-base border-b pb-1">
                            Payment Summary
                          </h3>

                          <div className="flex flex-col space-y-0.5">
                            <div className="flex justify-between w-full items-center">
                              <span className="text-gray-600">Sub Total:</span>
                              <span>
                                {formatCurrency(calculateSelectedTotals().subTotal)}
                              </span>
                            </div>

                            <div className="flex justify-between w-full items-center">
                              <span className="text-gray-600">Discount:</span>
                              <span>
                                {formatCurrency(billData.additionalDiscount || 0)}
                              </span>
                            </div>

                            <div className="flex justify-between w-full items-center border-t border-gray-200 pt-0.5">
                              <span className="font-medium">Net Total:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  calculateSelectedTotals().subTotal -
                                  (billData.additionalDiscount || 0)
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between w-full items-center">
                              <span className="text-gray-600">Paid:</span>
                              <span className="text-green-600">
                                {formatCurrency(billData.amountPaid || 0)}
                              </span>
                            </div>

                            <div className="flex justify-between w-full items-center border-t border-gray-200 pt-0.5">
                              <span className="text-gray-600 font-semibold">
                                Balance:
                              </span>
                              <span className="text-red-600 font-semibold">
                                {formatCurrency(
                                  (billData.totalAmount || 0) -
                                  (billData.amountPaid || 0)
                                )}
                              </span>
                            </div>

                            <div className="w-full flex justify-between text-xs mt-0.5">
                              <span className="font-medium">Status:</span>
                              <span
                                className={
                                  getBillStatus(billData) === "Paid"
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                                }
                              >
                                {getBillStatus(billData)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-md">
                    <div className="border-2 p-6 rounded-lg shadow-sm">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold">
                          Payment Receipt
                        </h3>
                        <p className="text-sm text-gray-600">
                          {billData.createdAt
                            ? format(
                                new Date(billData.createdAt),
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
                            {formatCurrency(calculateSelectedTotals().subTotal)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-base">
                          <span className="text-gray-700 font-medium">
                            Discount:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(billData.additionalDiscount || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                          <span className="font-semibold">Net Total:</span>
                          <span className="font-semibold">
                            {formatCurrency(
                              billData.subtotal -
                              (billData.additionalDiscount || 0)
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-base">
                          <span className="text-gray-700 font-medium">
                            Paid:
                          </span>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(billData.amountPaid || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-2">
                          <span className="font-semibold">Balance:</span>
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(
                              (billData.totalAmount || 0) -
                              (billData.amountPaid || 0)
                            )}
                          </span>
                        </div>

                        <div className="text-center mt-4 pt-2 border-t-2 border-gray-200">
                          <div className="font-medium text-base">
                            <span>Status: </span>
                            <span
                              className={`${
                                getBillStatus(billData) === "Paid"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {getBillStatus(billData)}
                            </span>
                          </div>

                          <div className="mt-4 text-sm text-gray-600">
                            <p>Amount in words:</p>
                            <p className="font-medium">
                              {numberToWords(billData.totalAmount)} Rupees Only
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p>Invoice generated By: {billData?.createdBy?.name}</p>
                <div className="">
                  <div className={`${!printPaymentHistory ? "no-print" : ""}`}>
                    <div className="flex flex-row items-center mb-2 w-auto gap-2">
                      <Checkbox
                        id="printPaymentHistory"
                        checked={printPaymentHistory}
                        onCheckedChange={setPrintPaymentHistory}
                        className="print:hidden"
                      />
                      <h3 className="text-lg font-semibold">Payment History</h3>
                      {billData?.payments?.length > 0 && (
                        <PaymentReceipt
                          payments={billData?.payments}
                          billData={billData}
                          styleData={true}
                        />
                      )}
                    </div>

                    {billData?.payments && billData?.payments?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px] h-[30px]">
                                S.No.
                              </TableHead>
                              <TableHead className="w-[100px] h-[30px]">
                                Payment No
                              </TableHead>
                              <TableHead className="w-[150pxx] h-[30px]">
                                Date & Time
                              </TableHead>
                              <TableHead className="h-[30px]">
                                Amount (₹)
                              </TableHead>
                              <TableHead className="h-[30px]">Method</TableHead>
                              <TableHead className="h-[30px]">
                                Collected By
                              </TableHead>
                              <TableHead className="no-print h-[30px]">
                                Receipt
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {billData.payments.map((payment, index) => (
                              <TableRow key={index} className=" h-[25px] py-1">
                                <TableCell className="text-xs h-[25px] py-1">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-xs h-[25px] py-1">
                                  {payment?.paymentNumber || "--"}
                                </TableCell>
                                <TableCell className="text-xs h-[25px] py-1">
                                  {format(new Date(payment.createdAt), "dd/MM/yyyy hh:mm a")}
                                </TableCell>  
                                <TableCell className="text-xs font-medium h-[25px] py-1">
                                  {formatCurrency(payment?.amount)}
                                </TableCell>
                                <TableCell className="text-xs h-[25px] py-1">
                                  {payment.paymentMethod}
                                </TableCell>
                                <TableCell className="text-xs h-[25px] py-1">
                                  {payment.createdByName || "--"}
                                </TableCell>
                                <TableCell className="text-xs no-print h-[25px] py-1">
                                  <PaymentReceipt
                                    payment={payment}
                                    billData={billData}
                                  />
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
          </div>

          <div className="flex flex-col-reverse gap-1 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button type="button" variant="outline" onClick={handlePrintMethod}>
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

export default ViewBillDialog;
