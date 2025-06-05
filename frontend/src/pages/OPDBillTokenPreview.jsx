import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
// import { opdBillTokenTemplateSingle , opdBillTokenTemplateaad} from "../templatesExperiments/opdBilltokenExperiment";
import { opdBillTokenTemplateDefault } from "../templates/opdBillTokenTemplate";
import OPDBillTokenPrint from "../components/custom/registration/OPDBillTokenPrint";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
export default function OPDBillTokenPreview() {
  const hospital = useSelector((state) => state.hospital.hospitalInfo);

  const dispatch = useDispatch();
  const { toast } = useToast();

  // Sample data for preview
  const samplePatientData = {
    patient: {
      name: "John Doe",
      age: "35",
      gender: "Male",
      registrationNumber: "REG123456",
      contactNumber: "9876543210",
      address: "123 Main Street, City",
    },
    bill: {
      invoiceNumber: "INV-001",
      createdAt: new Date().toISOString(),
      services: [
        { name: "Consultation", quantity: 1, rate: 500 },
        { name: "Blood Test", quantity: 1, rate: 800 },
        { name: "X-Ray", quantity: 1, rate: 1200 },
      ],
      subtotal: 2500,
      additionalDiscount: 200,
      totalAmount: 2300,
      amountPaid: 2300,
    },
    payment: [{ paymentMethod: "Cash" }],
    admissionRecord: {
      bookingNumber: "BK001",
      vitals: {
        bloodPressure: "120/80",
        weight: "75",
        heartRate: "72",
        temperature: "98.6",
        oxygenSaturation: "98",
        respiratoryRate: "16",
      },
    },
  };

  // const handleSaveTemplate = () => {
  //   dispatch(
  //     updateTemplate({
  //       opdBillTokenTemplate: medbharat,
  //     })
  //   ).then((result) => {
  //     if (!result.error) {
  //       toast({
  //         variant: "success",
  //         title: "Template saved successfully",
  //         description: "Template saved successfully",
  //       });
  //     } else {
  //       toast({
  //         variant: "destructive",
  //         title: "Failed to save template",
  //         description: "Failed to save template",
  //       });
  //     }
  //   });
  // };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            OPD Bill Token Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>
      </div>

      <div className="flex justify-center bg-gray-100 p-2 min-h-[calc(100vh-200px)] overflow-auto">
        <div className="bg-white shadow-lg relative py-2 w-[210mm] h-[297mm]">
          <OPDBillTokenPrint
            hospital={hospital}
            patientData={samplePatientData}
          />
        </div>
      </div>
    </div>
  );
}
