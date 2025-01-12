import React from "react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
// import { updateTemplate } from "../redux/slices/templatesSlice";
// import { dischargeSummaryTemplateString } from "../components/custom/reports/DischargeSummaryPDF";
import DischargeSummaryPDF from "../components/custom/reports/DischargeSummaryPDF";

export default function DischargeTemplatePreview() {
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const patient = {};
  const formData = {};
  const dispatch = useDispatch();
//needs to be enabled whn editing the template and when the dichargesummarytemplateString is use dfomr the gitignored thing
//   const handleSaveTemplate = () => {
//     dispatch(updateTemplate({ dischargeSummaryTemplate: dischargeSummaryTemplateString }));
//   };


  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Discharge Template Preview
        </h1>
        {/* <Button  disabled>Save Template</Button> */}
      </div>

      <div className="flex justify-center bg-gray-100 p-4 min-h-[calc(100vh-200px)] overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            padding: "8mm",
            margin: "0 auto",
          }}
        >
          <DischargeSummaryPDF
            hospital={hospital}
            patient={patient}
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
}
