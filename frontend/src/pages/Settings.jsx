import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { labCategories, labReportFields, Backend_URL } from "../assets/Data";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";
import HospitalHeader, {
  headerTemplateString,
} from "../utils/print/HospitalHeader";

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [nameError, setNameError] = useState("");
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const HeaderComponent = createDynamicComponentFromString(headerTemplateString);
  const handleAddStaff = () => {
    navigate("/addstaff");
  };

  const handleCreateRoom = () => {
    navigate("/create-room");
  };

  const handleHospitalInfo = () => {
    navigate("/settings/hospital-info");
  };

  const handleCustomization = () => {
    navigate("/settings/customization");
  };

  const formatKey = (str) => {
    return str.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
  };

  const handleTestSelection = (category, test) => {
    const formattedCategory = formatKey(category);
    const formattedTest = formatKey(test);

    setSelectedTests((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: !prev[formattedCategory]?.[formattedTest],
      },
    }));

    // Initialize or clear selected fields for this test
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
    const formattedTest = formatKey(test);

    setSelectedFields((prev) => ({
      ...prev,
      [formattedCategory]: {
        ...prev[formattedCategory],
        [formattedTest]: {
          ...prev[formattedCategory]?.[formattedTest],
          [field.name]: {
            label: field.label,
            value: field.value,
            unit: field.unit,
            normalRange: field.normalRange,
            options: field.options,
            isSelected:
              !prev[formattedCategory]?.[formattedTest]?.[field.name]
                ?.isSelected,
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
                acc[`${fieldName}`] = {
                  label: field.label,
                  value: field.value,
                  unit: field.unit,
                  normalRange: field.normalRange,
                  options: field.options,
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
      // Handle success (e.g., show a success message)
    } catch (error) {
      console.error("Error creating template:", error);
      // Handle error (e.g., show an error message)
    }

    setIsOpen(false);
    setSelectedTests({});
    setSelectedFields({});
    setTemplateName("");
    setNameError("");
  };

  const handleSaveHeaderTemplate = async () => {
    try {
      // Use the clean template string instead of toString()
     

      // Update Redux state with clean template
      dispatch(updateTemplate({ headerTemplate: headerTemplateString }));

      alert("Header template saved successfully!");
    } catch (error) {
      alert("Failed to save header template: " + error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button onClick={handleAddStaff} className="w-full sm:w-auto">
          Add Staff
        </Button>
        <Button onClick={handleCreateRoom} className="w-full sm:w-auto">
          Create Room
        </Button>
        <Button onClick={handleHospitalInfo} className="w-full sm:w-auto">
          Hospital Info
        </Button>
        <Button onClick={handleCustomization} className="w-full sm:w-auto">
          Customization
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Create Test Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Test Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Input
                  placeholder="Template Name"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    setNameError("");
                  }}
                />
                {nameError && (
                  <p className="text-red-500 text-sm">{nameError}</p>
                )}
              </div>
              <ScrollArea className="h-[300px] pr-4">
                {labCategories.map((category) => (
                  <div key={category.name} className="mb-4">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {category.types.map((test) => (
                        <div key={test} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category.name}-${test}`}
                              checked={
                                selectedTests[formatKey(category.name)]?.[
                                  formatKey(test)
                                ] || false
                              }
                              onCheckedChange={() =>
                                handleTestSelection(category.name, test)
                              }
                            />
                            <label
                              htmlFor={`${category.name}-${test}`}
                              className="text-sm"
                            >
                              {test}
                            </label>
                          </div>
                          {selectedTests[formatKey(category.name)]?.[
                            formatKey(test)
                          ] &&
                            labReportFields[formatKey(category.name)]?.[
                              formatKey(test)
                            ] && (
                              <div className="ml-6 space-y-1">
                                {labReportFields[formatKey(category.name)][
                                  formatKey(test)
                                ].map((field) => (
                                  <div
                                    key={field.name}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field.name}`}
                                      checked={
                                        selectedFields[
                                          formatKey(category.name)
                                        ]?.[formatKey(test)]?.[field.name]
                                          ?.isSelected || false
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
                                      className="text-xs"
                                    >
                                      {field.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </DialogContent>
        </Dialog>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Header Template Settings</h2>

          {/* Preview section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Current Header Preview
            </h3>
            <div className="border p-4 rounded-lg">
              {HeaderComponent ? (
                <HeaderComponent hospitalInfo={hospitalInfo} />
              ) : (
                <div>No preview available</div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSaveHeaderTemplate}
              className="bg-primary text-white"
            >
              Save As Default Header Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
