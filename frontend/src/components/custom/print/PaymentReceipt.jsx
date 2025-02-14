import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString as headerTemplateStringDefault } from "../../../templates/headertemplate";
import { format } from "date-fns";
import { numberToWords } from "../../../assets/Data";

const PaymentReceipt = ({ payment, billData, styleData }) => {
    
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
    return amount?.toLocaleString('en-IN');
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

  return (
    <>
      <Button variant={styleData ? 'outline' : 'ghost'}  size="icon" onClick={handlePrint} className={`flex justify-center items-center${styleData ? "px-4 w-full" : "h-6 w-6"}`}>
        <Printer className="h-4 w-4 mr-2" /> {styleData ? "Print Receipt" : ""}
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content">
            <div className=" border-black border-[1px] mt-5 ">
                <div className="hidden print:block border-b-[1px] border-black p-4">
                    <HospitalHeader hospitalInfo={hospitalInfo} />
                </div>
                <div className="border-black border-b-[1px] text-center text-2xl font-semibold uppercase">Receipt</div>
                <div className="grid grid-cols-2 py-2 px-4 border-black border-b-[1px]">
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">Patient Name:</p>
                        <p className="col-span-2 capitalize">{billData?.patient?.name || ''}</p>
                    </div>
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">UHID No:</p>
                        <p className="col-span-2 capitalize">{billData?.patient?.registrationNumber || ''}</p>
                    </div>
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">Age/Gender:</p>
                        <p className="col-span-2 capitalize">{billData?.patient?.age ? `${billData?.patient?.age} Years` : ''} / {billData?.patient?.gender || ''}</p>
                    </div>
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">Receipt Date</p>
                        <p className="col-span-2 capitalize">
                            {format(billData?.createdAt ? new Date(billData?.createdAt) : new Date(), "dd-MM-yyyy hh:mm a")}
                        </p>
                    </div>
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">Invoice No:</p>
                        <p className="col-span-2 capitalize">{billData?.invoiceNumber || ''}</p>
                    </div>
                    <div className="grid grid-cols-3">
                        <p className="font-semibold">OPD/IPD No:</p>
                        <p className="col-span-2 capitalize">{billData?.patientInfo?.ipdNumber || ''}</p>
                    </div>
                </div>
                <div className="grid grid-cols-12 pb-2 px-4 font-semibold border-black border-b-[1px] ">
                    <div className="col-span-2">S.No.</div>
                    <div className="col-span-8">Particular</div>
                    <div className="col-span-2 text-right">Amount</div>
                </div>
                <div className="grid grid-cols-12 pb-2 px-4 border-black border-b-[1px]">
                    <div className="col-span-2">1</div>
                    <div className="col-span-8">Deposit</div>
                    <div className="col-span-2 text-right">{formatAmount(payment?.amount)}</div>
                </div>
                <div className=" border-black border-b-[1px] px-4 py-2">Amount(In Words) : {numberToWords(payment?.amount)} Only.</div>
                <div className="px-4 py-2 border-black border-b-[1px]">
                    <p>Payment Method : {payment?.paymentMethod || 'N/A'}</p>
                    <p>UTR No.</p>
                </div>
                <div className="grid grid-cols-3 h-[60px]">
                    <div className="col-span-2 pl-4 flex items-center text-2xl justify-center" style={{ fontFamily: 'cursive' }}>Thank you</div>
                    <div className="border-black border-l-[1px] pl-4 flex items-end pb-2 justify-center">Signatory Authority</div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceipt;
