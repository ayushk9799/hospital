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
  Plus,
  Edit2,
  Check,
  PlusCircle,
  Settings,
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";

const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "date", label: "Date" },
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

const FormCustomizer = ({ config, enabledFields, onSave, onCancel }) => {
  const [customConfig, setCustomConfig] = useState(() => {
    const mergeConfigs = (defaultConfig, enabledConfig) => {
      const mergedSections = defaultConfig.sections.map((defaultSection) => {
        const enabledSection = enabledConfig.sections.find(
          (s) => s.id === defaultSection.id
        );
        const mergedFields = [];

        // Merge default fields with enabled status
        defaultSection.fields.forEach((defaultField) => {
          const isEnabled = enabledSection?.fields.some(
            (f) => f.id === defaultField.id
          );
          mergedFields.push({ ...defaultField, hidden: !isEnabled });
        });

        // Add enabled fields not present in default
        enabledSection?.fields.forEach((enabledField) => {
          if (!defaultSection.fields.some((f) => f.id === enabledField.id)) {
            mergedFields.push({ ...enabledField, hidden: false });
          }
        });

        return { ...defaultSection, fields: mergedFields };
      });

      // Add sections from enabledConfig not present in default
      const enabledOnlySections = enabledConfig.sections
        .filter(
          (enabledSection) =>
            !defaultConfig.sections.some((s) => s.id === enabledSection.id)
        )
        .map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({ ...field, hidden: false })),
        }));

      return {
        ...defaultConfig,
        sections: [...mergedSections, ...enabledOnlySections],
      };
    };

    return mergeConfigs(config, enabledFields);
  });

  const [editingField, setEditingField] = useState(null);
  const [showAddField, setShowAddField] = useState(null);
  const [showFieldSettings, setShowFieldSettings] = useState(null);
  const { toast } = useToast();

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
    setCustomConfig({
      ...customConfig,
      sections: customConfig.sections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          fields: section.fields.map((field) => {
            if (field.id !== fieldId) return field;

            if (SPECIAL_FIELDS[field.id]) {
              return {
                ...field,
                ...SPECIAL_FIELDS[field.id],
                ...updates,
              };
            }

            return { ...field, ...updates };
          }),
        };
      }),
    });
  };

  const handleAddField = (sectionId, newField) => {
    setCustomConfig({
      ...customConfig,
      sections: customConfig.sections.map((section) => {
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
    });
    setShowAddField(null);
  };

  const handleFieldSettings = (field) => {
    setShowFieldSettings(field);
  };

  const AddFieldForm = ({ sectionId }) => {
    const [newField, setNewField] = useState({
      label: "",
      type: "text",
      id: "",
    });

    const isIdTaken = (id) => {
      return customConfig.sections.some((section) =>
        section.fields.some((field) => field.id === id)
      );
    };

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

  const FieldSettings = ({ field }) => {
    const [settings, setSettings] = useState(field);
    const { toast } = useToast();

    const isIdTaken = (id) => {
      if (id === field.id) return false;
      return customConfig.sections.some((section) =>
        section.fields.some((f) => f.id === id)
      );
    };

    const handleSave = () => {
      if (isIdTaken(settings.id)) {
        toast({
          title: "Error",
          description: "Field ID must be unique",
          variant: "destructive",
        });
        return;
      }
      handleEditField(field.sectionId, field.id, settings);
      setShowFieldSettings(null);
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Field Settings: {field.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Field ID</Label>
            <Input
              value={settings.id}
              onChange={(e) => setSettings({ ...settings, id: e.target.value })}
              placeholder="Unique field identifier"
            />
          </div>
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select
              value={settings.type}
              onValueChange={(value) =>
                setSettings({ ...settings, type: value })
              }
            >
              <SelectTrigger>
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
          {settings.type === "multiselect" && (
            <div className="space-y-2">
              <Label>Suggestions Source</Label>
              <Input
                value={settings.suggestions || ""}
                onChange={(e) =>
                  setSettings({ ...settings, suggestions: e.target.value })
                }
                placeholder="e.g., diagnosisTemplate"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowFieldSettings(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    );
  };

  const handleSave = () => {
    const finalConfig = {
      ...customConfig,
      sections: customConfig.sections.map((section) => ({
        ...section,
        fields: section.fields.filter((field) => !field.hidden),
      })),
    };
    onSave(finalConfig);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[600px] min-h-[400px] max-h-[90vh]">
      <CardHeader className="border-b py-3">
        <CardTitle>Customize Form Fields</CardTitle>
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
                                      onBlur={() => setEditingField(null)}
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
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7"
                                        >
                                          <Settings className="h-3 w-3" />
                                        </Button>
                                      </DialogTrigger>
                                      <FieldSettings
                                        field={{
                                          ...field,
                                          sectionId: section.id,
                                        }}
                                      />
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
