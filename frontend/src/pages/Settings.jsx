import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";

import { ArrowLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHospitalInfo = () => {
    navigate("/settings/hospital-info");
  };

  const handleCustomization = () => {
    navigate("/settings/customization");
  };

  const handleLabTemplates = () => {
    navigate("/settings/lab-templates");
  };

  const handlePrintingTemplates = () => {
    navigate("/settings/printing-templates");
  };

  const handleMergeTemplateReport = () => {
    navigate("/settings/merge-template-report");
  };

  const handlePrefixSettings = () => {
    navigate("/settings/prefix-settings");
  };

  const handleDepartmentSettings = () => {
    navigate("/settings/department");
  };

  const handleHospitalSettings = () => {
    navigate("/settings/hospital-settings");
  };

  const handleConsultationFees = () => {
    navigate("/settings/consultation-fees");
  };

  const handleDischargeFormTemplates = () => {
    navigate("/settings/discharge-form-templates");
  };

  const handleSubscription = () => {
    navigate("/settings/subscription");
  };

  const handleDoctorPrescriptionSettings = () => {
    navigate("/settings/prescription-settings");
  };

  const handleDoctorWiseData = () => {
    navigate("/settings/doctor-wise-data");
  };

  const handleManageRecords = () => {
    navigate("/settings/manage-records");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Button onClick={handleHospitalInfo}>Hospital Info</Button>
        <Button onClick={handleCustomization}>Customization</Button>
        <Button onClick={handleLabTemplates}>Manage Lab Templates</Button>
        <Button onClick={handlePrintingTemplates}>Printing Templates</Button>
        <Button onClick={handlePrefixSettings}>Prefix Settings</Button>
        <Button onClick={handleDepartmentSettings}>Manage Department</Button>
        <Button onClick={handleHospitalSettings}>Hospital Settings</Button>
        <Button onClick={handleConsultationFees}>Consultation Fees</Button>
        <Button onClick={handleDischargeFormTemplates}>
          Discharge Form Templates
        </Button>
        <Button onClick={handleSubscription}>Subscription</Button>
        <Button onClick={handleDoctorPrescriptionSettings}>
          Doctors Prescription Settings
        </Button>
        <Button onClick={handleDoctorWiseData}>Doctor Wise Data</Button>
        <Button onClick={handleManageRecords}>Manage Records</Button>
        {/* <Button onClick={handleLabData}>
          Lab Data
        </Button> */}
      </div>

      {/* <div className="mb-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">Header Template Settings</h2>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Current Header Preview</h3>
          <div className="border p-4 rounded-lg">
            {HeaderComponent ? (
              <HeaderComponent hospitalInfo={hospitalInfo} />
            ) : (
              <div>No preview available</div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSaveHeaderTemplate}
            className="bg-primary text-white"
          >
            Save As Default Header Template
          </Button>
        </div>
      </div> */}
    </div>
  );
}
