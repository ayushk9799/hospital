import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  saveTextTemplate,
  deleteTextTemplate,
} from "../redux/slices/textTemplatesSlice";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { TrashIcon, PlusIcon } from "@radix-ui/react-icons";

/*
  TextTemplateSelector
  --------------------
  Props:
    value               string            Currently selected template content (or suggestions string).
    onChange            function          Called with (newValue) when user selects/uses a template.
    templates           array[object]     Array of { name: string, content: string } for the current field.
    onTemplatesChange   function          Called with (newTemplates) whenever templates list is updated.
    formTemplate        object            The form template object.
    field             object            The field object.

  This component renders a dropdown to select a pre-saved template and
  a dialog to create / delete templates for a textarea field.
*/

export default function TextTemplateSelector({
  value = "",
  onChange = () => {},
  templates = [],
  onTemplatesChange = () => {},
  formTemplate = null,
  field = {},
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const [localTemplates, setLocalTemplates] = useState([...templates]);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });

  // Handle adding a new template
  const handleAddTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    // Prevent duplicate names
    if (localTemplates.some((t) => t.name === newTemplate.name.trim())) return;
    setLocalTemplates([...localTemplates, { ...newTemplate }]);
    setNewTemplate({ name: "", content: "" });
  };

  // Handle deleting a template by index
  const handleDeleteTemplate = (idx, formTemplate, field) => {
 
    const template = localTemplates[idx];
 

    // If template has _id, mark for deletion on server
    if (template._id) {
      dispatch(deleteTextTemplate({ templateId: template._id, formTemplate, field }));
    }
    setLocalTemplates(localTemplates.filter((_, i) => i !== idx));
  };

  // Persist only the newly added templates (without _id)
  const handleSaveChanges = async () => {
    const newlyAdded = localTemplates.filter((t) => !t._id);
    let savedTemplates = [];

    if (newlyAdded.length > 0 && formTemplate && field) {
      const savePromises = newlyAdded.map((tpl) =>
        dispatch(
          saveTextTemplate({
            templateData: tpl,
            formTemplate,
            field,
          })
        ).unwrap()
      );

      savedTemplates = await Promise.all(savePromises).catch(() => []);
    }

    const combined = [
      ...localTemplates.filter((t) => t._id),
      ...savedTemplates,
    ];

    onTemplatesChange(combined);
    setDialogOpen(false);
  };

  // If needed, selecting from list inside dialog could call onChange
  const handleUseTemplate = (idx) => {
    const template = localTemplates[idx];
    if (template) {
      onChange(template.content);
      setDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Manage templates dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Templates</DialogTitle>
            <DialogDescription>
              Create new templates or delete existing ones.
            </DialogDescription>
          </DialogHeader>

          {/* Existing templates list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {localTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No templates saved.
              </p>
            )}
            {localTemplates.map((t, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 p-3 border rounded-md cursor-pointer hover:bg-secondary/20"
                onClick={() => handleUseTemplate(idx)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">{t.name}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {t.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(idx, formTemplate, field);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new template */}
          <div className="mt-4 space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">Add New Template</Label>
            <Input
              placeholder="Template Name"
              value={newTemplate.name}
              onChange={(e) =>
                setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Textarea
              placeholder="Template Content"
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate((prev) => ({ ...prev, content: e.target.value }))
              }
              className="min-h-[100px]"
            />
            <Button type="button" variant="outline" onClick={handleAddTemplate}>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Template
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveChanges}>Save</Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
