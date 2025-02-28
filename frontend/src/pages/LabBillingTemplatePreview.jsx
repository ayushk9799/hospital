import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../components/ui/button";
import { updateTemplate } from "../redux/slices/templatesSlice";
import {labBillingTemplateStringExperiment} from "../templatesExperiments/labbillingexperiment"
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import BillingTemplate from "../../src/pages/BillingTemplate";
import { labBillingTemplateStringDefault } from "../templates/labBillingTemplate";

export default function LabBillingTemplatePreview() {
  const hospital = useSelector((state) => state.hospital.hospitalInfo);

  const dispatch = useDispatch();

  // Sample data for preview
  const sampleLabData = {
    patientName: "John Doe",
    age: "35",
    gender: "Male",
    registrationNumber: "LAB123",
    contactNumber: "9876543210",
    address: "123 Main St",
    bookingDate: new Date().toISOString(),
    labNumber: "L001",
    referredBy: { name: "Dr. Smith" },
    paymentInfo: {
      totalAmount: 1500,
      additionalDiscount: 100,
      amountPaid: 1000,
      balanceDue: 400,
      paymentMethod: [
        { amount: 1000, method: "Cash", date: new Date().toISOString() },
      ],
    },
    labTests: [
      { name: "Complete Blood Count", price: 500, reportStatus: "Completed" },
      { name: "Blood Sugar", price: 300, reportStatus: "Pending" },
      { name: "Lipid Profile", price: 700, reportStatus: "In Progress" }
      
    ],
  };

  // const handleSaveTemplate = () => {
  //   dispatch(
  //     updateTemplate({
  //       labBillingTemplate: labBillingTemplateStringExperiment,
  //     })
  //   );
  // };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            Lab Billing Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>
      </div>

      <div className="flex justify-center bg-gray-100 p-2 min-h-[calc(100vh-200px)] overflow-auto">
        <div className="bg-white shadow-lg relative  ">
          <BillingTemplate hospital={hospital} labData={sampleLabData} />
        </div>
      </div>
    </div>
  );
}
