import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { ChevronLeft, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import FormCustomizer from "../components/custom/FormCustomizer";
import { getFormConfig } from "../config/dischargeSummaryConfig";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { fetchStaffMembers } from "../redux/slices/staffSlice";
import { useToast } from "../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function DischargeFormTemplates() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const savedTemplates = useSelector(
    (state) => state.templates.dischargeFormTemplateArray || []
  );


  const doctors = useSelector((state) => state.staff.doctors || []);

  useEffect(() => {
    // Fetch staff members when component mounts
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowCustomizer(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowCustomizer(true);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      // Validate template name
      if (!templateData.name?.trim()) {
        toast({
          title: "Error",
          description: "Template name is required",
          variant: "destructive",
        });
        return;
      }

      // Filter out the template being edited (if any)
      const filteredTemplates = editingTemplate
        ? savedTemplates.filter((t) => t.name !== editingTemplate.name)
        : savedTemplates;

      // If new template is set as default, remove default from others
      const updatedTemplates = filteredTemplates.map((t) => ({
        ...t,
        isDefault: templateData.isDefault ? false : t.isDefault,
      }));

      // Add the new/edited template with associated doctors
      const templateToSave = {
        ...templateData,
        associatedDoctors: editingTemplate?.associatedDoctors || [],
        _id: editingTemplate?._id,
      };

      updatedTemplates.push(templateToSave);

      await dispatch(
        updateTemplate({
          dischargeFormTemplateArray: updatedTemplates,
        })
      ).unwrap();

      toast({
        variant: "success",
        title: "Success",
        description: "Template saved successfully",
      });
      setShowCustomizer(false);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (template) => {
    try {
      const updatedTemplates = savedTemplates.filter(
        (t) => t._id !== template._id
      );
      await dispatch(
        updateTemplate({
          dischargeFormTemplateArray: updatedTemplates,
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Template deleted successfully",
        variant: "success",
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleAddDoctor = () => {
    if (!selectedDoctor) return;

    const doctor = doctors.find((d) => d._id === selectedDoctor);
    if (!doctor) return;

    // Check if doctor is already assigned to another template
    const isDoctorAssigned = savedTemplates.some(
      (template) =>
        template._id !== editingTemplate?._id && // Skip current template being edited
        template.associatedDoctors?.some((d) => d._id === doctor._id)
    );

    if (isDoctorAssigned) {
      toast({
        title: "Error",
        description: "This doctor is already assigned to another template",
        variant: "destructive",
      });
      return;
    }

    const updatedTemplate = {
      ...editingTemplate,
      associatedDoctors: [
        ...(editingTemplate?.associatedDoctors || []),
        { _id: doctor._id, name: doctor.name },
      ],
    };
    setEditingTemplate(updatedTemplate);
    setSelectedDoctor(null);
  };

  const handleRemoveDoctor = (doctorId) => {
    const updatedTemplate = {
      ...editingTemplate,
      associatedDoctors: editingTemplate.associatedDoctors.filter(
        (d) => d._id !== doctorId
      ),
    };
    setEditingTemplate(updatedTemplate);
  };
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">
          Discharge Form Templates
        </h1>
      </div>

      <div className="mb-6">
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedTemplates?.map(
          (template) => (
            <Card key={template.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  {template.isDefault && (
                    <div className="flex items-center text-primary">
                      <Check className="h-4 w-4 mr-1" />
                      Default Template
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {showCustomizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <FormCustomizer
              config={getFormConfig()}
              enabledFields={editingTemplate?.value || getFormConfig()}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setShowCustomizer(false);
                setEditingTemplate(null);
              }}
              initialValues={{
                templateName: editingTemplate?.name || "",
                isDefault: editingTemplate?.isDefault || false,
              }}
            />

            <div className="mt-1 border-t pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddDoctor} variant="secondary">
                  Add Doctor
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {editingTemplate?.associatedDoctors?.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="flex items-center gap-2 bg-secondary  rounded"
                  >
                    <span>{doctor.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveDoctor(doctor._id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{deleteConfirm?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
