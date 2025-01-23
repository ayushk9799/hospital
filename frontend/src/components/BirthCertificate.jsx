import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "../hooks/use-toast";
import BirthCertificatePrint from "./BirthCertificatePrint";

export default function BirthCertificate({
  open,
  onOpenChange,
  hospitalInfo,
  motherData,
  babyData,
  certificateNumber,
}) {
  const { toast } = useToast();
  const [basicFormData, setbasicFormData] = useState({
    guardianName : motherData?.guardianName || "",
    guardianRelationWithPatient : "W/O",
    handOverName: "",
    relationToChild : "FATHER"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[250mm] ">
      <div className="border-[1px] border-black mt-4">
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
              <div className="text-3xl font-bold mb-1 bg-purple-600 p-2 text-white flex justify-center items-center" style={{ fontFamily: "Arial" }}>
                राजेश्‍वर मैटरनिटी एंड सर्जिकल हॉस्पिटल
              </div>
              <div className="flex justify-between px-2 text-sm">
                  <p className="text-black ">
                    EMAIL ID: <span className="underline"> {hospitalInfo?.email || "gayamshospital@gmail.com"} </span>
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
                  <p className="text-black text-sm">BHMS, NIH, WBUHS KOLKATA.</p>
                  <p className="text-black text-sm">Dir: Rajeshwar M. S. Hospital</p>
                </div>
              </div>
            </div>
        </div>

        {/* Address Line */}
        <div className="text-center  border-b-[1px] border-black">
          <p className="text-[#6B3E9B]">
          मकान संख्या 276 नजदीकी डॉ अभय सिम्बा एंड जानकी डेंटल क्लिनिक आशा सिन्हा मोड़ ए पी कॉलोनी गया 823001
          </p>
        </div>

        {/* Certificate Content */}
        <div className="font-cursive px-4">
          <h2 className="text-center text-2xl mt-2 font-bold underline italic tracking-wider" style={{ fontFamily: "cursive" }}>
            BIRTH CERTIFICATE
          </h2>

              {/* Certificate Number */}
              <div className="text-right text-xl">
            <p className="text-base font-bold underline">
              NO:{format(new Date(), "yyyy")}-{format(new Date(), "MM")}/
              {certificateNumber}
            </p>
          </div>

          {/* Certificate Text */}
          <div className="mt-2">
            <p className="leading-relaxed text-base text-justify">
              THIS IS CERTIFIED THAT{" "}
              <span className="font-bold uppercase">
                {motherData?.name}{" "}
                <Input
                  className="w-[45px] px-1 py-0 h-6 inline-block font-bold uppercase text-center"
                  value={basicFormData.guardianRelationWithPatient}
                  onChange={(e) =>
                    setbasicFormData({
                      ...basicFormData,
                      guardianRelationWithPatient: e.target.value,
                    })
                  }
                />{" "}
                <Input
                  className="w-50 px-1 py-0 h-6 inline-block font-bold uppercase text-center"
                  value={basicFormData.guardianName}
                  onChange={(e) =>
                    setbasicFormData({
                      ...basicFormData,
                      guardianName: e.target.value,
                    })
                  }
                />
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
              . WEIGHT OF THE CHILD AT THE TIME OF BIRTH {babyData.weight} GM AND
              THIS BABY HANDED OVER TO{" "}
              <Input
                className="w-24 px-1 py-0 h-6 inline-block font-bold uppercase text-center"
                value={basicFormData.relationToChild}
                onChange={(e) =>
                  setbasicFormData({
                    ...basicFormData,
                    relationToChild: e.target.value,
                  })
                }
              />{" "}
              <Input
                className="w-50 px-1 py-0 h-6 inline-block font-bold uppercase text-center"
                value={basicFormData.handOverName}
                onChange={(e) =>
                  setbasicFormData({
                    ...basicFormData,
                    handOverName: e.target.value,
                  })
                }
              />{" "}
              AFTER EXAMINATION BY PAEDIATRICIAN.
            </p>
          </div>

      

          {/* Signature Section */}
          <div className="mt-8 mb-4 mr-12 text-right">
            <p className="font-bold underline">SIGNATURE</p>
          </div>
        </div>
      </div>

        {/* Print Button */}
        <div className="flex justify-end p-4">
          <BirthCertificatePrint 
            hospitalInfo={hospitalInfo}
            motherData={motherData}
            babyData={babyData}
            certificateNumber={certificateNumber}
            basicFormData={basicFormData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
