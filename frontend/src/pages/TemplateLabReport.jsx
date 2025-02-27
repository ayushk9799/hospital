import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { useReactToPrint } from "react-to-print";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import { Backend_URL } from "../assets/Data";
import { PDFViewer } from "@react-pdf/renderer";
import LabReportPDF from "../components/custom/reports/LabReportPDF";
import { Textarea } from "../components/ui/textarea";
import SearchSuggestion from "../components/custom/registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { addLabReport } from "../redux/slices/patientSlice";
import { useToast } from "../hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const getValueColor = (value, normalRange, gender) => {
  if (!value || !normalRange) return "inherit";

  // Handle gender-specific ranges
  if (
    normalRange?.toLowerCase()?.includes("male") &&
    normalRange?.toLowerCase()?.includes("female")
  ) {
    const ranges = normalRange?.split(",")?.map((r) => r?.trim());
    const genderRange = ranges.find((r) =>
      r?.toLowerCase()?.includes(gender?.toLowerCase())
    );
    if (genderRange) {
      normalRange = genderRange.replace(/\(.*?\)/g, "").trim();
    }
  }

  // Extract numeric values from the range
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return "inherit";

  // Handle different range patterns
  if (normalRange.includes("-")) {
    // Range pattern: "x-y"
    const [min, max] = normalRange.split("-").map((v) => parseFloat(v));
    if (!isNaN(min) && !isNaN(max)) {
      if (numericValue < min) return "#FF4444"; // Red for low
      if (numericValue > max) return "#FF4444"; // Red for high
      return "#2ECC71"; // Green for normal
    }
  } else if (normalRange.startsWith("<")) {
    // Range pattern: "<x"
    const max = parseFloat(normalRange.substring(1));
    if (!isNaN(max)) {
      return numericValue > max ? "#FF4444" : "#2ECC71";
    }
  } else if (normalRange.startsWith(">")) {
    // Range pattern: ">x"
    const min = parseFloat(normalRange.substring(1));
    if (!isNaN(min)) {
      return numericValue < min ? "#FF4444" : "#2ECC71";
    }
  }

  return "inherit";
};

const getGenderSpecificRange = (normalRange, gender) => {
  if (!normalRange || !gender) return normalRange;

  if (
    normalRange.toLowerCase()?.includes("male") &&
    normalRange.toLowerCase()?.includes("female")
  ) {
    const ranges = normalRange.split(",").map((r) => r.trim());
    const genderRange = ranges.find((r) =>
      r.toLowerCase()?.includes(gender.toLowerCase())
    );
    if (genderRange) {
      return genderRange.replace(/\(.*?\)/g, "").trim();
    }
  }
  return normalRange;
};

// Helper function to reorder the list when items are dragged
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const TemplateLabReport = ({
  template,
  patientData,
  onSave,
  onClose,
  searchWhere,
  component,
}) => {
  const [fields, setFields] = useState([]);
  const [reportDate, setReportDate] = useState(new Date());
  const [allReports, setAllReports] = useState([]);
  const [generatedDate, setGeneratedDate] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const componentRef = useRef(null);

  useEffect(() => {
    if (template && template.fields) {
      const relevantReports = patientData?.labReports.filter(
        (report) => report.name.toLowerCase() === template.name.toLowerCase()
      );
      const latestDate =
        relevantReports?.length > 0
          ? new Date(
              Math.max(
                ...relevantReports.map((report) => new Date(report.date))
              )
            )
          : new Date();
      setAllReports(relevantReports);
      if (relevantReports?.length > 0) {
        loadReportForDate(relevantReports, latestDate);
      } else {
        setReportDate(new Date());
        setGeneratedDate(null);
        initializeEmptyFields();
      }
    }
  }, [template]);

  const handleDateChange = (date) => {
    loadReportForDate(allReports, date);
  };

  const loadReportForDate = (reports, date) => {
    const selectedReport = reports.find(
      (report) => new Date(report.date).toDateString() === date.toDateString()
    );

    if (selectedReport) {
      setReportDate(new Date(selectedReport.date));
      setGeneratedDate(new Date(selectedReport.date));
      loadReportData(selectedReport);
    } else {
      setReportDate(date);
      setGeneratedDate(null);
      initializeEmptyFields();
    }
  };

  const loadReportData = (report) => {
    setFields(
      Object.entries(template.fields).map(([name, field]) => ({
        name,
        label: field.label,
        unit: field.unit,
        normalRange: field.normalRange,
        options: field.options,
        value: report.report[name]?.value || "",
      }))
    );
  };

  const initializeEmptyFields = () => {
    setFields(
      Object.entries(template.fields).map(([name, field]) => ({
        name,
        label: field.label,
        unit: field.unit,
        normalRange: field.normalRange,
        options: field.options,
        value: "",
      }))
    );
  };

  const handleInputChange = (e, fieldName, fieldType) => {
    const { value } = e.target;

    if (fieldType) {
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.name === fieldName ? { ...field, [fieldType]: value } : field
        )
      );
    } else {
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.name === fieldName ? { ...field, value } : field
        )
      );
    }
  };
  const handleOptionSelect = (fieldName, selectedOption) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.name === fieldName
          ? { ...field, value: selectedOption.name }
          : field
      )
    );
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsPrinting(false);
          resolve();
        }, 250);
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const labReportData = {
      name: template.name,
      date: format(reportDate, "yyyy-MM-dd"),
      report: fields.reduce((acc, field) => {
        acc[field.name] = {
          value: field.value,
          label: field.label,
          unit: field.unit,
          normalRange: field.normalRange,
        };
        return acc;
      }, {}),
    };

    try {
      const resultAction = await dispatch(
        addLabReport({
          _id: patientData._id,
          labReport: labReportData,
          component: component,
        })
      );

      if (addLabReport.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Lab Report added successfully",
          variant: "success",
        });

        // Trigger print after successful save
        handlePrint();
        if (onSave) {
          onSave(labReportData);
        }
        // if (onClose) {
        //   onClose(labReportData);
        // }
      } else {
        throw new Error("Failed to add lab report");
      }
    } catch (error) {
      console.error("Error adding lab report:", error);
      toast({
        title: "Error",
        description: "Failed to add lab report",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the fields array based on drag result
    const reorderedFields = reorder(
      fields,
      result.source.index,
      result.destination.index
    );

    setFields(reorderedFields);
  };

  const shouldeTextarea = (unit, normalRange) => {
    return (
      [undefined, "", null, "N/A", "-"].includes(unit) &&
      [undefined, "", null, "N/A", "-"].includes(normalRange)
    );
  };

  return (
    <div className="container px-0 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Create {template.name} Report
      </h1>
      <Card className="p-6  w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{format(reportDate, "PPP")}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={reportDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Table Header */}
          {fields.some(
            (field) =>
              field.label.toLowerCase() !== "findings" &&
              field.label.toLowerCase() !== "impressions" &&
              (field.unit || field.normalRange)
          ) && (
            <div className="grid grid-cols-[4fr_2fr_1fr_3fr] gap-4 mb-2 font-bold bg-gray-100 p-2 rounded">
              <div>Test Name</div>
              <div>Value</div>
              <div>Unit</div>
              <div>Normal Range</div>
            </div>
          )}

          {/* Table Body with Drag and Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.name}
                      draggableId={field.name}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            field.label.toLowerCase() === "findings" ||
                            field.label.toLowerCase() === "impression" ||
                            shouldeTextarea(field.unit, field.normalRange)
                              ? "col-span-full"
                              : "grid grid-cols-[4fr_2fr_1fr_3fr] gap-2 items-center border-b pb-2"
                          } ${
                            snapshot.isDragging
                              ? "bg-blue-50 rounded shadow-md"
                              : ""
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          {field.label.toLowerCase() === "findings" ||
                          field.label.toLowerCase() === "impression" ||
                          shouldeTextarea(field.unit, field.normalRange) ? (
                            <div className="col-span-full space-y-1">
                              <Label htmlFor={field.name} className="mb-1">
                                {field.label}
                              </Label>
                              <Textarea
                                id={field.name}
                                value={field.value}
                                onChange={(e) =>
                                  handleInputChange(e, field.name)
                                }
                                className="h-32 w-full"
                                tabIndex={0}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="font-medium flex items-center gap-2">
                                <span
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                  tabIndex={-1}
                                >
                                  ⋮⋮
                                </span>
                                <Input
                                  value={field.label}
                                  onChange={(e) =>
                                    handleInputChange(e, field.name, "label")
                                  }
                                  className="px-1"
                                  tabIndex={-1}
                                />
                              </div>
                              <div>
                                {field.options ? (
                                  <SearchSuggestion
                                    suggestions={field.options?.map(
                                      (option) => ({
                                        name: option,
                                      })
                                    )}
                                    placeholder={`Select ${field.label}`}
                                    value={field.value}
                                    setValue={(value) =>
                                      handleInputChange(
                                        { target: { value } },
                                        field.name
                                      )
                                    }
                                    onSuggestionSelect={(suggestion) =>
                                      handleOptionSelect(field.name, suggestion)
                                    }
                                    tabIndex={0}
                                  />
                                ) : (
                                  <Input
                                    type={field?.unit ? "text" : "text"}
                                    id={field.name}
                                    name={field.name}
                                    value={field.value}
                                    onChange={(e) =>
                                      handleInputChange(e, field.name)
                                    }
                                    step="0.01"
                                    className="font-bold"
                                    style={{
                                      color: getValueColor(
                                        field.value,
                                        field.normalRange,
                                        patientData?.gender
                                      ),
                                    }}
                                    tabIndex={0}
                                  />
                                )}
                              </div>
                              <div>
                                <Input
                                  value={field.unit}
                                  onChange={(e) =>
                                    handleInputChange(e, field.name, "unit")
                                  }
                                  placeholder="-"
                                  className="px-1"
                                  tabIndex={-1}
                                />
                              </div>
                              <div>
                                <Input
                                  value={getGenderSpecificRange(
                                    field.normalRange,
                                    patientData?.gender ||
                                      patientData?.patient?.gender
                                  )}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e,
                                      field.name,
                                      "normalRange"
                                    )
                                  }
                                  placeholder="-"
                                  className="flex-1"
                                  tabIndex={-1}
                                />
                              </div>
                            </>
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

          <div className="flex justify-center space-x-4 mt-6">
            <Button type="submit" className="w-full">
              Save Lab Report
            </Button>
            <Button type="button" className="w-full" onClick={handlePrint}>
              Print Report
            </Button>
          </div>
        </form>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <LabReportPDF
            reportData={{
              name: template.name,
              date: reportDate,
              report: fields.reduce((acc, field) => {
                acc[field.label] = {
                  value: field.value,
                  unit: field.unit,
                  normalRange: field.normalRange,
                };
                return acc;
              }, {}),
            }}
            hospital={hospital}
            patientData={patientData}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateLabReport;
