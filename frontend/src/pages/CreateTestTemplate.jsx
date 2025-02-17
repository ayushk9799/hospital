import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { labCategories, labReportFields } from "../assets/Data";
import { Settings, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedField, setHighlightedField] = useState(null);
  const leftScrollAreaRef = useRef(null);
  const rightScrollAreaRef = useRef(null);

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
          [formattedTest]: prev[formattedCategory]?.[formattedTest] || {},
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

  // Create a flattened list of all parameters with their category and test info
  const allParameters = useMemo(() => {
    const parameters = [];
    Object.entries(labReportFields).forEach(([categoryKey, tests]) => {
      Object.entries(tests).forEach(([testName, fields]) => {
        fields.forEach((field) => {
          parameters.push({
            categoryKey,
            category:
              labCategories.find((cat) => formatKey(cat.name) === categoryKey)
                ?.name || categoryKey,
            test: testName,
            field: field,
          });
        });
      });
    });
    return parameters;
  }, []);

  // Filter parameters based on search query
  const filteredParameters = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allParameters.filter(
      (param) =>
        param.field.label.toLowerCase().includes(query) ||
        param.field.name.toLowerCase().includes(query) ||
        (param.field.unit && param.field.unit.toLowerCase().includes(query))
    );
  }, [searchQuery, allParameters]);

  // Reset highlight after some time
  useEffect(() => {
    if (highlightedField) {
      const timer = setTimeout(() => {
        setHighlightedField(null);
      }, 2000); // Remove highlight after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [highlightedField]);

  // Function to handle parameter selection from search
  const handleSearchParameterSelect = (param) => {
    const formattedCategory = formatKey(param.category);
    const formattedTest = param.test;

    // Ensure the test is selected (but don't toggle if already selected)
    setSelectedTests((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: true,
      },
    }));

    // Initialize the test's fields if not already initialized
    setSelectedFields((prev) => {
      const currentTestFields = prev[formattedCategory]?.[formattedTest] || {};
      return {
        ...prev,
        [formattedCategory]: {
          ...prev[formattedCategory],
          [formattedTest]: currentTestFields,
        },
      };
    });

    // Then select the specific field
    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: {
          ...prev[formattedCategory]?.[formattedTest],
          [param.field.name]: {
            label: param.field.label,
            value: param.field.value,
            unit: param.field.unit || "",
            normalRange: param.field.normalRange || "",
            options: param.field.options || "",
            isSelected: true,
          },
        },
      },
    }));

    // Expand the field settings
    const fieldId = `${formattedCategory}-${formattedTest}-${param.field.name}`;
    setExpandedFields((prev) => ({
      ...prev,
      [fieldId]: true,
    }));

    // Set the highlighted field for visual feedback
    setHighlightedField({
      category: formattedCategory,
      test: formattedTest,
      field: param.field.name,
    });

    // Clear search after selection
    setSearchQuery("");

    // Scroll to the selected test element in the left panel
    const testElement = document.getElementById(
      `test-${formattedCategory}-${formattedTest}`
    );
    if (testElement) {
      testElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Scroll to the selected parameter in the right panel
    setTimeout(() => {
      const parameterElement = document.getElementById(
        `parameter-${formattedCategory}-${formattedTest}-${param.field.name}`
      );
      if (parameterElement) {
        parameterElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100); // Small delay to ensure the parameter section is rendered
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Test Template</h1>
        <Button onClick={() => setShowCreationModal(true)}>
          Create Template
        </Button>
      </div>

      {/* Add Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for parameters (e.g. WBC, Hemoglobin, etc.)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {searchQuery.trim() && (
          <div className="mt-2 border rounded-lg shadow-sm">
            <ScrollArea className="h-[200px]">
              {filteredParameters.map((param, index) => (
                <div
                  key={`${param.category}-${param.test}-${param.field.name}-${index}`}
                  className="p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSearchParameterSelect(param)}
                >
                  <div className="font-medium">{param.field.label}</div>
                  <div className="text-sm text-gray-500">
                    {param.category} → {param.test}
                    {param.field.unit && ` (${param.field.unit})`}
                  </div>
                </div>
              ))}
              {filteredParameters.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No parameters found matching your search
                </div>
              )}
            </ScrollArea>
          </div>
        )}
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
          <ScrollArea
            className="w-1/3 border rounded-lg p-4"
            ref={leftScrollAreaRef}
          >
            {labCategories.map((category) => (
              <div key={category.name} className="mb-6">
                <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {category.types.map((test) => (
                    <div
                      id={`test-${formatKey(category.name)}-${test}`}
                      key={test}
                      className={`flex items-center space-x-2 p-2 rounded transition-colors duration-200 ${
                        highlightedField?.category ===
                          formatKey(category.name) &&
                        highlightedField?.test === test
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
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

          <ScrollArea
            className="w-2/3 border rounded-lg p-4"
            ref={rightScrollAreaRef}
          >
            {labCategories.map((category) => {
              const formattedCategory = formatKey(category.name);
              return category.types.map((test) => {
                if (!selectedTests[formattedCategory]?.[test]) return null;

                const fields = labReportFields[formattedCategory]?.[test] || [];
                return (
                  <div key={`${formattedCategory}-${test}`}>
                    <div className="space-y-2 grid grid-cols-2">
                      {fields.map((field) => {
                        const fieldId = `${formattedCategory}-${test}-${field.name}`;
                        const selectedField =
                          selectedFields[formattedCategory]?.[test]?.[
                            field.name
                          ];

                        return (
                          <div
                            key={fieldId}
                            id={`parameter-${formattedCategory}-${test}-${field.name}`}
                            className={`border rounded p-1 transition-colors duration-200 ${
                              highlightedField?.category ===
                                formattedCategory &&
                              highlightedField?.test === test &&
                              highlightedField?.field === field.name
                                ? "bg-blue-50"
                                : ""
                            }`}
                          >
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
