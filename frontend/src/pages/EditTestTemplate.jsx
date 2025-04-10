import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { editTemplate, deleteTemplate } from "../redux/slices/templatesSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { labReportFields } from "../assets/Data";
import {
  X,
  Plus,
  ChevronLeft,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const findCalculationDetailsFromLabReportFields = (fieldName) => {
  // Search through all categories and their tests in labReportFields
  for (const category of Object.values(labReportFields)) {
    for (const tests of Object.values(category)) {
      if (Array.isArray(tests)) {
        const matchingField = tests.find((field) => field.name === fieldName);
        if (matchingField?.calculationDetails) {
          return matchingField.calculationDetails;
        }
      }
    }
  }
  return null;
};

const checkMissingDependencies = (dependencies, fields) => {
  if (!dependencies) return [];
  const fieldNames = Object.keys(fields);
  return dependencies.filter((dep) => !fieldNames.includes(dep));
};

// Add counter for generating unique IDs
let idCounter = 0;
const generateUniqueId = (prefix) => {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function EditTestTemplate() {
  const location = useLocation();
  const templateName = location.state.name;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labTestsTemplate } = useSelector((state) => state.templates);

  const [templateData, setTemplateData] = useState({
    name: "",
    rate: 0,
    fields: {},
    notes: "",
    sections: [],
    order: [], // Array of {type: 'field'|'section', id: string}
  });
  useEffect(() => {
    const existingTemplate = labTestsTemplate.find(
      (t) => t.name.trim() === templateName.trim()
    );

    if (existingTemplate) {
      // Convert fields and sections into order array based on section positions
      const fieldEntries = Object.keys(existingTemplate.fields);
      const sections = existingTemplate.sections || [];

      // Sort sections by position
      const sortedSections = [...sections].sort(
        (a, b) => a.position - b.position
      );

      // Build order array by inserting sections at their positions
      let order = [];
      let currentFieldIndex = 0;

      // Add fields before first section
      const firstSectionPos =
        sortedSections.length > 0
          ? sortedSections[0].position
          : fieldEntries.length;
      for (let i = 0; i < firstSectionPos; i++) {
        if (currentFieldIndex < fieldEntries.length) {
          order.push({ type: "field", id: fieldEntries[currentFieldIndex] });
          currentFieldIndex++;
        }
      }
      // Add remaining sections and fields
      for (let i = 0; i < sortedSections.length; i++) {
        const section = sortedSections[i];
        const nextSectionPos =
          i < sortedSections.length - 1
            ? sortedSections[i + 1].position
            : fieldEntries.length;

        // Add the section with a guaranteed ID
        const sectionId = section._id;

        order.push({
          type: "section",
          id: sectionId,
        });

        // Add fields until next section position
        const fieldsToAdd = nextSectionPos - section.position;
        for (let j = 0; j < fieldsToAdd; j++) {
          if (currentFieldIndex < fieldEntries.length) {
            order.push({ type: "field", id: fieldEntries[currentFieldIndex] });
            currentFieldIndex++;
          }
        }
      }

      // Add any remaining fields
      while (currentFieldIndex < fieldEntries.length) {
        order.push({ type: "field", id: fieldEntries[currentFieldIndex] });
        currentFieldIndex++;
      }

      // Process fields to include calculation details from labReportFields
      const processedFields = Object.entries(existingTemplate.fields).reduce(
        (acc, [key, val]) => {
          const calculationDetails =
            val.calculationDetails ||
            findCalculationDetailsFromLabReportFields(key);
          return {
            ...acc,
            [key]: {
              ...val,
              fieldName: key,
              fromLabReportFields: val.calculationDetails ? false : true,
              ...(calculationDetails && {
                calculationDetails,
                isFormulaVisible: false,
              }),
            },
          };
        },
        {}
      );

      // Process sections to ensure they all have IDs
      const processedSections = (existingTemplate.sections || []).map(
        (section) => ({
          ...section,
          id: section._id || Date.now().toString(),
          isCollapsed: false,
        })
      );

      setTemplateData({
        ...existingTemplate,
        fields: processedFields,
        sections: processedSections,
        order: order,
      });
    }
  }, [templateName, labTestsTemplate]);

  const handleFieldChange = (fieldKey, property, value) => {
    setTemplateData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          [property]: property === "calculationDetails" ? value : value,
        },
      },
    }));
  };

  const handleAddNewField = (position = null) => {
    const newFieldKey = generateUniqueId("field");
    const newField = {
      label: "New Field",
      value: "",
      unit: "",
      normalRange: "",
      options: [],
      fieldName: newFieldKey,
      isNew: true,
    };

    setTemplateData((prev) => {
      const newOrder = [...prev.order];
      const newItem = { type: "field", id: newFieldKey };

      if (position !== null) {
        newOrder.splice(position + 1, 0, newItem);
      } else {
        newOrder.push(newItem);
      }

      return {
        ...prev,
        fields: {
          ...prev.fields,
          [newFieldKey]: newField,
        },
        order: newOrder,
      };
    });
  };

  const handleAddSection = (position = null) => {
    const sectionId = generateUniqueId("section");
    const newSection = {
      id: sectionId,
      name: "New Section",
      isCollapsed: false,
    };

    setTemplateData((prev) => {
      const newOrder = [...prev.order];
      const newItem = { type: "section", id: sectionId };

      if (position !== null) {
        newOrder.splice(position + 1, 0, newItem);
      } else {
        newOrder.push(newItem);
      }

      return {
        ...prev,
        sections: [...prev.sections, newSection],
        order: newOrder,
      };
    });
  };

  const handleRemoveField = (fieldKey) => {
    setTemplateData((prev) => {
      const newFields = { ...prev.fields };
      delete newFields[fieldKey];
      return {
        ...prev,
        fields: newFields,
        order: prev.order.filter(
          (item) => !(item.type === "field" && item.id === fieldKey)
        ),
      };
    });
  };

  const handleRemoveSection = (sectionId) => {
    setTemplateData((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
      order: prev.order.filter(
        (item) => !(item.type === "section" && item.id === sectionId)
      ),
    }));
  };
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newOrder = Array.from(templateData.order);
    const [removed] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, removed);

    setTemplateData((prev) => ({
      ...prev,
      order: newOrder,
    }));
  };

  const toggleSectionCollapse = (sectionId) => {
    setTemplateData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, isCollapsed: !section.isCollapsed }
          : section
      ),
    }));
  };

  const handleApplyFormula = (fieldId) => {
    const calculationDetails =
      findCalculationDetailsFromLabReportFields(fieldId);
    if (calculationDetails) {
      setTemplateData((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [fieldId]: {
            ...prev.fields[fieldId],
            calculationDetails,
            isFormulaApplied: true,
            fromLabReportFields: false,
          },
        },
      }));
    }
  };

  const handleRemoveFormula = (fieldId) => {
    setTemplateData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: {
          ...prev.fields[fieldId],
          calculationDetails: undefined,
          isFormulaApplied: false,
          fromLabReportFields: true,
        },
      },
    }));
  };

  const processFieldsBeforeSave = (fields) => {
    return Object.entries(fields).reduce((acc, [key, field]) => {
      const processedOptions =
        typeof field.options === "string"
          ? field.options
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o)
          : field.options;

      return {
        ...acc,
        [key]: {
          label: field.label,
          value: field.value,
          unit: field.unit,
          normalRange: field.normalRange,
          ...(processedOptions?.length > 0 && { options: processedOptions }),
          ...((field.isFormulaApplied || !field.fromLabReportFields) &&
            field.calculationDetails?.formula && {
              calculationDetails: field.calculationDetails,
            }),
        },
      };
    }, {});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedFields = processFieldsBeforeSave(templateData.fields);

      // Convert the visual order into section positions
      const allItems = templateData.order.map((item, index) => ({
        ...item,
        visualPosition: index,
      }));

      // Find field positions for sections
      const sectionsWithPositions = templateData.sections.map((section) => {
        const sectionIndex = allItems.findIndex(
          (item) => item.type === "section" && item.id === section.id
        );

        // Count how many fields appear before this section
        const fieldsBeforeSection = allItems
          .slice(0, sectionIndex)
          .filter((item) => item.type === "field").length;

        return {
          name: section.name,
          position: fieldsBeforeSection,
        };
      });

      // Create the final template without the order array
      const updatedTemplate = {
        name: templateData.name,
        rate: templateData.rate,
        fields: processedFields,
        notes: templateData.notes,
        sections: sectionsWithPositions,
      };

      await dispatch(
        editTemplate({
          field: "labTestsTemplate",
          index: labTestsTemplate.findIndex((t) => t.name === templateName),
          template: updatedTemplate,
        })
      ).unwrap();
      navigate("/settings/lab-templates");
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await dispatch(
          deleteTemplate({
            field: "labTestsTemplate",
            index: labTestsTemplate.findIndex((t) => t.name === templateName),
          })
        ).unwrap();
        navigate("/settings/lab-templates");
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Template: {templateName}</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Template
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 col-span-2">
              <label className="whitespace-nowrap text-sm font-medium text-gray-700 w-32">
                Template Name:
              </label>
              <div className="flex-1 flex items-center">
                <Input
                  className="flex-1"
                  value={templateData.name}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, name: e.target.value })
                  }
                />
                <div className="flex items-center ml-4">
                  <label className="whitespace-nowrap text-sm font-medium text-gray-700 mr-3">
                    Rate:
                  </label>
                  <Input
                    type="number"
                    className="w-[150px] text-right"
                    value={templateData.rate}
                    onChange={(e) =>
                      setTemplateData({ ...templateData, rate: e.target.value })
                    }
                  />
                  <span className="ml-2 text-sm text-gray-600">₹</span>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes:
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={templateData.notes || ""}
                onChange={(e) =>
                  setTemplateData({ ...templateData, notes: e.target.value })
                }
                placeholder="Add any notes about this test template..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Test Fields and Sections</h2>
            <div className="space-x-2">
              <Button
                type="button"
                onClick={() => handleAddNewField()}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
              <Button
                type="button"
                onClick={() => handleAddSection()}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="main-list" mode="standard" type="DEFAULT">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {templateData.order.map((item, index) => (
                    <Draggable
                      key={`${item.type}-${item.id}`}
                      draggableId={`${item.type}-${item.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-lg shadow-sm ${
                            item.type === "section"
                              ? "border-l-4 border-green-500"
                              : ""
                          }`}
                        >
                          {item.type === "field" ? (
                            // Field Item
                            <div className="p-3">
                              <div className="flex items-center gap-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-8 w-8"
                                  onClick={() => {
                                    setTemplateData((prev) => ({
                                      ...prev,
                                      fields: {
                                        ...prev.fields,
                                        [item.id]: {
                                          ...prev.fields[item.id],
                                          isFormulaVisible:
                                            !prev.fields[item.id]
                                              .isFormulaVisible,
                                        },
                                      },
                                    }));
                                  }}
                                >
                                  {templateData.fields[item.id]
                                    ?.isFormulaVisible ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="grid grid-cols-[2fr,1fr,1fr,2fr,auto] gap-4 flex-1">
                                  <Input
                                    className="h-8"
                                    value={
                                      templateData.fields[item.id]?.label || ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    className="h-8"
                                    value={
                                      templateData.fields[item.id]?.unit || ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    className="h-8"
                                    value={
                                      templateData.fields[item.id]
                                        ?.normalRange || ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "normalRange",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    className="h-8"
                                    value={
                                      Array.isArray(
                                        templateData.fields[item.id]?.options
                                      )
                                        ? templateData.fields[
                                            item.id
                                          ].options.join(", ")
                                        : templateData.fields[item.id]
                                            ?.options || ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "options",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Comma separated values"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                      onClick={() => handleRemoveField(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {/* Formula details section */}
                              {templateData.fields[item.id]
                                ?.isFormulaVisible && (
                                <div className="mt-2 ml-12 p-3 bg-gray-50 rounded-md">
                                  {templateData.fields[item.id]
                                    ?.calculationDetails ? (
                                    <>
                                      {(() => {
                                        const missingDeps =
                                          checkMissingDependencies(
                                            templateData.fields[item.id]
                                              .calculationDetails.dependencies,
                                            templateData.fields
                                          );

                                        return (
                                          <>
                                            <div className="text-sm">
                                              <span className="font-medium">
                                                Formula:{" "}
                                              </span>
                                              <span className="text-gray-600">
                                                {
                                                  templateData.fields[item.id]
                                                    .calculationDetails.formula
                                                }
                                              </span>
                                            </div>
                                            <div className="text-sm mt-1">
                                              <span className="font-medium">
                                                Dependencies:{" "}
                                              </span>
                                              <span className="text-gray-600">
                                                {templateData.fields[
                                                  item.id
                                                ].calculationDetails.dependencies.join(
                                                  ", "
                                                )}
                                              </span>
                                            </div>
                                            {missingDeps.length > 0 ? (
                                              <div className="mt-2">
                                                <div className="text-sm text-red-500 mb-2">
                                                  Missing dependencies:{" "}
                                                  {missingDeps.join(", ")}
                                                </div>
                                                {templateData.fields[item.id]
                                                  .fromLabReportFields ? (
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleApplyFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Apply Formula
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleRemoveFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Remove Formula
                                                  </Button>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="mt-2">
                                                {templateData.fields[item.id]
                                                  .fromLabReportFields ? (
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleApplyFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Apply Formula
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleRemoveFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Remove Formula
                                                  </Button>
                                                )}
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </>
                                  ) : (
                                    <>
                                      {(() => {
                                        const availableFormula =
                                          findCalculationDetailsFromLabReportFields(
                                            item.id
                                          );
                                        if (!availableFormula) {
                                          return (
                                            <div className="text-sm text-gray-500">
                                              No calculation formula found for
                                              this parameter in the system.
                                            </div>
                                          );
                                        }

                                        const missingDeps =
                                          checkMissingDependencies(
                                            availableFormula.dependencies,
                                            templateData.fields
                                          );

                                        return (
                                          <>
                                            <div className="text-sm">
                                              <span className="font-medium">
                                                Available Formula:{" "}
                                              </span>
                                              <span className="text-gray-600">
                                                {availableFormula.formula}
                                              </span>
                                            </div>
                                            <div className="text-sm mt-1">
                                              <span className="font-medium">
                                                Dependencies:{" "}
                                              </span>
                                              <span className="text-gray-600">
                                                {availableFormula.dependencies.join(
                                                  ", "
                                                )}
                                              </span>
                                            </div>
                                            {missingDeps.length > 0 ? (
                                              <div className="mt-2 text-sm text-red-500">
                                                Missing dependencies:{" "}
                                                {missingDeps.join(", ")}
                                              </div>
                                            ) : (
                                              <div className="mt-2">
                                                {templateData.fields[item.id]
                                                  .fromLabReportFields ? (
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleApplyFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Apply Formula
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleRemoveFormula(
                                                        item.id
                                                      )
                                                    }
                                                  >
                                                    Remove Formula
                                                  </Button>
                                                )}
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Section Item
                            <div className="p-3">
                              <div className="flex items-center gap-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-8 w-8"
                                  onClick={() => toggleSectionCollapse(item.id)}
                                >
                                  {templateData.sections.find(
                                    (s) => s.id?.toString() === item.id
                                  )?.isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <Input
                                  className="h-8 font-medium flex-1"
                                  value={
                                    templateData.sections.find(
                                      (s) => s.id === item.id
                                    )?.name ?? ""
                                  }
                                  onChange={(e) => {
                                    setTemplateData((prev) => ({
                                      ...prev,
                                      sections: prev.sections.map((section) =>
                                        section.id === item.id
                                          ? { ...section, name: e.target.value }
                                          : section
                                      ),
                                    }));
                                  }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => handleAddNewField(index)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="mr-2 h-4 w-4" /> Add Field
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                    onClick={() => handleRemoveSection(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => navigate("/settings/lab-templates")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
