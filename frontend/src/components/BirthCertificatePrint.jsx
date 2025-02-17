import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

const BirthCertificatePrint = ({
  hospitalInfo,
  motherData,
  babyData,
  certificateNumber,
  basicFormData,
  birthCertificateTempleteHeader
}) => {
  const componentRef = useRef();

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
          min-height: 100vh;
          padding: 20px;
        }
      }
    `,
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content mt-10">
          <div className="border-[1px] border-black mb-20">
            {/* Hospital Header */}
           
            {birthCertificateTempleteHeader(hospitalInfo)}

            {/* Certificate Content */}
            <div className="font-cursive px-4">
              <h2
                className="text-center text-2xl mt-2 font-bold underline italic tracking-wider"
                style={{ fontFamily: "cursive" }}
              >
                BIRTH CERTIFICATE
              </h2>

              {/* Certificate Number */}
              <div className="text-right text-xl">
                <p className="text-base font-bold underline">
                  BIRTH NO:
                  {certificateNumber}
                </p>
              </div>

              {/* Certificate Text */}
              <div className="mt-2">
                <p className="leading-relaxed text-base text-justify">
                  THIS IS CERTIFIED THAT{" "}
                  <span className="font-bold uppercase underline">
                    {motherData?.name}{" "}
                    <span className="font-bold">{basicFormData?.guardianRelationWithPatient}</span>{" "}
                    <span className="font-bold">{basicFormData?.babyFatherName}</span>
                  </span>{" "}
                  WAS ADMITTED IN THIS HOSPITAL ON{" "}
                  <span className="uppercase">
                    {format(new Date(babyData.admissionDate), "dd-MMM-yyyy")} AT{" "}
                    {babyData.timeOfAdmission}
                  </span>{" "}
                  AND DELIVERED A LIVE {babyData.gender.toUpperCase()} CHILD ON{" "}
                  <span className="uppercase">
                    {format(new Date(babyData.dateOfBirth), "dd-MMM-yyyy")} AT{" "}
                    {babyData.timeOfBirth}
                  </span>
                  . WEIGHT OF THE CHILD AT THE TIME OF BIRTH {babyData.weight} GM
                  AND THIS BABY HANDED OVER TO{" "}
                  <span className="uppercase">{basicFormData?.babyHandOverRelation}</span>{" "}
                  <span className="uppercase">{basicFormData?.babyHandOverName}</span>{" "}
                  AFTER EXAMINATION BY PAEDIATRICIAN.
                </p>
              </div>

              {/* Signature Section */}
              <div className="mt-8 mb-8 mr-12 text-right">
                <p className="font-bold underline">SIGNATURE</p>
              </div>
            </div>
          </div>
          <div className="border-[1px] border-black mb-4">
            {/* Hospital Header */}
            {birthCertificateTempleteHeader(hospitalInfo)}

            {/* Certificate Content */}
            <div className="font-cursive px-4">
              <h2
                className="text-center text-2xl mt-2 font-bold underline italic tracking-wider"
                style={{ fontFamily: "cursive" }}
              >
                BIRTH CERTIFICATE
              </h2>

              {/* Certificate Number */}
              <div className="text-right text-xl">
                <p className="text-base font-bold underline">
                  BIRTH NO: 
                  {certificateNumber}
                </p>
              </div>

              {/* Certificate Text */}
              <div className="mt-2">
                <p className="leading-relaxed text-base text-justify">
                  THIS IS CERTIFIED THAT{" "}
                  <span className="font-bold uppercase underline">
                    {motherData?.name}{" "}
                    <span className="font-bold">{basicFormData?.guardianRelationWithPatient}</span>{" "}
                    <span className="font-bold">{basicFormData?.babyFatherName}</span>
                  </span>{" "}
                  WAS ADMITTED IN THIS HOSPITAL ON{" "}
                  <span className="">
                    {format(new Date(babyData.admissionDate), "dd-MMM-yyyy")} AT{" "}
                    {babyData.timeOfAdmission}
                  </span>{" "}
                  AND DELIVERED A LIVE {babyData.gender.toUpperCase()} CHILD ON{" "}
                  <span className="">
                    {format(new Date(babyData.dateOfBirth), "dd-MMM-yyyy")} AT{" "}
                    {babyData.timeOfBirth}
                  </span>
                  . WEIGHT OF THE CHILD AT THE TIME OF BIRTH {babyData.weight} GM
                  AND THIS BABY HANDED OVER TO{" "}
                  <span className="">{basicFormData?.babyHandOverRelation}</span>{" "}
                  <span className="uppercase">{basicFormData?.babyHandOverName}</span>{" "}
                  AFTER EXAMINATION BY PAEDIATRICIAN.
                </p>
              </div>

              {/* Signature Section */}
              <div className="mt-8 mb-8 mr-12 text-right">
                <p className="font-bold underline">SIGNATURE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BirthCertificatePrint;
