import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import HospitalHeader from "../utils/print/HospitalHeader";
import { headerTemplateString } from "../templates/headertemplate";

export default function Settings() {
  const navigate = useNavigate();

  const handleAddStaff = () => {
    navigate("/addstaff");
  };

  const handleCreateRoom = () => {
    navigate("/create-room");
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

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button onClick={handleAddStaff} className="w-full sm:w-auto">
          Add Staff
        </Button>
        <Button onClick={handleCreateRoom} className="w-full sm:w-auto">
          Create Room
        </Button>
        <Button onClick={handleHospitalInfo} className="w-full sm:w-auto">
          Hospital Info
        </Button>
        <Button onClick={handleCustomization} className="w-full sm:w-auto">
          Customization
        </Button>
        <Button onClick={handleLabTemplates} className="w-full sm:w-auto">
          Manage Lab Templates
        </Button>
        <Button onClick={handlePrintingTemplates} className="w-full sm:w-auto">
          Printing Templates
        </Button>
        <Button onClick={handlePrefixSettings} className="w-full sm:w-auto">
          Prefix Settings
        </Button>
        <Button onClick={handleDepartmentSettings} className="w-full sm:w-auto">
          Manage Department
        </Button>
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
