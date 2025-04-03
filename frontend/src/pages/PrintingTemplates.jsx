import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function PrintingTemplates() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Printing Templates</h1>
      </div>
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
            navigate("/settings/printing-templates/opd-bill-token-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2"
        >
          <span className="text-lg">OPD Bill Token</span>
          <span className="text-sm text-gray-200">
            Preview and customize OPD bill token template
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

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/lab-billing-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <span className="text-lg">Lab Billing Template</span>
          <span className="text-sm text-gray-200">
            Preview and customize lab billing template
          </span>
        </Button>

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/merge-template-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <span className="text-lg">Merge Template Report</span>
          <span className="text-sm text-gray-200">
            Preview and customize merge template report
          </span>
        </Button>

        <Button
          onClick={() =>
            navigate("/settings/printing-templates/consent-preview")
          }
          className="w-full p-6 h-auto flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <span className="text-lg">Consent Form Template</span>
          <span className="text-sm text-gray-200">
            Preview and customize consent form template
          </span>
        </Button>
      </div>
    </div>
  );
}
