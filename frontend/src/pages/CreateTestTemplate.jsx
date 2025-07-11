import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateTemplate,
  fetchTemplates,
  bulkUploadTemplates,
  editTemplate,
} from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { fetchLabData } from "../redux/slices/labSlice";
 //import { labCategories, labReportFields } from "../assets/Data";
import { Settings, Search, ChevronLeft, Plus, X, FileDown } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import * as XLSX from "xlsx";

export default function CreateTestTemplate() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { labTestsTemplate, status } = useSelector((state) => state.templates);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.editMode;
  const editTemplateData = location.state?.templateData;
  const { labCategories, labReportFields, fetchLabDataStatus } = useSelector(
    (state) => state.lab
  );
  useEffect(() => {
    if (fetchLabDataStatus === "idle") {
      dispatch(fetchLabData());
    }
  }, [fetchLabDataStatus, dispatch]);

  const [selectedTests, setSelectedTests] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [nameError, setNameError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [expandedFields, setExpandedFields] = useState({});
  const [rate, setRate] = useState("");
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedField, setHighlightedField] = useState(null);
  const leftScrollAreaRef = useRef(null);
  const rightScrollAreaRef = useRef(null);
  const [customFields, setCustomFields] = useState({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef();

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

  const handleSelectAllFields = (category, test) => {
    const formattedCategory = formatKey(category);
    const fields = labReportFields[formattedCategory]?.[test] || [];

    const updatedFields = {};
    fields.forEach((field) => {
      updatedFields[field.name] = {
        label: field.label,
        value: field.value,
        unit: field.unit || "",
        normalRange: field.normalRange || "",
        options: field.options || "",
        calculationDetails: field.calculationDetails || null,
        isSelected: true,
      };
    });

    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [test]: updatedFields,
      },
    }));
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
            calculationDetails: field.calculationDetails || null,
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

  // Restore the useEffect for setting initial template data in edit mode
  useEffect(() => {
    if (isEditMode && editTemplateData) {
      setTemplateName(editTemplateData.name);
      setRate(editTemplateData.rate);
      // Don't close the modal here as it might be needed for other purposes
    }
  }, [isEditMode, editTemplateData]);

  // Reset errors when dialog closes
  const handleDialogChange = (open) => {
    setShowCreationModal(open);
    if (!open) {
      setNameError("");
      setFieldErrors({});
    }
  };

  const handleCreateTemplate = async () => {
    let hasErrors = false;
    const errors = {};

    // Validate template name
    if (!templateName.trim()) {
      setNameError("Report/Test name is required.");
      hasErrors = true;
    }

    // Validate if any fields are selected
    // const hasSelectedFields =
    //   Object.values(selectedFields).some((tests) =>
    //     Object.values(tests).some((fields) =>
    //       Object.values(fields).some((field) => field.isSelected)
    //     )
    //   ) || Object.values(customFields).some((field) => field.isSelected);

    // if (!hasSelectedFields) {
    //   toast({
    //     variant: "destructive",
    //     title: "Validation Error",
    //     description: "Please select at least one field",
    //   });
    //   hasErrors = true;
    //   return;
    // }

    // Validate selected fields
    Object.entries(selectedFields).forEach(([category, tests]) => {
      Object.entries(tests).forEach(([test, fields]) => {
        Object.entries(fields).forEach(([fieldName, field]) => {
          if (field.isSelected) {
            if (!field.label?.trim()) {
              errors[`${category}-${test}-${fieldName}-label`] =
                "Label is required";
              hasErrors = true;
            }
          }
        });
      });
    });

    setFieldErrors(errors);

    if (hasErrors) {
      return;
    }

    try {
      const template = {
        name: templateName.trim(),
        rate: Number(rate) || 0,
        fields: {
          ...Object.entries(customFields)
            .filter(([_, field]) => field.isSelected)
            .reduce(
              (acc, [fieldId, field]) => ({
                ...acc,
                [field.name]: {
                  label: field.label,
                  value: field.value,
                  unit: field.unit,
                  normalRange: field.normalRange,
                  ...(field.options &&
                    field.options.length > 0 && {
                      options: field.options
                        .split(",")
                        .map((opt) => opt.trim())
                        .filter((opt) => opt !== ""),
                    }),
                  ...(field.calculationDetails && {
                    calculationDetails: field.calculationDetails,
                  }),
                },
              }),
              {}
            ),
          ...Object.entries(selectedFields).reduce((acc, [category, tests]) => {
            Object.entries(tests).forEach(([test, fields]) => {
              Object.entries(fields)
                .filter(([_, field]) => field.isSelected)
                .forEach(([fieldName, field]) => {
                  const processedOptions = !Array.isArray(field.options)
                    ? field.options
                        ?.split(",")
                        ?.map((opt) => opt.trim())
                        ?.filter((opt) => opt !== "")
                    : field.options;

                  acc[`${fieldName}`] = {
                    label: field.label,
                    value: field.value,
                    unit: field.unit,
                    normalRange: field.normalRange,
                    ...(processedOptions?.length > 0 && {
                      options: processedOptions,
                    }),
                    ...(field.calculationDetails && {
                      calculationDetails: field.calculationDetails,
                    }),
                  };
                });
            });
            return acc;
          }, {}),
        },
      };

      if (isEditMode) {
        const index = labTestsTemplate.findIndex(
          (t) => t.name === editTemplateData.name
        );
        if (index !== -1) {
          await dispatch(
            editTemplate({
              field: "labTestsTemplate",
              index,
              newValue: { ...editTemplateData, ...template },
            })
          ).unwrap();
          toast({
            title: "Success",
            description: "Template updated successfully",
            variant: "success",
          });
        }
      } else {
        await dispatch(updateTemplate({ labTestsTemplate: template })).unwrap();
        toast({
          title: "Success",
          description: "Template created successfully",
          variant: "success",
        });
      }

      // Only reset if not in edit mode
      if (!isEditMode) {
        setSelectedTests({});
        setSelectedFields({});
        setTemplateName("");
        setRate("");
      }
      setNameError("");
      setShowCreationModal(false);
      navigate("/settings/lab-templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save template. Please try again.",
      });
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
  }, [labCategories, labReportFields]);

  // Filter parameters based on search query
  const filteredParameters = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allParameters.filter(
      (param) =>
        param.field.label.toLowerCase().includes(query) ||
        param.field.name.toLowerCase().includes(query) ||
        (param.field.unit && param.field.unit.toLowerCase().includes(query)) ||
        param.test.toLowerCase().includes(query) 
    );
  }, [searchQuery, allParameters, labCategories, labReportFields]);

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
            calculationDetails: param.field.calculationDetails || null,
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

  // Modify the useEffect for template name auto-update
  useEffect(() => {
    // Only auto-update name if not in edit mode
    if (!isEditMode) {
      // Count selected tests
      let selectedTestCount = 0;
      let lastSelectedTest = null;
      let lastSelectedCategory = null;

      Object.entries(selectedTests).forEach(([category, tests]) => {
        Object.entries(tests).forEach(([test, isSelected]) => {
          if (isSelected) {
            selectedTestCount++;
            lastSelectedTest = test;
            lastSelectedCategory = categoryNameMap[category];
          }
        });
      });

      // Update template name only if exactly one test is selected
      if (selectedTestCount === 1) {
        setTemplateName(`${lastSelectedTest}`);
      } else if (selectedTestCount > 1) {
        // Clear template name if multiple tests are selected
        setTemplateName("");
      }
    }
  }, [selectedTests, categoryNameMap, isEditMode]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddCustomField = (category, test) => {
    const formattedCategory = formatKey(category);
    const newFieldId = `custom-field-${Date.now()}`;

    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [test]: {
          ...prev[formattedCategory]?.[test],
          [newFieldId]: {
            name: newFieldId,
            label: "New Field",
            value: "",
            unit: "",
            normalRange: "",
            options: "",
            calculationDetails: null,
            isSelected: true,
            isCustom: true,
          },
        },
      },
    }));

    // Automatically expand the new field's settings
    setExpandedFields((prev) => ({
      ...prev,
      [`${formattedCategory}-${test}-${newFieldId}`]: true,
    }));
  };

  const handleAddStandaloneCustomField = () => {
    const newFieldId = `custom-field-${Date.now()}`;
    setCustomFields((prev) => ({
      ...prev,
      [newFieldId]: {
        name: newFieldId,
        label: "New Field",
        value: "",
        unit: "",
        normalRange: "",
        options: "",
        calculationDetails: null,
        isSelected: true,
        isCustom: true,
      },
    }));

    // Automatically expand the new field's settings
    setExpandedFields((prev) => ({
      ...prev,
      [newFieldId]: true,
    }));
  };

  const handleExportToExcel = () => {
    // Get existing templates from Redux store
    const existingTemplates = labTestsTemplate || [];

    if (existingTemplates.length === 0) {
      toast({
        title: "No templates to export",
        description: "Please create some templates first.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for export - create rows that Excel can display
    const exportData = existingTemplates.flatMap((template) => {
      const baseTemplateInfo = {
        TemplateName: template.name || "",
        Rate: template.rate || 0,
        Notes: template.notes || "",
        Sections: template.sections?.map((s) => s.name).join(", ") || "",
        TemplateId: template._id || "",
      };

      // If template has no fields, return just the template info
      if (!template.fields || Object.keys(template.fields).length === 0) {
        return [baseTemplateInfo];
      }

      // For each field, create a row with template info and field details
      return Object.entries(template.fields).map(
        ([fieldName, field], index) => ({
          ...baseTemplateInfo,
          FieldName: fieldName,
          Field: field.label || fieldName,
          FieldId: field._id || "",
          Unit: field.unit || "",
          NormalRange: field.normalRange || "",
          Options: Array.isArray(field.options)
            ? field.options.join(", ")
            : field.options || "",
        })
      );
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Templates");
    XLSX.writeFile(workbook, "test_templates.xlsx");
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Group fields by template ID or name to maintain relationships
      const templatesByGroup = json.reduce((acc, row) => {
        // Use TemplateId if available, otherwise use TemplateName as the key
        const templateKey = row.TemplateId || row.TemplateName;

        if (!acc[templateKey]) {
          acc[templateKey] = {
            _id: row.TemplateId || undefined, // Only include _id if it exists
            name: row.TemplateName,
            rate: Number(row.Rate) || 0,
            notes: row.Notes || "",
            sections: row.Sections
              ? row.Sections.split(",").map((name, index) => ({
                  name: name.trim(),
                  position: index,
                }))
              : [],
            fields: {},
          };
        }

        // Add field to template using FieldName
        const fieldId = row.FieldName;
        if (fieldId) {
          acc[templateKey].fields[fieldId] = {
            label: row.Field,
            value: "",
            unit: row.Unit || "",
            normalRange: row.NormalRange || "",
            options: row.Options
              ? row.Options.split(",").map((opt) => opt.trim())
              : [],
            isSelected: true,
          };
        }

        return acc;
      }, {});

      // Convert to array format expected by the API
      const templatesArray = Object.values(templatesByGroup);

      // Use bulkUploadTemplates instead of updateTemplate
      await dispatch(
        bulkUploadTemplates({ labTestsTemplate: templatesArray })
      ).unwrap();

      toast({
        title: "Import successful",
        description: `${templatesArray.length} templates imported with ${json.length} fields.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message || "Could not import test templates.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
  }, [status, dispatch]);

  // Add useEffect to handle pre-selected fields in edit mode
  useEffect(() => {
    if (isEditMode && editTemplateData) {
      // Set template name and rate
      setTemplateName(editTemplateData.name);
      setRate(editTemplateData.rate);

      // Process fields to set selected tests and fields
      const newSelectedTests = {};
      const newSelectedFields = {};
      const newCustomFields = {};

      Object.entries(editTemplateData.fields).forEach(([fieldName, field]) => {
        // Check if field exists in labReportFields
        let foundInLabReportFields = false;

        for (const [categoryKey, tests] of Object.entries(labReportFields)) {
          for (const [testName, fields] of Object.entries(tests)) {
            const matchingField = fields.find((f) => f.name === fieldName);
            if (matchingField) {
              // Field exists in labReportFields, mark test as selected
              if (!newSelectedTests[categoryKey]) {
                newSelectedTests[categoryKey] = {};
              }
              newSelectedTests[categoryKey][testName] = true;

              // Add field to selectedFields
              if (!newSelectedFields[categoryKey]) {
                newSelectedFields[categoryKey] = {};
              }
              if (!newSelectedFields[categoryKey][testName]) {
                newSelectedFields[categoryKey][testName] = {};
              }
              newSelectedFields[categoryKey][testName][fieldName] = {
                ...field,
                isSelected: true,
                fromLabReportFields: true,
              };
              foundInLabReportFields = true;
              break;
            }
          }
          if (foundInLabReportFields) break;
        }

        // If field not found in labReportFields, add as custom field
        if (!foundInLabReportFields) {
          const customFieldId = `custom-field-${fieldName}`;
          newCustomFields[customFieldId] = {
            ...field,
            name: fieldName,
            isSelected: true,
            isCustom: true,
          };
        }
      });

      setSelectedTests(newSelectedTests);
      setSelectedFields(newSelectedFields);
      setCustomFields(newCustomFields);
    }
  }, [isEditMode, editTemplateData]);

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
          <h1 className="text-2xl font-bold">Create Test Template</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportToExcel}
            className="w-full md:w-auto"
          >
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button
            variant="outline"
            onClick={handleImportClick}
            className="w-full md:w-auto"
            disabled={importing}
          >
            Import
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button onClick={() => setShowCreationModal(true)}>
            Create Template
          </Button>
        </div>
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

      <Dialog open={showCreationModal} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Update Test Template" : "Create New Test Template"}
            </DialogTitle>
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
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              {isEditMode ? "Update Template" : "Create Template"}
            </Button>
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">Custom Fields</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStandaloneCustomField}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>
              <div className="space-y-2 grid grid-cols-2 gap-2">
                {Object.entries(customFields).map(([fieldId, field]) => (
                  <div key={fieldId} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.isSelected}
                          onCheckedChange={(checked) => {
                            setCustomFields((prev) => ({
                              ...prev,
                              [fieldId]: {
                                ...prev[fieldId],
                                isSelected: checked,
                              },
                            }));
                          }}
                        />
                        <label className="font-medium">{field.label}</label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFieldSettings(fieldId)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setCustomFields((prev) => {
                              const updated = { ...prev };
                              delete updated[fieldId];
                              return updated;
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedFields[fieldId] && (
                      <div className="mt-2 space-y-2">
                        <Input
                          placeholder="Label"
                          value={field.label}
                          onChange={(e) => {
                            setCustomFields((prev) => ({
                              ...prev,
                              [fieldId]: {
                                ...prev[fieldId],
                                label: e.target.value,
                              },
                            }));
                          }}
                        />
                        <Input
                          placeholder="Unit"
                          value={field.unit}
                          onChange={(e) => {
                            setCustomFields((prev) => ({
                              ...prev,
                              [fieldId]: {
                                ...prev[fieldId],
                                unit: e.target.value,
                              },
                            }));
                          }}
                        />
                        <Input
                          placeholder="Normal Range"
                          value={field.normalRange}
                          onChange={(e) => {
                            setCustomFields((prev) => ({
                              ...prev,
                              [fieldId]: {
                                ...prev[fieldId],
                                normalRange: e.target.value,
                              },
                            }));
                          }}
                        />
                        <Input
                          placeholder="Options (comma separated)"
                          value={field.options}
                          onChange={(e) => {
                            setCustomFields((prev) => ({
                              ...prev,
                              [fieldId]: {
                                ...prev[fieldId],
                                options: e.target.value,
                              },
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {labCategories.map((category) => {
              const formattedCategory = formatKey(category.name);
              return category.types.map((test) => {
                if (!selectedTests[formattedCategory]?.[test]) return null;

                const fields = labReportFields[formattedCategory]?.[test] || [];
                return (
                  <div key={`${formattedCategory}-${test}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{test}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSelectAllFields(category.name, test)
                          }
                        >
                          Select All Fields
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 grid grid-cols-2">
                      {[
                        ...fields,
                        ...Object.entries(
                          selectedFields[formattedCategory]?.[test] || {}
                        )
                          .filter(([_, field]) => field.isCustom)
                          .map(([fieldId, field]) => ({
                            name: fieldId,
                            label: field.label,
                            unit: field.unit,
                            normalRange: field.normalRange,
                            options: field.options,
                            calculationDetails: field.calculationDetails,
                            isCustom: true,
                          })),
                      ].map((field) => {
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
                                  {field.isCustom
                                    ? selectedField?.label
                                    : field.label}
                                </label>
                              </div>
                              {selectedField?.isSelected && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFieldSettings(fieldId)}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  {field.isCustom && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        setSelectedFields((prev) => {
                                          const updated = { ...prev };
                                          delete updated[formattedCategory][
                                            test
                                          ][field.name];
                                          return updated;
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            {expandedFields[fieldId] &&
                              selectedField?.isSelected && (
                                <div className="mt-2 space-y-2 pl-6">
                                  <div>
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
                                    {fieldErrors[
                                      `${formattedCategory}-${test}-${field.name}-label`
                                    ] && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {
                                          fieldErrors[
                                            `${formattedCategory}-${test}-${field.name}-label`
                                          ]
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div>
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
                                    {fieldErrors[
                                      `${formattedCategory}-${test}-${field.name}-unit`
                                    ] && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {
                                          fieldErrors[
                                            `${formattedCategory}-${test}-${field.name}-unit`
                                          ]
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div>
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
                                  </div>
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
                                  {selectedField.calculationDetails && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                                      <h5 className="text-sm font-semibold mb-1">
                                        Calculation Details
                                      </h5>
                                      <div className="space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Formula:{" "}
                                          </span>
                                          {
                                            selectedField.calculationDetails
                                              .formula
                                          }
                                        </p>
                                        {selectedField.calculationDetails
                                          .dependencies && (
                                          <p>
                                            <span className="font-medium">
                                              Dependencies:{" "}
                                            </span>
                                            {selectedField.calculationDetails.dependencies.join(
                                              ", "
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
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
