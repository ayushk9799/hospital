import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { deleteTemplate } from "../redux/slices/templatesSlice";

export default function LabTemplatesManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { labTestsTemplate } = useSelector((state) => state.templates);

  const handleDeleteTemplate = async (templateName) => {
    if (window.confirm(`Are you sure you want to delete ${templateName.name}?`)) {
      const index = labTestsTemplate.findIndex(
        (t) => t.name === templateName.name
      );
      await dispatch(deleteTemplate({ field: "labTestsTemplate", index }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lab Templates</h1>
        <div className="space-x-2">
          <Button onClick={() => navigate("/settings/create-test-template")}>
            Create New Template
          </Button>
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Back to Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labTestsTemplate?.map((template) => (
          <div key={template.name} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <span className="text-sm font-medium">₹{template.rate}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(template.fields).map(([fieldName, field]) => (
                <div key={fieldName} className="text-sm">
                  <span className="font-medium">{field.label}:</span>
                  <span className="ml-2 text-gray-600">
                    {Array.isArray(field.options)
                      ? field.options.join(", ")
                      : field.options || field.unit || field.normalRange}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate(`/settings/edit-test-template/${template.name}`)
                }
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteTemplate(template)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
