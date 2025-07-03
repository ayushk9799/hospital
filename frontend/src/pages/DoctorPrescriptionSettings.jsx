import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import TextTemplateSelector from "./TextTemplateSelector";
import ListSuggestionSelector from "./ListSuggestionSelector";
import { Backend_URL } from "../assets/Data";
import { useToast } from "../hooks/use-toast";
import { DEFAULT_PRESCRIPTION_FORM_CONFIG } from "../config/opdPrescriptionConfig";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import {
  GearIcon,
  PersonIcon,
  TrashIcon,
  DragHandleDots2Icon,
} from "@radix-ui/react-icons";
import { Checkbox } from "../components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  fetchDoctorPrescriptionTemplates,
  saveDoctorPrescriptionTemplate,
  selectTemplate,
  updateFormConfig,
  updateSelectedDoctors,
  createNewTemplate,
  clearSelectedTemplate,
} from "../redux/slices/doctorPrescriptionSlice";

const FIELD_TYPES = [
  "textarea",
  "multiselect",
  "vitals",
  "investigations",
  "medicineAdvice",
];

const SortableFieldRow = ({ field, sectionIndex, fieldIndex, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${sectionIndex}-${field.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FieldRow
        field={field}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props}
      />
    </div>
  );
};

const FieldRow = ({
  field,
  onToggle,
  onUpdate,
  onDelete,
  selectedTemplate,
  dragHandleProps,
}) => {
  const [open, setOpen] = useState(false);
  const [tempLabel, setTempLabel] = useState(field.label || "");
  const [tempType, setTempType] = useState(field.type || "");
  const [tempDataSource, setTempDataSource] = useState("");

  // Handle updates to suggestions list for textarea type (template objects)
  const handleTemplatesChange = (newTemplates) => {
    onUpdate({ templates: newTemplates });
  };

  // Sync local state when dialog opens / field changes
  useEffect(() => {
    if (open) {
      setTempLabel(field.label || "");
      setTempType(field.type || "");
      if (field.type === "textarea") {
        setTempDataSource(field.templates || []);
      } else {
        setTempDataSource(field.suggestions ?? "");
      }
    }
  }, [open, field]);

  const handleSave = () => {
    const updatedField = {
      label: tempLabel,
      type: tempType,
    };

    // For multiselect (or other non-textarea types) persist suggestions value
    if (tempType === "multiselect") {
      let valueToSave = tempDataSource;

      // If user typed comma-separated string, convert to trimmed array
      if (typeof valueToSave === "string" && valueToSave.includes(",")) {
        valueToSave = valueToSave
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      updatedField.suggestions = valueToSave;
    }

    onUpdate(updatedField);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <DragHandleDots2Icon className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium">{field.label}</h3>
            <p className="text-sm text-gray-500">
              Type: {field.type}
              {field.component && ` (${field.component})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <GearIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {field.disabled ? "Disabled" : "Enabled"}
          </span>
          <Switch checked={!field.disabled} onCheckedChange={onToggle} />
        </div>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <DialogDescription>
            Update the properties of this prescription field.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>ID</Label>
            <Input id="field-id" value={field.id} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={tempType} onValueChange={setTempType} disabled={field.id}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data Source/Suggestions</Label>
            {tempType === "textarea" ? (
              <TextTemplateSelector
                value={tempDataSource}
                onChange={(value) => setTempDataSource(value)}
                templates={field.templates || []}
                onTemplatesChange={handleTemplatesChange}
                formTemplate={selectedTemplate}
                field={field}
              />
            ) : (
              <ListSuggestionSelector
                value={tempDataSource}
                onChange={(val) => setTempDataSource(val)}
                suggestions={
                  Array.isArray(field.suggestions) ? field.suggestions : []
                }
                onSuggestionsChange={(newList) => setTempDataSource(newList)}
                formTemplate={selectedTemplate}
                field={field}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddFieldDialog = ({ open, onOpenChange, onSave }) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState(FIELD_TYPES[0]);

  const handleSave = () => {
    if (label && type) {
      onSave({
        label,
        type,
        id: `custom-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        isCustom: true,
      });
      setLabel("");
      setType(FIELD_TYPES[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogDescription>
            Provide details for the new custom field.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-field-label">Label</Label>
            <Input
              id="new-field-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Clinical Findings"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Add Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DoctorPrescriptionSettings = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    templates,
    selectedTemplate,
    formConfig,
    selectedDoctors,
    status: loading,
  } = useSelector((state) => state.doctorPrescription);

  const doctors = useSelector((state) => state.staff.doctors);
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    dispatch(fetchDoctorPrescriptionTemplates());
  }, [dispatch]);

  // Handle drag end for field reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Parse section and field info from the drag IDs
    const [activeSectionIndex, activeFieldId] = active.id.split("-");
    const [overSectionIndex, overFieldId] = over.id.split("-");

    // Only allow reordering within the same section
    if (activeSectionIndex !== overSectionIndex) {
      return;
    }

    const sectionIndex = parseInt(activeSectionIndex);
    const section = formConfig.sections[sectionIndex];

    const activeIndex = section.fields.findIndex(
      (field) => field.id === activeFieldId
    );
    const overIndex = section.fields.findIndex(
      (field) => field.id === overFieldId
    );

    if (activeIndex !== overIndex) {
      const newConfig = JSON.parse(JSON.stringify(formConfig));
      const reorderedFields = arrayMove(
        newConfig.sections[sectionIndex].fields,
        activeIndex,
        overIndex
      );
      newConfig.sections[sectionIndex].fields = reorderedFields;
      dispatch(updateFormConfig(newConfig));
    }
  };

  // Function to check if a doctor is assigned to any other template
  const isDoctorAssignedToOtherTemplate = (doctorId) => {
    return templates.some(
      (template) =>
        template._id !== selectedTemplate?._id && // Skip current template
        template.associatedDoctors?.some((doc) => doc._id === doctorId)
    );
  };

  // Function to find template name by doctor ID
  const getTemplateNameForDoctor = (doctorId) => {
    const template = templates.find((template) =>
      template.associatedDoctors?.some((doc) => doc._id === doctorId)
    );
    return template?.name || "";
  };

  const handleAddField = (sectionIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setShowAddFieldDialog(true);
  };

  const handleSaveNewField = (field) => {
    if (currentSectionIndex !== null) {
      const newConfig = JSON.parse(JSON.stringify(formConfig));
      // Ensure fields array exists
      if (!newConfig.sections[currentSectionIndex].fields) {
        newConfig.sections[currentSectionIndex].fields = [];
      }
      newConfig.sections[currentSectionIndex].fields.push(field);
      dispatch(updateFormConfig(newConfig));
    }
  };

  const handleDeleteField = (sectionIndex, fieldIndex) => {
    const newConfig = JSON.parse(JSON.stringify(formConfig));
    newConfig.sections[sectionIndex].fields.splice(fieldIndex, 1);
    dispatch(updateFormConfig(newConfig));
  };

  const handleTemplateSelect = (template) => {
    dispatch(selectTemplate(template));
  };

  const handleDoctorSelection = (doctorId) => {
    const isCurrentlySelected = selectedDoctors.some(
      (doc) => doc._id === doctorId
    );

    // If trying to add the doctor
    if (!isCurrentlySelected) {
      // Check if doctor is already assigned to another template
      if (isDoctorAssignedToOtherTemplate(doctorId)) {
        const templateName = getTemplateNameForDoctor(doctorId);
        toast({
          variant: "destructive",
          title: "Doctor Already Assigned",
          description: `This doctor is already assigned to template: ${templateName}`,
        });
        return;
      }
      const doctor = doctors.find((doc) => doc._id === doctorId);
      if (doctor) {
        dispatch(
          updateSelectedDoctors([
            ...selectedDoctors,
            { _id: doctor._id, name: doctor.name },
          ])
        );
      }
    } else {
      // Proceed with deselection
      dispatch(
        updateSelectedDoctors(
          selectedDoctors.filter((doc) => doc._id !== doctorId)
        )
      );
    }
  };

  const handleSave = async () => {
    const resultAction = await dispatch(
      saveDoctorPrescriptionTemplate({
        name: selectedTemplate.name,
        value: formConfig,
        associatedDoctors: selectedDoctors,
        _id: selectedTemplate._id,
      })
    );

    if (saveDoctorPrescriptionTemplate.fulfilled.match(resultAction)) {
      toast({
        title: "Template Saved",
        description: "Prescription template saved successfully",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          resultAction.payload || "Failed to save prescription template",
      });
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Prescription Templates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template._id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
              <p className="text-gray-600 text-sm">
                Associated Doctors: {template.associatedDoctors?.length || 0}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Click to view and edit template
              </p>
            </Card>
          ))}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-dashed flex items-center justify-center"
            onClick={() => dispatch(createNewTemplate())}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Create New Template
              </h2>
              <p className="text-gray-600 text-sm">
                Click to create a new prescription template
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{selectedTemplate.name}</h1>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => dispatch(clearSelectedTemplate())}
          >
            ← Back to Templates
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDoctorDialog(true)}
            className="flex items-center gap-2"
          >
            <PersonIcon className="h-4 w-4" />
            Manage Doctors
          </Button>
          <Button onClick={handleSave} disabled={loading === "loading"}>
            {loading === "loading" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <AddFieldDialog
        open={showAddFieldDialog}
        onOpenChange={setShowAddFieldDialog}
        onSave={handleSaveNewField}
      />

      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Associate Doctors</DialogTitle>
            <DialogDescription>
              Select doctors who can use this prescription template. Doctors
              already assigned to other templates cannot be selected.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {doctors.map((doctor) => {
              const isAssignedToOther = isDoctorAssignedToOtherTemplate(
                doctor._id
              );
              const assignedTemplateName = isAssignedToOther
                ? getTemplateNameForDoctor(doctor._id)
                : null;

              return (
                <div
                  key={doctor._id}
                  className="flex items-center space-x-2 py-2"
                >
                  <Checkbox
                    id={doctor._id}
                    checked={selectedDoctors.some((d) => d._id === doctor._id)}
                    onCheckedChange={() => handleDoctorSelection(doctor._id)}
                    disabled={isAssignedToOther}
                  />
                  <div className="flex flex-col">
                    <Label
                      htmlFor={doctor._id}
                      className={isAssignedToOther ? "text-gray-400" : ""}
                    >
                      {doctor.name}
                    </Label>
                    {isAssignedToOther && (
                      <span className="text-xs text-gray-400">
                        Assigned to: {assignedTemplateName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {formConfig?.sections.map((section, sectionIndex) => (
        <Card key={section.id} className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <Button
                variant="outline"
                onClick={() => handleAddField(sectionIndex)}
              >
                Add Field
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={section.fields.map(
                  (field) => `${sectionIndex}-${field.id}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {section.fields.map((field, fieldIndex) => (
                    <SortableFieldRow
                      key={field.id}
                      field={field}
                      sectionIndex={sectionIndex}
                      fieldIndex={fieldIndex}
                      selectedTemplate={selectedTemplate}
                      onToggle={() => {
                        const newConfig = JSON.parse(
                          JSON.stringify(formConfig)
                        ); // Deep copy
                        const fieldToToggle =
                          newConfig.sections[sectionIndex].fields[fieldIndex];
                        fieldToToggle.disabled = !fieldToToggle.disabled;
                        dispatch(updateFormConfig(newConfig));
                      }}
                      onUpdate={(updatedField) => {
                        const newConfig = JSON.parse(
                          JSON.stringify(formConfig)
                        ); // Deep copy
                        newConfig.sections[sectionIndex].fields[fieldIndex] = {
                          ...newConfig.sections[sectionIndex].fields[
                            fieldIndex
                          ],
                          ...updatedField,
                        };
                        dispatch(updateFormConfig(newConfig));
                      }}
                      onDelete={
                        field.isCustom
                          ? () => handleDeleteField(sectionIndex, fieldIndex)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DoctorPrescriptionSettings;
