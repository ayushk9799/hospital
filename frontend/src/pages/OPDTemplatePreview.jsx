import React, { useRef } from "react";
import { Button } from "../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import OPDPrescriptionTemplate, {
  opdPrescriptionTemplateStringDefault,
  
} from "../templates/opdPrescription";
import { opdPrescriptionTemplateString } from "../templatesExperiments/opdPrescription";
export default function OPDTemplatePreview() {
  const dispatch = useDispatch();
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const patient = {};
  const vitals = {};
  const prescription = {};
  const labTests = [];
  const selectedComorbidities = [];

  // const handleSaveTemplate = () => {
  //   dispatch(updateTemplate({ opdPrescriptionTemplate: opdPrescriptionTemplateStringDefault }));
  // };
  const ref=useRef(null);
  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          OPD Prescription Template Preview
        </h1>
        {/* <Button onClick={handleSaveTemplate} >Save Template</Button> */}
      </div>

      <div className="flex justify-center bg-gray-100 p-4 min-h-[calc(100vh-200px)] overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            padding: "6mm 5mm",
            margin: "0 auto",
          }}
        >
          <OPDPrescriptionTemplate
         
            previewMode={true}
            hospital={hospitalInfo}
            patient={patient}
            vitals={vitals}
            prescription={prescription}
            labTests={labTests}
            selectedComorbidities={selectedComorbidities}
          />
        </div>
      </div>
    </div>
  );
}
