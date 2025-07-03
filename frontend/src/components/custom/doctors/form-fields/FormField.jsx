import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Input } from "../../../ui/input";
import MultiSelectField from "./MultiSelectField";
import { Badge } from "../../../ui/badge";
import { X } from "lucide-react";
import VitalsInput from "./VitalsInput";
import MedicationsInput from "./MedicationsInput";

export default function FormField({
  field,
  formData,
  formConfig,
  handleChange,
  handleVitalChange,
  handleMultiSelectChange,
  handleRemoveValue,
  handleMedicationChange,
  addMedication,
  removeMedication,
  suggestions,
}) {
 
  const renderField = () => {
    switch (field.type) {
      case "textarea":
        return (
          <div className="space-y-2">
            {field.suggestions && field.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {field.suggestions.map((suggestion, index) => (
                  <div key={index} className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        // Toggle selection – if already selected, clear; otherwise set value
                        if (formData[field.id] === suggestion.content) {
                          handleChange({
                            target: { name: field.id, value: "" },
                          });
                        } else {
                          handleChange({
                            target: {
                              name: field.id,
                              value: suggestion.content,
                            },
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                        formData[field.id] === suggestion.content
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {suggestion.name}
                    </button>

                    {/* Hover preview when not selected */}
                    {formData[field.id] !== suggestion.content && (
                      <div className="absolute z-50 invisible group-hover:visible bg-popover text-popover-foreground p-3 rounded-lg shadow-lg min-w-[200px] max-w-[400px] mt-2 left-0 whitespace-pre-wrap text-sm border">
                        <div className="font-semibold mb-1">
                          Template Preview:
                        </div>
                        {suggestion.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Textarea
              id={field.id}
              name={field.id}
              value={formData[field.id]}
              onChange={handleChange}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="min-h-[100px] text-sm font-medium"
            />
          </div>
        );
      case "multiselect":
        
       
        return (
          <MultiSelectField
            suggestions={
              (Array.isArray(field.suggestions)
                ? field.suggestions
                : suggestions[field.suggestions] || []).map(item =>
                  typeof item === "object" && item !== null ? item : { name: item }
                )
            }
            selectedValues={formData[field.id] || []}
            onAdd={(value) => {
              const newValues = [...(formData[field.id] || []), value];
              handleMultiSelectChange(field.id, newValues);
            }}
            onRemove={(valueName) => handleRemoveValue(field.id, valueName)}
            placeholder={`Search ${field.label.toLowerCase()}...`}
          />
        );
      case "vitals":
        return (
          <VitalsInput
            vitals={formData.vitals || {}}
            handleVitalChange={handleVitalChange}
          />
        );
      case "medicineAdvice":
        return (
          <MedicationsInput
            medications={formData.medications}
            handleMedicationChange={handleMedicationChange}
            addMedication={addMedication}
            removeMedication={removeMedication}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            id={field.id}
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            className="max-w-[200px]"
          />
        );
      default:
        return <p>Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-lg font-semibold">
        {field.label}
      </Label>
      {renderField()}
    </div>
  );
}
