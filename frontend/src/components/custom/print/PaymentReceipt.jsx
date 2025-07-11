import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";
import { parseAge } from "../../../assets/Data";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { format } from "date-fns";
import { numberToWords } from "../../../assets/Data";

const PaymentReceipt = ({ payment, payments, billData, styleData }) => {

  const { hospitalInfo } = useSelector((state) => state.hospital);
  const headerTemplateStrings = useSelector(
    (state) => state.templates.headerTemplateArray
  );
  const headerTemplateString =
    headerTemplateStrings?.length > 0
      ? headerTemplateStrings[0].value
      : headerTemplateStringDefault;
  const componentRef = useRef();
  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateString || headerTemplateStringDefault
  );

  const formatAmount = (amount) => {
    return amount?.toLocaleString("en-IN");
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
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
          padding: 20px;
        }
      }
    `,
  });

  // Use payments array if available, otherwise use single payment in an array
  const paymentsToRender = payments || (payment ? [payment] : []);

  return (
    <>
      <Button
        variant={styleData ? "outline" : "ghost"}
        size="icon"
        onClick={handlePrint}
        className={`flex print:hidden justify-center   items-center${
          styleData ? "px-2 w-[150px] ml-2" : ""
        }`}
      >
        <Printer className="h-3 w-3 mr-1" />{" "}
        {styleData ? "Print All Payments" : ""}
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content">
          <div className="border-black border-[1px] mt-5">
            <div className="hidden print:block ">
              <HospitalHeader hospitalInfo={hospitalInfo} />
            </div>
            <div className="border-black border-b-[1px] text-center text-2xl font-semibold uppercase flex justify-between px-4">
              <div className="w-1/3">{billData.patientType}</div>
              <div className="w-1/3">Receipt</div>
              <div className="w-1/3 text-right text-base pt-2">
                <span className="font-semibold">Invoice No: </span>
                {billData?.invoiceNumber ||
                  billData.billDetails?.invoiceNumber ||
                  ""}
              </div>
            </div>
            <div className="grid grid-cols-2 py-2 px-4 border-black border-b-[1px]">
              <div className="grid grid-cols-3">
                <p className="font-semibold">Patient Name:</p>
                <p className="col-span-2 capitalize">
                  {billData?.patient?.name ||
                    billData?.patientName ||
                    billData.patientInfo?.name}
                </p>
              </div>
              {(billData?.patient?.registrationNumber ||
                billData.patientInfo?.registrationNumber ||
                billData?.registrationNumber) && (
                <div className="grid grid-cols-3">
                  <p className="font-semibold">UHID No:</p>
                  <p className="col-span-2 capitalize">
                    {billData?.patient?.registrationNumber ||
                      billData.patientInfo?.registrationNumber ||
                      billData?.registrationNumber ||
                      ""}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3">
                <p className="font-semibold">Age/Gender:</p>
                <p className="col-span-2 capitalize">
                  {billData?.patient?.age ||
                  billData?.age ||
                  billData?.patientInfo?.age
                    ? `${
                      parseAge(billData?.patient?.age||billData?.age||billData?.patientInfo?.age)
                      }`
                    : ""}{" "}
                  /{" "}
                  {billData?.patient?.gender ||
                    billData?.gender ||
                    billData?.patientInfo?.gender ||
                    ""}
                </p>
              </div>
              {paymentsToRender.map((p) => p.paymentNumber).filter(Boolean)
                .length > 0 && (
                <div className="grid grid-cols-3">
                  <p className="font-semibold">Payment No:</p>
                  <p className="col-span-2 capitalize">
                    {paymentsToRender
                      .map((p) => p.paymentNumber)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3">
                <p className="font-semibold">Receipt Date</p>
                <p className="col-span-2 capitalize">
                  {format(
                    payment?.createdAt
                      ? new Date(payment?.createdAt)
                      : new Date(),
                    "dd-MM-yyyy hh:mm a"
                  )}
                </p>
              </div>
              {((billData?.procedureName||billData.opdProcedure?.procedureName) || billData?.operationName) && (
                <div className="grid grid-cols-3">
                  <p className="font-semibold">
                    {(billData?.procedureName||billData.opdProcedure?.procedureName) ? "Procedure" : "Operation"}
                  </p>
                  <p className="col-span-2 capitalize">
                    {(billData?.procedureName||billData.opdProcedure?.procedureName) || billData?.operationName || ""}
                  </p>
                </div>
              )}
              {billData?.patientInfo?.ipdNumber && (
                <div className="grid grid-cols-3">
                  <p className="font-semibold">OPD/IPD No:</p>
                  <p className="col-span-2 capitalize">
                    {billData?.patientInfo?.ipdNumber || ""}
                  </p>
                </div>
              )}
              {billData.labNumber && (
                <div className="grid grid-cols-3">
                  <p className="font-semibold">Lab No:</p>
                  <p className="col-span-2 capitalize">
                    {billData.labNumber || ""}
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-12 pb-2 px-4 font-semibold border-black border-b-[1px] ">
              <div className="col-span-2">S.No.</div>
              <div className="col-span-8">Particular</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {paymentsToRender.map((paymentItem, paymentIndex) => (
              <div
                key={paymentIndex}
                className="grid grid-cols-12 pb-2 px-4 border-black border-b-[1px]"
              >
                <div className="col-span-2">{paymentIndex + 1}</div>
                <div className="col-span-8">
                  {billData?.procedureName || billData?.operationName
                    ? `Payment for ${
                        billData?.procedureName || billData?.operationName
                      }`
                    : "Deposit"}
                </div>
                <div className="col-span-2 text-right">
                  {formatAmount(paymentItem?.amount)}
                </div>
              </div>
            ))}
            <div className="border-black border-b-[1px] px-4 py-2">
              Amount(In Words) :{" "}
              {numberToWords(
                paymentsToRender.reduce(
                  (total, payment) => total + (payment?.amount || 0),
                  0
                )
              )}{" "}
              Only.
            </div>
            <div className="px-4 py-2 border-black border-b-[1px] flex flex-row gap-2">
              {paymentsToRender.map((paymentItem, paymentIndex) => (
                <div key={paymentIndex}>
                  <p>
                    Payment {paymentIndex + 1} Method :{" "}
                    {paymentItem?.paymentMethod || paymentItem?.method || "N/A"}
                  </p>
                  {paymentItem?.utr && (
                    <p>
                      UTR No. {paymentIndex + 1} : {paymentItem?.utr}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 h-[60px]">
              <div
                className="col-span-2 pl-4 flex items-center text-2xl justify-center"
                style={{ fontFamily: "cursive" }}
              >
                Thank you
              </div>
              <div className="border-black border-l-[1px] pl-4 flex items-end pb-2 justify-center">
                Signatory Authority
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceipt;
