import React, { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import OPDPrescriptionTemplate, {
  opdPrescriptionTemplateStringDefault,
} from "../templates/opdPrescription";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { opdPrescriptionTemplateString } from "../templatesExperiments/opdPrescription";

export default function OPDTemplatePreview() {
  const dispatch = useDispatch();
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const opdTemplates = useSelector(
    (state) => state.templates.opdPrescriptionTemplateArray
  );
  const patient = {};
  const vitals = {};
  const prescription = {};
  const labTests = [];
  const selectedComorbidities = [];
  const ref = useRef(null);

  // Define available templates
  const [availableTemplates, setAvailableTemplates] = useState([
    { name: "System Default", value: opdPrescriptionTemplateStringDefault },
    { name: "Experimental", value: opdPrescriptionTemplateString },
    ...(opdTemplates || []),
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(
    availableTemplates[0] || { name: "", value: "" }
  );

  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const handleNameEdit = (template, newName) => {
    const templateIndex = availableTemplates.findIndex((t) => t === template);
    if (templateIndex === -1) return;

    const updatedTemplates = availableTemplates.map((t, index) =>
      index === templateIndex ? { ...t, name: newName } : t
    );

    setAvailableTemplates(updatedTemplates);

    if (selectedTemplate === template) {
      setSelectedTemplate(updatedTemplates[templateIndex]);
    }
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      dispatch(
        updateTemplate({
          opdPrescriptionTemplateArray: availableTemplates.filter(
            (template) => template !== availableTemplates[0]
          ),
        })
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            OPD Prescription Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>

        <div className="flex flex-wrap gap-3">
          {availableTemplates.map((template, index) => (
            <div key={index} className="relative">
              {editingTemplateId === index ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={template.name}
                    onChange={(e) => handleNameEdit(template, e.target.value)}
                    onBlur={() => setEditingTemplateId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setEditingTemplateId(null);
                      }
                    }}
                    className="w-[150px]"
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  className={cn(
                    "relative min-w-[150px]",
                    selectedTemplate === template &&
                      "border-2 border-primary bg-primary/10"
                  )}
                  onClick={() => {
                    setSelectedTemplate(template);
                  }}
                  onDoubleClick={() => setEditingTemplateId(index)}
                >
                  {template.name || "Unnamed Template"}
                </Button>
              )}
            </div>
          ))}
        </div>
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
            templateString={selectedTemplate?.value}
          />
        </div>
      </div>
    </div>
  );
}
