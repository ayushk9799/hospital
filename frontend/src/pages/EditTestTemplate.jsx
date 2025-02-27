import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { editTemplate, deleteTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { X, Plus, ChevronLeft } from "lucide-react";

export default function EditTestTemplate() {
  const { templateName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labTestsTemplate } = useSelector((state) => state.templates);

  const [templateData, setTemplateData] = useState({
    name: "",
    rate: 0,
    fields: {},
  });

  useEffect(() => {
    const existingTemplate = labTestsTemplate.find(
      (t) => t.name === templateName
    );
    if (existingTemplate) {
      setTemplateData({
        ...existingTemplate,
        fields: Object.entries(existingTemplate.fields).reduce(
          (acc, [key, val]) => ({
            ...acc,
            [key]: { ...val, fieldName: key },
          }),
          {}
        ),
      });
    }
  }, [templateName, labTestsTemplate]);

  const handleFieldChange = (fieldKey, property, value) => {
    setTemplateData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          [property]: value,
        },
      },
    }));
  };

  const handleAddNewField = () => {
    const newFieldKey = `new-field-${Date.now()}`;
    setTemplateData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [newFieldKey]: {
          label: "New Field",
          value: "",
          unit: "",
          normalRange: "",
          options: [],
          fieldName: newFieldKey,
          isNew: true,
        },
      },
    }));
  };

  const handleRemoveField = (fieldKey) => {
    const newFields = { ...templateData.fields };
    delete newFields[fieldKey];
    setTemplateData((prev) => ({ ...prev, fields: newFields }));
  };

  const processFieldsBeforeSave = (fields) => {
    return Object.entries(fields).reduce((acc, [key, field]) => {
      const processedOptions =
        typeof field.options === "string"
          ? field.options
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o)
          : field.options;

      return {
        ...acc,
        [key]: {
          label: field.label,
          value: field.value,
          unit: field.unit,
          normalRange: field.normalRange,
          ...(processedOptions?.length > 0 && { options: processedOptions }),
        },
      };
    }, {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedFields = processFieldsBeforeSave(templateData.fields);
      const updatedTemplate = {
        ...templateData,
        fields: processedFields,
      };

      await dispatch(
        editTemplate({
          field: "labTestsTemplate",
          index: labTestsTemplate.findIndex((t) => t.name === templateName),
          template: updatedTemplate,
        })
      ).unwrap();
      navigate("/settings/lab-templates");
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await dispatch(
          deleteTemplate({
            field: "labTestsTemplate",
            index: labTestsTemplate.findIndex((t) => t.name === templateName),
          })
        ).unwrap();
        navigate("/settings/lab-templates");
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Template: {templateName}</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Template
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 col-span-2">
            <label className="whitespace-nowrap text-sm font-medium text-gray-700 w-32">
              Template Name:
            </label>
            <div className="flex-1 flex items-center">
              <Input
                className="flex-1"
                value={templateData.name}
                onChange={(e) =>
                  setTemplateData({ ...templateData, name: e.target.value })
                }
              />
              <div className="flex items-center ml-4">
                <label className="whitespace-nowrap text-sm font-medium text-gray-700 mr-3">
                  Rate:
                </label>
                <Input
                  type="number"
                  className="w-[150px] text-right"
                  value={templateData.rate}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, rate: e.target.value })
                  }
                />
                <span className="ml-2 text-sm text-gray-600">₹</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Test Fields</h3>
            <Button
              type="button"
              onClick={handleAddNewField}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr,1fr,1fr,2fr,auto] gap-4 bg-gray-50 p-3 border-b">
              <div className="font-medium text-sm text-gray-600">Label</div>
              <div className="font-medium text-sm text-gray-600">Unit</div>
              <div className="font-medium text-sm text-gray-600">
                Normal Range
              </div>
              <div className="font-medium text-sm text-gray-600">Options</div>
              <div className="w-10"></div>
            </div>

            <div className="divide-y">
              {Object.entries(templateData.fields).map(([fieldKey, field]) => (
                <div
                  key={fieldKey}
                  className="grid grid-cols-[1fr,1fr,1fr,2fr,auto] gap-4 p-3 items-center hover:bg-gray-50"
                >
                  <Input
                    className="h-8 font-bold"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(fieldKey, "label", e.target.value)
                    }
                  />
                  <Input
                    className="h-8"
                    value={field.unit}
                    onChange={(e) =>
                      handleFieldChange(fieldKey, "unit", e.target.value)
                    }
                  />
                  <Input
                    className="h-8"
                    value={field.normalRange}
                    onChange={(e) =>
                      handleFieldChange(fieldKey, "normalRange", e.target.value)
                    }
                  />
                  <Input
                    className="h-8"
                    value={
                      Array.isArray(field.options)
                        ? field.options.join(", ")
                        : field.options
                    }
                    onChange={(e) =>
                      handleFieldChange(fieldKey, "options", e.target.value)
                    }
                    placeholder="Comma separated values"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                    onClick={() => handleRemoveField(fieldKey)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => navigate("/settings/lab-templates")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
