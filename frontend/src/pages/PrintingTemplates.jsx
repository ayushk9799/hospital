import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function PrintingTemplates() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Printing Templates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Button
          onClick={() =>
            navigate("/settings/printing-templates/discharge-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2"
        >
          <span className="text-lg">Discharge Template</span>
          <span className="text-sm text-gray-200">
            Preview and customize discharge summary template
          </span>
        </Button>

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/header-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2"
        >
          <span className="text-lg">Hospital Header</span>
          <span className="text-sm text-gray-200">
            Preview and customize hospital header template
          </span>
        </Button>

        <Button
          onClick={() => navigate("/settings/printing-templates/opd-preview")}
          className="w-full p-6 h-auto flex flex-col items-center gap-2"
        >
          <span className="text-lg">OPD Prescription</span>
          <span className="text-sm text-gray-200">
            Preview and customize OPD prescription template
          </span>
        </Button>

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/opd-rx-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2"
        >
          <span className="text-lg">OPD Rx Template</span>
          <span className="text-sm text-gray-200">
            Preview and customize OPD Rx template
          </span>
        </Button>

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/lab-report-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <span className="text-lg">Lab Report Template</span>
          <span className="text-sm text-gray-200">
            Preview and customize laboratory report template
          </span>
        </Button>
      </div>
    </div>
  );
}
