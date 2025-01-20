import React from "react";
import { Button } from "../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import OPDRxTemplate, { opdRxTemplateStringDefault } from "../templates/opdRx";
import { opdRxTemplateStringExperimental } from "../templatesExperiments/opdRxExperimental";

export default function OPDRxTemplatePreview() {
  const dispatch = useDispatch();
  const { hospitalInfo } = useSelector((state) => state.hospital);

  // Sample data for preview with proper date fields
  const patient = {
    patient: {
    name: "Sample Patient",
    age: "45",
    gender: "Male",
    address: "123 Sample Street",
    },
    registrationNumber: "REG123",
    contactNumber: "9876543210",
    guardian: "Sample Guardian",
    createdAt: new Date().toISOString(),
    bookingDate: new Date().toISOString(),
    doctor: {
      name: "Dr. Sample Doctor",
      _id: "sample_doctor_id",
    },
    department: "General Medicine",
    vitals: {
      bloodPressure: "120/80",
      weight: "70",
    },
  };

  const handleSaveTemplate = () => {
    dispatch(
      updateTemplate({ opdRxTemplate: opdRxTemplateStringDefault })
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          OPD Rx Template Preview
        </h1>
        {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
      </div>

      <div className="flex justify-center bg-gray-100 p-4 min-h-[calc(100vh-200px)] overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <OPDRxTemplate hospital={hospitalInfo} patient={patient} />
        </div>
      </div>
    </div>
  );
}
