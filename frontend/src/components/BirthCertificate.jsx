import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "../hooks/use-toast";
import BirthCertificatePrint from "./BirthCertificatePrint";
import { useDispatch, useSelector } from "react-redux";
import {editBaby} from '../redux/slices/babySlice';
// import { birthCertificateTemplateString } from "../templatesExperiments/BirthCertificateExperiment";
import { headerTemplateString as headerTemplate } from '../templates/headertemplate'

export default function BirthCertificate({
  open,
  onOpenChange,
  hospitalInfo,
  motherData,
  babyData,
  certificateNumber,
}) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const {editBabyStatus} = useSelector(state=>state.babies);
  const birthCertificateTemplate = useSelector(state=> state.templates.birthCertificateTemplate);
  const {headerTemplateArray, headerTemplate} = useSelector(state=> state.templates);

  const headerTemplateString =
  headerTemplateArray?.length > 0
    ? headerTemplateArray[0].value
    : headerTemplate;

  const headerDefault = `(hospitalInfo) => {
      return ${headerTemplateString}
  }`

  const [basicFormData, setbasicFormData] = useState({
    babyFatherName : babyData?.babyFatherName || "",
    guardianRelationWithPatient : "W/O",
    babyHandOverName: babyData?.babyHandOverName || "",
    babyHandOverRelation : babyData?.babyHandOverRelation || ""
  });

  useEffect(() => {
    setbasicFormData({
      babyFatherName: babyData?.babyFatherName || "",
      guardianRelationWithPatient: "W/O",
      babyHandOverName: babyData?.babyHandOverName || "",
      babyHandOverRelation: babyData?.babyHandOverRelation || ""
    });
  }, [babyData]);

  const handleSaveCertificate = () => {
    if(basicFormData.babyFatherName === "") {
      toast({
        title: "Error",
        description: "Please Enter Husband Name",
        variant: "destructive",
      });
      return;
    }
    dispatch(editBaby({...babyData, ...basicFormData}))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          variant : 'success',
          description: "Birth certificate details saved successfully",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to save birth certificate details",
          variant: "destructive",
        });
      });
  }

  const BirthCertificateTempleteHeader = new Function("React", `return ${ birthCertificateTemplate || headerDefault}`)(React);
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[250mm] ">
      <div className="border-[1px] border-black mt-4">
        {/* Birth Certificate Header */}

        {BirthCertificateTempleteHeader(hospitalInfo)}
        
      {/* Certificate Content */}
      <div className="space-y-3 px-4">
        {/* Certificate Number */}
        <div className="text-right">
          <p className="text-base font-bold underline">
           BIRTH NO:
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
                  value={basicFormData.babyFatherName}
                  placeholder="Enter Husband Name"
                  autoFocus
                  onChange={(e) =>
                    setbasicFormData({
                      ...basicFormData,
                      babyFatherName: e.target.value,
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
                value={basicFormData.babyHandOverRelation}
                onChange={(e) =>
                  setbasicFormData({
                    ...basicFormData,
                    babyHandOverRelation: e.target.value,
                  })
                }
              />{" "}
              <Input
                className="w-50 px-1 py-0 h-6 inline-block font-bold uppercase text-center"
                value={basicFormData.babyHandOverName}
                onChange={(e) =>
                  setbasicFormData({
                    ...basicFormData,
                    babyHandOverName: e.target.value,
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
        <div className="flex gap-2 justify-end py-2">

          <Button variant='outline' onClick={()=> onOpenChange(false)}>Cancel</Button>
          
          <BirthCertificatePrint 
            hospitalInfo={hospitalInfo}
            motherData={motherData}
            babyData={babyData}
            certificateNumber={certificateNumber}
            basicFormData={basicFormData}
            birthCertificateTempleteHeader={BirthCertificateTempleteHeader}
          />
          <Button 
            variant='outline' 
            onClick={handleSaveCertificate} 
            disabled={editBabyStatus === 'loading'}
             className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {editBabyStatus === 'loading' ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
