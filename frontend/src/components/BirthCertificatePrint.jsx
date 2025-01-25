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
  basicFormData
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
        variant="ghost"
        className="bg-purple-600 hover:bg-purple-700 text-white"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Certificate
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content mt-10">
          <div className="border-[1px] border-black mb-20">
            {/* Hospital Header */}
            <div className="grid grid-cols-6 border-b-[1px] border-black">
              {/* Logo */}
              <div className="border-r-[1px] border-black">
                <img
                  src={hospitalInfo?.logo}
                  alt="Hospital Logo"
                  className="h-full w-full object-fit bg-white rounded-full p-1 border-2 border-white/50"
                />
              </div>

              {/* Hospital Info */}
              <div className="col-span-5">
                <div
                  className="text-3xl font-bold mb-1 bg-purple-600 p-2 text-white flex justify-center items-center"
                  style={{ fontFamily: "Arial" }}
                >
                  राजेश्‍वर मैटरनिटी एंड सर्जिकल हॉस्पिटल
                </div>
                <div className="flex justify-between px-2 text-sm">
                  <p className="text-black ">
                    EMAIL ID:{" "}
                    <span className="underline">
                      {" "}
                      {hospitalInfo?.email || "gayamshospital@gmail.com"}{" "}
                    </span>
                  </p>
                  <p className="text-black ">
                    Contact No:{hospitalInfo?.phone || "7646086230, 7646086231"}
                  </p>
                </div>

                {/* Doctor Info */}
                <div className="flex justify-between px-2 pb-2">
                  <div className="border-l-2 border-white/30">
                    <p className="font-bold text-red-600 text-md">
                      DR. ANUPAM KR CHAURASIA
                    </p>
                    <p className="text-black text-sm">
                      MBBS, MS(OB/GY) MGIMS SEVAGRAM, WARDHA.
                    </p>
                    <p className="text-black text-sm">FMAS, DMAS, WLH DELHI.</p>
                  </div>
                  <div className="text-right border-r-2 border-white/30">
                    <p className="font-bold text-red-600">DR. KUMARI ARTI</p>
                    <p className="text-black text-sm">
                      BHMS, NIH, WBUHS KOLKATA.
                    </p>
                    <p className="text-black text-sm">
                      Dir: Rajeshwar M. S. Hospital
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Line */}
            <div className="text-center  border-b-[1px] border-black">
              <p className="text-[#6B3E9B]">
                मकान संख्या 276 नजदीकी डॉ अभय सिम्बा एंड जानकी डेंटल क्लिनिक आशा
                सिन्हा मोड़ ए पी कॉलोनी गया 823001
              </p>
            </div>

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
                    <span className="font-bold">{basicFormData?.guardianName}</span>
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
                  <span className="uppercase">{basicFormData?.relationToChild}</span>{" "}
                  <span className="uppercase">{basicFormData?.handOverName}</span>{" "}
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
            <div className="grid grid-cols-6 border-b-[1px] border-black">
              {/* Logo */}
              <div className="border-r-[1px] border-black">
                <img
                  src={hospitalInfo?.logo}
                  alt="Hospital Logo"
                  className="h-full w-full object-fit bg-white rounded-full p-1 border-2 border-white/50"
                />
              </div>

              {/* Hospital Info */}
              <div className="col-span-5">
                <div
                  className="text-3xl font-bold mb-1 bg-purple-600 p-2 text-white flex justify-center items-center"
                  style={{ fontFamily: "Arial" }}
                >
                  राजेश्‍वर मैटरनिटी एंड सर्जिकल हॉस्पिटल
                </div>
                <div className="flex justify-between px-2 text-sm">
                  <p className="text-black ">
                    EMAIL ID:{" "}
                    <span className="underline">
                      {" "}
                      {hospitalInfo?.email || "gayamshospital@gmail.com"}{" "}
                    </span>
                  </p>
                  <p className="text-black ">
                    Contact No:{hospitalInfo?.phone || "7646086230, 7646086231"}
                  </p>
                </div>

                {/* Doctor Info */}
                <div className="flex justify-between px-2 pb-2">
                  <div className="border-l-2 border-white/30">
                    <p className="font-bold text-red-600 text-md">
                      DR. ANUPAM KR CHAURASIA
                    </p>
                    <p className="text-black text-sm">
                      MBBS, MS(OB/GY) MGIMS SEVAGRAM, WARDHA.
                    </p>
                    <p className="text-black text-sm">FMAS, DMAS, WLH DELHI.</p>
                  </div>
                  <div className="text-right border-r-2 border-white/30">
                    <p className="font-bold text-red-600">DR. KUMARI ARTI</p>
                    <p className="text-black text-sm">
                      BHMS, NIH, WBUHS KOLKATA.
                    </p>
                    <p className="text-black text-sm">
                      Dir: Rajeshwar M. S. Hospital
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Line */}
            <div className="text-center  border-b-[1px] border-black">
              <p className="text-[#6B3E9B]">
                मकान संख्या 276 नजदीकी डॉ अभय सिम्बा एंड जानकी डेंटल क्लिनिक आशा
                सिन्हा मोड़ ए पी कॉलोनी गया 823001
              </p>
            </div>

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
                    <span className="font-bold">{basicFormData?.guardianName}</span>
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
                  <span className="">{basicFormData?.relationToChild}</span>{" "}
                  <span className="uppercase">{basicFormData?.handOverName}</span>{" "}
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
