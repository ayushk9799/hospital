import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { deleteTemplate } from "../redux/slices/templatesSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";

export default function LabTemplatesManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { labTestsTemplate } = useSelector((state) => state.templates);
  const [expandedTemplates, setExpandedTemplates] = useState({});

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteTemplate = async (templateName) => {
    if (
      window.confirm(`Are you sure you want to delete ${templateName.name}?`)
    ) {
      const index = labTestsTemplate.findIndex(
        (t) => t.name === templateName.name
      );
      await dispatch(deleteTemplate({ field: "labTestsTemplate", index }));
    }
  };

  const toggleTemplate = (templateName) => {
    setExpandedTemplates((prev) => ({
      ...prev,
      [templateName]: !prev[templateName],
    }));
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
          <h1 className="text-2xl font-bold">Lab Templates</h1>
        </div>
        <Button onClick={() => navigate("/settings/create-test-template")}>
          Create New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labTestsTemplate?.map((template) => (
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
                <span className="text-sm font-medium text-blue-600">
                  ₹{template.rate}
                </span>
              </div>
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
                    {Object.entries(template.fields).map(
                      ([fieldName, field]) => (
                        <div key={fieldName} className="text-sm">
                          <span className="font-medium text-blue-700">
                            {field.label}:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {Array.isArray(field.options)
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
                        navigate(
                          `/settings/edit-test-template`,{state:{name:template.name}}
                        )
                      }
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTemplate(template)}
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
    </div>
  );
}
