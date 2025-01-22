import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { useReactToPrint } from "react-to-print";
import { useToast } from "../hooks/use-toast";

export default function BirthCertificate({
  open,
  onOpenChange,
  hospitalInfo,
  motherData,
  babyData,
  certificateNumber,
}) {
  const { toast } = useToast();
  const [relationText, setRelationText] = useState("W/O");
  const [guardianName, setGuardianName] = useState(
    motherData?.guardianName || ""
  );
  const [fatherName, setFatherName] = useState("");
  const [relationToChild, setRelationToChild] = useState("FATHER");

  const componentRef = useRef();
  const relationInputRef = useRef();
  const guardianInputRef = useRef();
  const relationToChildInputRef = useRef();
  const fatherNameInputRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-content {
          width: 210mm;
          height: 148.5mm;
          padding: 5mm;
          margin: 0;
          background-color: white;
          page-break-after: always;
        }
        .print-input:empty {
          display: none !important;
        }
        .print-input {
          border: none !important;
          padding: 0 !important;
          background: none !important;
          font-weight: bold !important;
          display: inline !important;
          width: auto !important;
        }
      }
    `,
    removeAfterPrint: true,
  });

  const handleInputChange = (e, setter, inputRef) => {
    const { value } = e.target;
    setter(value);
    if (inputRef.current) {
      const length = value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  const PrintableContent = React.forwardRef((props, ref) => (
    <div ref={ref} className="print-content space-y-3 border-4 border-double border-gray-800 ">
      {/* Hospital Header */}
      <div className="  p-1 rounded-t-lg ">
        <div className="flex items-start gap-4 ">
          {/* Logo */}
          <div className="shrink-0 ">
            <img
              src={hospitalInfo?.logo}
              alt="Hospital Logo"
              className="h-[120px] w-[120px] object-contain bg-white rounded-full p-1 border-2 border-white/50"
            />
          </div>

          {/* Hospital Info */}
          <div className="flex-1">
            <div className="text-center">
              <div
                className="text-3xl font-bold mb-1 bg-purple-600  p-2 pb-1 text-white flex justify-center items-center"
                style={{ fontFamily: "Arial" }}
              >
                राजेश्वर मैटरनिटी एंड सर्जिकल हॉस्पिटल
              </div>
             
              <div className="text-sm  space-y-0.5 flex flex-row gap-1">
                <p className="text-black">
                  Email: {hospitalInfo?.email || "gayamshospital@gmail.com"}
                </p>
                 <p className="text-black ">
                  Contact: {hospitalInfo?.phone || "7646086230, 7646086231"}
                </p>
                <p className="text-black">
                  WEB://www.rajeshwarmaternity.hospital.in/
                </p>
               
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex justify-between mt-3 text-sm">
              <div className="border-l-2 border-white/30 pl-4">
                <p className="font-bold text-red-600">
                  DR. ANUPAM KR CHAURASIA
                </p>
                <p className="text-black">
                  MBBS, MS(OB/GY) MGIMS SEVAGRAM, WARDHA.
                </p>
                <p className="text-black">FMAS, DMAS, WLH DELHI.</p>
              </div>
              <div className="text-right border-r-2 border-white/30 pr-4">
                <p className="font-bold text-red-600">DR. KUMARI ARTI</p>
                <p className="text-black">BHMS, NIH, WBUHS KOLKATA.</p>
                <p className="text-black">Dir: Rajeshwar M. S. Hospital</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Line */}
      <div className="text-center text-sm bg-[#6B3E9B]/5  border-b-2 border-[#6B3E9B]">
        <p className="text-[#6B3E9B]/90">
          मकान संख्या 276 नजदीकी डॉ अभय सिन्हा एंड जानकी डेंटल क्लिनिक आशा
          सिन्हा मोड़ ए पी कॉलोनी गया 823001
        </p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-3 px-4">
        {/* Certificate Number */}
        <div className="text-right">
          <p className="text-base font-bold underline">
            NO:{format(new Date(), "yyyy")}-{format(new Date(), "MM")}/
            {certificateNumber}
          </p>
        </div>

        {/* Certificate Text */}
        <div className="space-y-3">
          <h2 className="text-center text-xl font-bold underline">
            BIRTH CERTIFICATE
          </h2>

          <p className="text-sm leading-relaxed">
            THIS IS CERTIFIED THAT{" "}
            <span className="font-bold uppercase">
              {motherData?.name}{" "}
              <span className="relative">
                <span className="print:hidden">
                  <Input
                    ref={relationInputRef}
                    type="text"
                    value={relationText}
                    onChange={(e) =>
                      handleInputChange(e, setRelationText, relationInputRef)
                    }
                    className="w-12 p-0 h-6 inline-block align-baseline"
                  />
                </span>
                <span className="hidden print:inline font-bold">
                  {relationText}
                </span>
              </span>{" "}
              <span className="relative">
                <span className="print:hidden">
                  <Input
                    ref={guardianInputRef}
                    type="text"
                    value={guardianName}
                    onChange={(e) =>
                      handleInputChange(e, setGuardianName, guardianInputRef)
                    }
                    placeholder="Guardian's Name"
                    className="w-40 p-0 h-6 inline-block align-baseline"
                  />
                </span>
                <span className="hidden print:inline font-bold">
                  {guardianName}
                </span>
              </span>
            </span>{" "}
            WAS ADMITTED IN THIS HOSPITAL ON{" "}
            <span className="font-bold">
              {format(new Date(babyData.admissionDate), "dd-MMM-yyyy")} AT{" "}
              {babyData.timeOfAdmission}
            </span>{" "}
            AND DELIVERED A LIVE {babyData.gender.toUpperCase()} CHILD ON{" "}
            <span className="font-bold">
              {format(new Date(babyData.dateOfBirth), "dd-MMM-yyyy")} AT{" "}
              {babyData.timeOfBirth}
            </span>
          </p>

          <p className="text-sm leading-relaxed">
            WEIGHT OF THE CHILD AT THE TIME OF BIRTH {babyData.weight} GM AND
            THIS BABY HANDED OVER TO{" "}
            <span className="relative">
              <span className="print:hidden">
                <Input
                  ref={relationToChildInputRef}
                  type="text"
                  value={relationToChild}
                  onChange={(e) =>
                    handleInputChange(
                      e,
                      setRelationToChild,
                      relationToChildInputRef
                    )
                  }
                  className="w-20 p-0 h-6 inline-block align-baseline font-bold uppercase"
                />
              </span>
              <span className="hidden print:inline font-bold">
                {relationToChild}
              </span>
            </span>{" "}
            <span className="font-bold uppercase">
              <span className="relative">
                <span className="print:hidden">
                  <Input
                    ref={fatherNameInputRef}
                    type="text"
                    value={fatherName}
                    onChange={(e) =>
                      handleInputChange(e, setFatherName, fatherNameInputRef)
                    }
                    placeholder="Name"
                    className="w-40 p-0 h-6 inline-block align-baseline"
                  />
                </span>
                <span className="hidden print:inline font-bold">
                  {fatherName}
                </span>
              </span>
            </span>{" "}
            AFTER EXAMINATION BY PAEDIATRICIAN
          </p>
        </div>

        {/* Signature Section */}
        <div className="mt-8 text-right">
          <p className="font-bold underline">SIGNATURE</p>
        </div>
      </div>
    </div>
  ));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[210mm] min-h-[148.5mm] p-0">
        <style>
          {`
            @media print {
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print-content {
                width: 210mm;
                height: 148.5mm;
                padding: 10mm;
                margin: 0;
                background-color: white;
                page-break-after: always;
              }
              .print-input {
                display: none !important;
              }
              .print-value {
                position: relative;
              }
              .print-value::after {
                content: attr(data-value);
                font-weight: bold;
                text-transform: uppercase;
              }
            }
          `}
        </style>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.querySelectorAll('.print-value').forEach(el => {
              const input = el.querySelector('input');
              if (input) {
                el.setAttribute('data-value', input.value);
              }
            });
          `,
          }}
        />

        <PrintableContent ref={componentRef} />

        {/* Print Button */}
        <div className="flex justify-end p-4 print:hidden">
          <Button
            onClick={() => {
              handlePrint();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Certificate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
