import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { deleteTemplate, editTemplate } from "../redux/slices/templatesSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "../components/ui/input";
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
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

export default function LabTemplatesManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { labTestsTemplate } = useSelector((state) => state.templates);
  const [expandedTemplates, setExpandedTemplates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNoParameters, setFilterNoParameters] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleActivate = (template) => {
    setActionToConfirm({ action: "activate", template });
  };

  const handleDeactivate = (template) => {
    setActionToConfirm({ action: "deactivate", template });
  };

  const confirmAction = async () => {
    if (!actionToConfirm) return;

    const { action, template } = actionToConfirm;
    const index = labTestsTemplate.findIndex((t) => t.name === template.name);
    if (index === -1) return;

    const newStatus = action === "activate" ? "active" : "inactive";
    const updatedTemplate = { ...template, status: newStatus };

    await dispatch(
      editTemplate({
        field: "labTestsTemplate",
        index,
        newValue: updatedTemplate,
      })
    );
    setActionToConfirm(null);
  };

  const handleDelete = (template) => {
    setTemplateToDelete(template);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    const index = labTestsTemplate.findIndex(
      (t) => t.name === templateToDelete.name
    );

    if (index === -1) return;

    await dispatch(deleteTemplate({ field: "labTestsTemplate", index }));
    setIsAlertOpen(false);
    setTemplateToDelete(null);
  };

  const toggleTemplate = (templateName) => {
    setExpandedTemplates((prev) => ({
      ...prev,
      [templateName]: !prev[templateName],
    }));
  };

  const filteredTemplates = labTestsTemplate?.filter((template) => {
    const matchesActivity = showInactive ? true : template?.status !== "inactive";
    if (!matchesActivity) return false;

    const matchesSearchQuery = template?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filterNoParameters) {
      return (
        matchesSearchQuery &&
        (!template?.fields || Object.keys(template?.fields).length === 0)
      );
    }
    return matchesSearchQuery;
  });

  const templatesWithNoParametersCount = labTestsTemplate?.filter(
    (template) => !template?.fields || Object.keys(template?.fields).length === 0
  ).length;

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
          <h1 className="text-2xl font-bold">Lab Templates</h1>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by template name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm font-semibold"
          />
          <Button
            variant={filterNoParameters ? "secondary" : "outline"}
            onClick={() => setFilterNoParameters(!filterNoParameters)}
            className="whitespace-nowrap text-red-500 font-bold"
          >
            No Parameters ({templatesWithNoParametersCount})
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Show Inactive</Label>
          </div>
        </div>
        <Button onClick={() => navigate("/settings/create-test-template")}>
          Create New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates?.map((template) => (
          <div
            key={template.name}
            className={cn(
              "border-2 rounded-lg p-4 transition-all duration-200",
              "hover:shadow-lg hover:border-blue-400",
              expandedTemplates[template.name]
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-200 hover:border-blue-300"
            )}
          >
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => toggleTemplate(template.name)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <div className="flex items-center gap-2">
                  {template.status === "inactive" && (
                    <span className="text-xs font-bold text-yellow-500">
                      (Inactive)
                    </span>
                  )}
                  <span className="text-sm font-medium text-blue-600">
                    ₹{template.rate}
                  </span>
                </div>
              </div>
              {(!template.fields ||
                Object.keys(template.fields).length === 0) && (
                <div className="text-sm font-bold text-red-500 mt-1">
                  No parameters
                </div>
              )}
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    rotate: expandedTemplates[template.name] ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      expandedTemplates[template.name]
                        ? "text-blue-500"
                        : "text-gray-400"
                    )}
                  />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedTemplates[template.name] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2 mt-2 border-t border-blue-200">
                    {Object.entries(template?.fields || {}).map(
                      ([fieldName, field]) => (
                        <div key={fieldName} className="text-sm">
                          <span className="font-medium text-blue-700">
                            {field.label}:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {field.options && Array.isArray(field.options)
                              ? field.options.join(", ")
                              : field.options ||
                                field.unit ||
                                field.normalRange}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/settings/edit-test-template`, {
                          state: { name: template.name },
                        })
                      }
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      Edit
                    </Button>
                    {template.status === "inactive" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(template)}
                        className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(template)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700"
                      >
                        Deactivate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(template)}
                      className="hover:bg-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!actionToConfirm}
        onOpenChange={(isOpen) => !isOpen && setActionToConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to {actionToConfirm?.action} this template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm?.action === "activate"
                ? `This will make "${actionToConfirm?.template.name}" active and available for use.`
                : `This will deactivate "${actionToConfirm?.template.name}". It will be hidden from the default list but not permanently deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionToConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
