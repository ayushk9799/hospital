import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { labCategories, labReportFields } from "../assets/Data";

export default function CreateTestTemplate() {
  const dispatch = useDispatch();
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [nameError, setNameError] = useState("");

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
      setNameError("Template name is required.");
      return;
    }

    const template = {
      name: templateName,
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
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Test Template</h1>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Input
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              setNameError("");
            }}
            className="max-w-md"
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>

        <ScrollArea className="h-[600px] border rounded-lg p-4">
          {labCategories.map((category) => (
            <div key={category.name} className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.types.map((test) => (
                  <div key={test} className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
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
                    {selectedTests[formatKey(category.name)]?.[test] &&
                      labReportFields[formatKey(category.name)]?.[test] && (
                        <div className="ml-6 space-y-4">
                          {labReportFields[formatKey(category.name)][test].map(
                            (field) => {
                              const selectedField =
                                selectedFields[formatKey(category.name)]?.[
                                  test
                                ]?.[field.name];
                              return (
                                <div key={field.name} className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${field.name}`}
                                      checked={
                                        selectedField?.isSelected || false
                                      }
                                      onCheckedChange={() =>
                                        handleFieldSelection(
                                          category.name,
                                          test,
                                          field
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field.name}`}
                                      className="text-sm font-medium"
                                    >
                                      {field.label}
                                    </label>
                                  </div>

                                  {selectedField?.isSelected && (
                                    <div className="pl-6 space-y-2">
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
                                        className="text-sm"
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
                                        className="text-sm"
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
                                        className="text-sm"
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
                                        className="text-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="mt-6">
          <Button onClick={handleCreateTemplate} className="w-full md:w-auto">
            Create Template
          </Button>
        </div>
      </div>
    </div>
  );
}
