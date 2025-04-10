import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { FIELD_TYPES } from "./FormCustomizer";
import { useSelector } from "react-redux";

const FieldSettingDialog = ({
  field,
  customConfig,
  onSave,
  handleEditField,
  setShowFieldSettings,
}) => {
  const { toast } = useToast();
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const { updateTempleteStatus } = useSelector((state) => state.templates);
  const [localField, setLocalField] = useState({ ...field });

  const isIdTaken = (id) => {
    if (id === field.id) return false;
    return customConfig.sections.some((section) =>
      section.fields.some((f) => f.id === id && f.id !== field.id)
    );
  };

  const handleAddTemplate = () => {
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

  const handleRemoveTemplate = (index) => {
    handleEditField(field.sectionId, field.id, {
      ...field,
      templates: field.templates.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (key, value) => {
    setLocalField((prevField) => ({
      ...prevField,
      [key]: value,
    }));
  };

  const handleSaveDialog = () => {
    if (isIdTaken(localField.id)) {
      toast({
        title: "Error",
        description: "Field ID must be unique",
        variant: "destructive",
      });
      return;
    }
    handleEditField(field.sectionId, field.id, localField);
    onSave();
    setShowFieldSettings(false);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0">
      <DialogHeader className="px-6 py-4 border-b">
        <DialogTitle>Field Settings: {field.label}</DialogTitle>
      </DialogHeader>

      <ScrollArea className=" p-4 h-[90vh]">
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

          {/* Templates Section - Only show for textarea fields in clinical info section */}
          {field.type === "textarea" && field.sectionId === "clinicalInfo" && (
            <Card className="p-4">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Pre-saved Templates
                </Label>
                <div className="space-y-4">
                  {field.templates?.map((template, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-secondary/10 rounded-md border"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">{template.name}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTemplate(index)}
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
                        value={newTemplate.name}
                        onChange={(e) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="h-9"
                      />
                      <Textarea
                        placeholder="Template Content"
                        value={newTemplate.content}
                        onChange={(e) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="min-h-[100px]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTemplate}
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
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={updateTempleteStatus === "loading"}
            onClick={handleSaveDialog}
          >
            {updateTempleteStatus === "loading" ? "Saving " : "Save Settings"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default FieldSettingDialog;
