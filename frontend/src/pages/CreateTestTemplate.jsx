import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { labCategories, labReportFields } from "../assets/Data";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

export default function CreateTestTemplate() {
  const dispatch = useDispatch();
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [nameError, setNameError] = useState("");
  const [expandedFields, setExpandedFields] = useState({});
  const [rate, setRate] = useState("");
  const [showCreationModal, setShowCreationModal] = useState(false);

  const formatKey = (str) => {
    return str.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
  };

  const handleTestSelection = (category, test) => {
    const formattedCategory = formatKey(category);
    const formattedTest = test;

    setSelectedTests((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: !prev[formattedCategory]?.[formattedTest],
      },
    }));

    if (!selectedTests[formattedCategory]?.[formattedTest]) {
      setSelectedFields((prev) => ({
        ...prev,
        [formattedCategory]: {
          ...prev[formattedCategory],
          [formattedTest]: {},
        },
      }));
    } else {
      setSelectedFields((prev) => {
        const newFields = { ...prev };
        if (newFields[formattedCategory]) {
          delete newFields[formattedCategory][formattedTest];
        }
        return newFields;
      });
    }
  };

  const handleFieldSelection = (category, test, field) => {
    const formattedCategory = formatKey(category);
    const formattedTest = test;

    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: {
          ...prev[formattedCategory]?.[formattedTest],
          [field.name]: {
            label: field.label,
            value: field.value,
            unit: field.unit || "",
            normalRange: field.normalRange || "",
            options: field.options || "",
            isSelected:
              !prev[formattedCategory]?.[formattedTest]?.[field.name]
                ?.isSelected,
          },
        },
      },
    }));
  };

  const handleFieldPropertyChange = (
    category,
    test,
    fieldName,
    property,
    value
  ) => {
    const formattedCategory = formatKey(category);
    console.log(value);
    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [test]: {
          ...prev[formattedCategory]?.[test],
          [fieldName]: {
            ...prev[formattedCategory]?.[test]?.[fieldName],
            [property]: value,
          },
        },
      },
    }));
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      setNameError("Report/Test name is required.");
      return;
    }

    const template = {
      name: templateName,
      rate: Number(rate) || 0,
      fields: Object.entries(selectedFields).reduce(
        (acc, [category, tests]) => {
          Object.entries(tests).forEach(([test, fields]) => {
            Object.entries(fields)
              .filter(([_, field]) => field.isSelected)
              .forEach(([fieldName, field]) => {
                const processedOptions = !Array.isArray(field.options)
                  ? field.options
                      .split(",")
                      .map((opt) => opt.trim())
                      .filter((opt) => opt !== "")
                  : field.options;

                acc[`${fieldName}`] = {
                  label: field.label,
                  value: field.value,
                  unit: field.unit,
                  normalRange: field.normalRange,
                  ...(processedOptions.length > 0 && {
                    options: processedOptions,
                  }),
                };
              });
          });
          return acc;
        },
        {}
      ),
    };

    try {
      await dispatch(updateTemplate({ labTestsTemplate: template })).unwrap();
      // Reset form after successful creation
      setSelectedTests({});
      setSelectedFields({});
      setTemplateName("");
      setNameError("");
      setRate("");
      setShowCreationModal(false);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const toggleFieldSettings = (fieldId) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const categoryNameMap = React.useMemo(() => {
    return labCategories.reduce((acc, category) => {
      acc[formatKey(category.name)] = category.name;
      return acc;
    }, {});
  }, [labCategories]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Test Template</h1>
        <Button onClick={() => setShowCreationModal(true)}>
          Create Template
        </Button>
      </div>

      <Dialog open={showCreationModal} onOpenChange={setShowCreationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Report/Test Name"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  setNameError("");
                }}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreationModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6 h-[600px]">
          <ScrollArea className="w-1/3 border rounded-lg p-4">
            {labCategories.map((category) => (
              <div key={category.name} className="mb-6">
                <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {category.types.map((test) => (
                    <div
                      key={test}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <Checkbox
                        id={`${category.name}-${test}`}
                        checked={
                          selectedTests[formatKey(category.name)]?.[test] ||
                          false
                        }
                        onCheckedChange={() =>
                          handleTestSelection(category.name, test)
                        }
                      />
                      <label
                        htmlFor={`${category.name}-${test}`}
                        className="font-medium"
                      >
                        {test}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>

          <ScrollArea className="w-2/3 border rounded-lg p-4">
            {labCategories.map((category) => {
              const formattedCategory = formatKey(category.name);
              return category.types.map((test) => {
                if (!selectedTests[formattedCategory]?.[test]) return null;

                const fields = labReportFields[formattedCategory]?.[test] || [];
                return (
                  <div key={`${formattedCategory}-${test}`} className="">
                    <div className="space-y-2 grid grid-cols-2 ">
                      {fields.map((field) => {
                        const fieldId = `${formattedCategory}-${test}-${field.name}`;
                        const selectedField =
                          selectedFields[formattedCategory]?.[test]?.[
                            field.name
                          ];

                        return (
                          <div key={fieldId} className="border rounded p-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedField?.isSelected || false}
                                  onCheckedChange={() =>
                                    handleFieldSelection(
                                      category.name,
                                      test,
                                      field
                                    )
                                  }
                                />
                                <label className="font-medium">
                                  {field.label}
                                </label>
                              </div>
                              {selectedField?.isSelected && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFieldSettings(fieldId)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {expandedFields[fieldId] &&
                              selectedField?.isSelected && (
                                <div className="mt-2 space-y-2 pl-6">
                                  <Input
                                    placeholder="Label"
                                    value={selectedField.label || ""}
                                    onChange={(e) =>
                                      handleFieldPropertyChange(
                                        category.name,
                                        test,
                                        field.name,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Unit"
                                    value={selectedField.unit || ""}
                                    onChange={(e) =>
                                      handleFieldPropertyChange(
                                        category.name,
                                        test,
                                        field.name,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Normal Range"
                                    value={selectedField.normalRange || ""}
                                    onChange={(e) =>
                                      handleFieldPropertyChange(
                                        category.name,
                                        test,
                                        field.name,
                                        "normalRange",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Options (comma separated)"
                                    value={selectedField.options || ""}
                                    onChange={(e) =>
                                      handleFieldPropertyChange(
                                        category.name,
                                        test,
                                        field.name,
                                        "options",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
