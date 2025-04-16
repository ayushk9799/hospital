import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { ScrollArea } from "../ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  GripVertical,
  X,
  Edit2,
  Check,
  PlusCircle,
  Settings,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { useSelector } from "react-redux";

export const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "multiselect", label: "Multi Select" },
  { value: "vitals", label: "Vitals" },
  { value: "investigations", label: "Investigations" },
  { value: "medicineAdvice", label: "Medicine Advice" },
];

const SPECIAL_FIELDS = {
  diagnosis: {
    type: "multiselect",
    component: "MultiSelectInput",
    suggestions: "diagnosisTemplate",
    width: "full",
    requiresTemplate: true,
  },
  comorbidities: {
    type: "multiselect",
    component: "MultiSelectInput",
    suggestions: "comorbidities",
    width: "full",
    extraComponent: "ComorbidityHandling",
    requiresTemplate: true,
  },
};

const FormCustomizer = ({
  config,
  enabledFields,
  onSave,
  onCancel,
  initialValues = {},
}) => {
  const { toast } = useToast();
  const { updateTempleteStatus } = useSelector((state) => state.templates);
  const [editingField, setEditingField] = useState(null);
  const [showAddField, setShowAddField] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [templateName, setTemplateName] = useState(
    initialValues.templateName || ""
  );
  const [isDefault, setIsDefault] = useState(initialValues.isDefault || false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });

  const [customConfig, setCustomConfig] = useState(() => {
    const mergeConfigs = (defaultConfig, enabledConfig) => {
      const mergedSections = defaultConfig.sections.map((defaultSection) => {
        const enabledSection = enabledConfig.sections.find(
          (s) => s.id === defaultSection.id
        );

        // Create a map of fields from default config for quick lookup
        const defaultFieldsMap = new Map(
          defaultSection.fields.map((field) => [field.id, field])
        );

        // Start with enabled fields to maintain their order
        let mergedFields = [];

        if (enabledSection) {
          // First add all enabled fields in their order
          mergedFields = enabledSection.fields.map((enabledField) => ({
            ...(defaultFieldsMap.get(enabledField.id) || enabledField),
            ...enabledField,
            hidden: false,
            templates: enabledField.templates || [],
            sectionId: defaultSection.id,
          }));

          // Then add any remaining default fields that weren't in enabled config
          defaultSection.fields.forEach((defaultField) => {
            if (!enabledSection.fields.some((f) => f.id === defaultField.id)) {
              mergedFields.push({
                ...defaultField,
                hidden: true,
                templates: defaultField.templates || [],
                sectionId: defaultSection.id,
              });
            }
          });
        } else {
          // If section not in enabled config, use default fields
          mergedFields = defaultSection.fields.map((field) => ({
            ...field,
            hidden: true,
            templates: field.templates || [],
            sectionId: defaultSection.id,
          }));
        }

        return { ...defaultSection, fields: mergedFields };
      });

      // Handle sections that only exist in enabled config
      const enabledOnlySections = enabledConfig.sections
        .filter(
          (enabledSection) =>
            !defaultConfig.sections.some((s) => s.id === enabledSection.id)
        )
        .map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({
            ...field,
            hidden: false,
            templates: field.templates || [],
            sectionId: section.id,
          })),
        }));

      return {
        ...defaultConfig,
        sections: [...mergedSections, ...enabledOnlySections],
      };
    };

    return mergeConfigs(config, enabledFields);
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sectionId = source.droppableId;
    const section = customConfig.sections.find((s) => s.id === sectionId);

    const newFields = Array.from(section.fields);
    const [removed] = newFields.splice(source.index, 1);
    newFields.splice(destination.index, 0, removed);

    setCustomConfig({
      ...customConfig,
      sections: customConfig.sections.map((s) =>
        s.id === sectionId ? { ...s, fields: newFields } : s
      ),
    });
  };

  const toggleField = (sectionId, fieldId) => {
    setCustomConfig({
      ...customConfig,
      sections: customConfig.sections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          fields: section.fields.map((field) => {
            if (field.id !== fieldId) return field;
            return { ...field, hidden: !field.hidden };
          }),
        };
      }),
    });
  };

  const handleEditField = (sectionId, fieldId, updates) => {
    setCustomConfig((prevConfig) => ({
      ...prevConfig,
      sections: prevConfig.sections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          fields: section.fields.map((field) => {
            if (field.id !== fieldId) return field;

            const updatedField = {
              ...field,
              ...updates,
              sectionId: section.id,
              templates: updates.templates || field.templates || [],
            };

            if (SPECIAL_FIELDS[field.id]) {
              return {
                ...updatedField,
                ...SPECIAL_FIELDS[field.id],
              };
            }

            return updatedField;
          }),
        };
      }),
    }));
  };

  const handleAddField = (sectionId, newField) => {
    setCustomConfig((prevConfig) => ({
      ...prevConfig,
      sections: prevConfig.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const specialField = Object.entries(SPECIAL_FIELDS).find(
          ([_, config]) => config.type === newField.type
        );

        const fieldConfig = {
          id: newField.id,
          label: newField.label,
          type: newField.type,
          hidden: false,
          width: "full",
          sectionId: section.id,
          templates: [],
          ...(newField.type === "multiselect" && {
            component: "MultiSelectInput",
            suggestions: "[]",
          }),
          ...(specialField && specialField[1]),
        };

        return {
          ...section,
          fields: [...section.fields, fieldConfig],
        };
      }),
    }));
    setShowAddField(null);
  };

  const handleAddTemplate = (field) => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Both template name and content are required",
        variant: "destructive",
      });
      return;
    }

    handleEditField(field.sectionId, field.id, {
      ...field,
      templates: [...(field.templates || []), newTemplate],
    });

    setNewTemplate({ name: "", content: "" });
  };

  const handleRemoveTemplate = (field, index) => {
    handleEditField(field.sectionId, field.id, {
      ...field,
      templates: field.templates.filter((_, i) => i !== index),
    });
  };

  const isIdTaken = (id, currentId) => {
    if (id === currentId) return false;
    return customConfig.sections.some((section) =>
      section.fields.some((field) => field.id === id && field.id !== currentId)
    );
  };

  const AddFieldForm = ({ sectionId }) => {
    const [newField, setNewField] = useState({
      label: "",
      type: "text",
      id: "",
    });

    return (
      <div className="flex items-center gap-2 p-2 bg-secondary/5 rounded-md">
        <Input
          placeholder="Field Label"
          value={newField.label}
          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          className="h-8"
        />
        <Input
          placeholder="Field ID"
          value={newField.id}
          onChange={(e) => setNewField({ ...newField, id: e.target.value })}
          className="h-8"
        />
        <Select
          value={newField.type}
          onValueChange={(value) => setNewField({ ...newField, type: value })}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Field Type" />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (isIdTaken(newField.id)) {
              toast({
                title: "Error",
                description: "Field ID must be unique",
                variant: "destructive",
              });
              return;
            }
            handleAddField(sectionId, newField);
          }}
          disabled={!newField.label || !newField.type || !newField.id}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowAddField(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const FieldSettingsContent = ({ field }) => {
    const [localField, setLocalField] = useState({ ...field });
    const [localTemplate, setLocalTemplate] = useState({
      name: "",
      content: "",
    });

    const handleFieldChange = (key, value) => {
      setLocalField((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const handleSaveSettings = () => {
      if (isIdTaken(localField.id, field.id)) {
        toast({
          title: "Error",
          description: "Field ID must be unique",
          variant: "destructive",
        });
        return;
      }
      handleEditField(field.sectionId, field.id, localField);
      setSelectedField(null);
    };

    const handleClose = () => {
      setSelectedField(null);
    };

    const handleLocalAddTemplate = () => {
      if (!localTemplate.name || !localTemplate.content) {
        toast({
          title: "Error",
          description: "Both template name and content are required",
          variant: "destructive",
        });
        return;
      }

      setLocalField((prev) => ({
        ...prev,
        templates: [...(prev.templates || []), localTemplate],
      }));
      setLocalTemplate({ name: "", content: "" });
    };

    const handleLocalRemoveTemplate = (index) => {
      setLocalField((prev) => ({
        ...prev,
        templates: prev.templates.filter((_, i) => i !== index),
      }));
    };

    return (
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0"
        onInteractOutside={handleClose}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Field Settings: {field.label}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-4 h-[90vh]">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field ID</Label>
                  <Input
                    value={localField.id}
                    onChange={(e) => handleFieldChange("id", e.target.value)}
                    placeholder="Unique field identifier"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field Label</Label>
                  <Input
                    value={localField.label}
                    onChange={(e) => handleFieldChange("label", e.target.value)}
                    placeholder="Field label"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field Type</Label>
                  <Select
                    value={localField.type}
                    onValueChange={(value) => handleFieldChange("type", value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {field.type === "textarea" &&
              field.sectionId === "clinicalInfo" && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      Pre-saved Templates
                    </Label>
                    <div className="space-y-4">
                      {localField.templates?.map((template, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-secondary/10 rounded-md border"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">
                                {template.name}
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLocalRemoveTemplate(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {template.content}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="space-y-3 border-t pt-4">
                        <Label className="text-sm font-medium">
                          Add New Template
                        </Label>
                        <div className="space-y-3">
                          <Input
                            placeholder="Template Name"
                            value={localTemplate.name}
                            onChange={(e) =>
                              setLocalTemplate((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="h-9"
                          />
                          <Textarea
                            placeholder="Template Content"
                            value={localTemplate.content}
                            onChange={(e) =>
                              setLocalTemplate((prev) => ({
                                ...prev,
                                content: e.target.value,
                              }))
                            }
                            className="min-h-[100px]"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleLocalAddTemplate}
                            className="w-full h-9"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={updateTempleteStatus === "loading"}
              onClick={handleSaveSettings}
            >
              {updateTempleteStatus === "loading" ? "Saving " : "Save Settings"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    );
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    const cleanConfig = {
      ...customConfig,
      sections: customConfig.sections.map((section) => ({
        ...section,
        fields: section.fields
          .filter((field) => !field.hidden)
          .map((field) => {
            const cleanField = { ...field };
            delete cleanField.sectionId;
            if (!cleanField.templates?.length) {
              delete cleanField.templates;
            }
            return cleanField;
          }),
      })),
    };

    const templateData = {
      name: templateName,
      value: cleanConfig,
      isDefault: isDefault,
    };

    onSave(templateData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[600px] min-h-[400px] max-h-[90vh]">
      <CardHeader className="border-b py-3">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <CardTitle>Customize Form Fields</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label
                htmlFor="templateName"
                className="text-sm font-medium mb-1"
              >
                Template Name
              </Label>
              <Input
                id="templateName"
                placeholder="Enter template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isDefault"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="isDefault" className="text-sm">
                Set as default
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {customConfig.sections.map((section) => (
              <div key={section.id} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">
                    {section.title || section.id}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddField(section.id)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
                {showAddField === section.id && (
                  <AddFieldForm sectionId={section.id} />
                )}
                <Droppable droppableId={section.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-1.5"
                    >
                      {section.fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-2 bg-secondary/10 rounded-md ${
                                field.hidden ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {editingField === field.id ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input
                                      value={field.label}
                                      onChange={(e) =>
                                        handleEditField(section.id, field.id, {
                                          label: e.target.value,
                                        })
                                      }
                                      className="h-7 text-sm"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          setEditingField(null);
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <Label className="text-sm flex-1">
                                      {field.label}
                                      {SPECIAL_FIELDS[field.id] && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          (Template Required)
                                        </span>
                                      )}
                                    </Label>
                                    <Dialog
                                      open={selectedField?.id === field.id}
                                    >
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7"
                                          onClick={() =>
                                            setSelectedField(field)
                                          }
                                        >
                                          <Settings className="h-3 w-3" />
                                        </Button>
                                      </DialogTrigger>
                                      {selectedField?.id === field.id && (
                                        <FieldSettingsContent field={field} />
                                      )}
                                    </Dialog>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7"
                                      onClick={() => setEditingField(field.id)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!field.hidden}
                                  onCheckedChange={() =>
                                    toggleField(section.id, field.id)
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </CardContent>
      </ScrollArea>
      <div className="p-3 border-t mt-auto">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormCustomizer;
