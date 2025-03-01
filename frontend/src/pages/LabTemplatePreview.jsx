import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
 import { labReportTemplateStringDefault } from "../templates/labReportTemplate";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { labReportTemplateStringExperiment, labReportTemplateStringExperiment2, mergedLabReportTemplateStringExperiment } from "../templatesExperiments/labtemplateExperiment";
import LabReportPDF from "../components/custom/reports/LabReportPDF";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export default function LabTemplatePreview() {
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
 
  const dispatch = useDispatch();

  // Sample data for preview
  const samplePatientData = {
    patientName: "ANJU KUMARI",
    age: "21",
    gender: "FEMALE",
    registrationNumber: "850125",
    contactNumber: "9876543210",
  };

  const sampleReportData = {
    completeType: "HAEMATOLOGY",
    date: new Date().toISOString(),
    report: {
      "WHITE CELL COUNT(TC)": {
        value: "11600",
        unit: "million/cumm",
        normalRange: "",
      },
      "RBC (RED BLOOD CELLS)": {
        value: "4.22",
        unit: "million/cumm",
        normalRange: "3.7-5.0",
      },
      "HB (HAEMOGLOBIN)": {
        value: "8.9",
        unit: "gm/dl",
        normalRange: "11.5-15.00",
      },
      "PLATELET COUNT": {
        value: "2.80",
        unit: "lakh/cumm",
        normalRange: "1.5-3.5",
      },
      
      "HCT(PCV)": { value: "26.70", unit: "%", normalRange: "36-45" },
      MCV: { value: "63.27", unit: "fl", normalRange: "80-100" },
      MCH: { value: "21.09", unit: "pg", normalRange: "27-32" },
      MCHC: { value: "33.33", unit: "gm%", normalRange: "32-38" },
    },
  };

  // const handleSaveTemplate = () => {
  //   dispatch(
  //     updateTemplate({
  //       labReportUiTemplate: labReportTemplateStringExperiment2,
  //     })
  //   );
  // };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            Lab Report Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>
      </div>

      <div className="flex justify-center bg-gray-100 p-2 min-h-[calc(100vh-200px)] overflow-auto">
        <div className="bg-white shadow-lg relative p-2">
          <LabReportPDF
            hospital={hospital}
            patientData={samplePatientData}
            reportData={sampleReportData}
          />
        </div>
      </div>
    </div>
  );
}
