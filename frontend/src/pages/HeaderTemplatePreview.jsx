import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
// import { headerTemplateString4 } from "../templatesExperiments/HospitalHeaderTemplate";
import { headerTemplateString } from "../templates/headertemplate";
import {headerTemplateString2} from "../templatesExperiments/HospitalHeaderTemplate"
import { headerTemplateString3 as headerTemplateStringExperimental, headerTemplateString as headerTemplateStringGolpathar } from "../templatesExperiments/HospitalHeaderTemplate";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export default function HeaderTemplatePreview() {
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const dispatch = useDispatch();
  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplateArray
  );

  // Define available templates
  const [availableTemplates, setAvailableTemplates] = useState([
    { name: "experimental", value: headerTemplateStringExperimental },
    { name: "System Default", value: headerTemplateString },
    {
      name:"image",
      value:headerTemplateString2
    },
    ...(headerTemplates || []),
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(
    availableTemplates[0] || { name: "", value: "" }
  );

  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const handleNameEdit = (template, newName) => {
    // Find the template index
    const templateIndex = availableTemplates.findIndex((t) => t === template);
    if (templateIndex === -1) return;

    // Create new array with updated template
    const updatedTemplates = availableTemplates.map((t, index) =>
      index === templateIndex ? { ...t, name: newName } : t
    );

    // Update state with the new array
    setAvailableTemplates(updatedTemplates);

    // Update selected template if it's the one being edited
    if (selectedTemplate === template) {
      setSelectedTemplate(updatedTemplates[templateIndex]);
    }
  };

  const HospitalHeader = createDynamicComponentFromString(
    selectedTemplate?.value || ""
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            Hospital Header Preview
          </h1>
          <Button
            onClick={() => {
              if (selectedTemplate) {
                dispatch(
                  updateTemplate({
                    headerTemplate: {
                      name: selectedTemplate.name,
                      value: selectedTemplate.value,
                    },
                  })
                );
              }
            }}
          >
            Save Template
          </Button>
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
                  onClick={() => setSelectedTemplate(template)}
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
            padding: "8mm",
            margin: "0 auto",
          }}
        >
          <HospitalHeader hospitalInfo={hospitalInfo} />
        </div>
      </div>
    </div>
  );
}
