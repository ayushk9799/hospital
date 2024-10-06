import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { PlusCircle, X } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import { labReportFields } from "../assets/Data";
import { Backend_URL } from "../assets/Data";
import { PDFViewer } from "@react-pdf/renderer";
import LabReportPDF from "../components/custom/reports/LabReportPDF";

const CreateLabReport = ({ category, type, patientData, onClose, onSave, searchWhere }) => {
  console.log(category);
  console.log(type);
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    unit: "",
    value: "",
    normalRange: "",
  });
  const [reportDate, setReportDate] = useState(new Date());
  const [generatedDate, setGeneratedDate] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [allReports, setAllReports] = useState([]);

  useEffect(() => {
    if (labReportFields[category] && labReportFields[category][type]) {
      const relevantReports = patientData?.labReports?.filter(
        (report) => report.name === type
      ) || [];
      setAllReports(relevantReports);

      if (relevantReports.length > 0) {
        loadReportForDate(relevantReports, new Date());
      } else {
        setReportDate(new Date());
        setGeneratedDate(null);
        resetForm();
      }
    }
  }, [category, type, patientData]);

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
      resetForm();
    }
  };

  const loadReportData = (report) => {
    setFields(
      labReportFields[category][type].map((field) => ({
        ...field,
        value: Number(report?.report?.[field.name]?.value) || "",
        unit: field.unit || "",
        normalRange: field.normalRange || "",
      }))
    );
  };

  const resetForm = () => {
    console.log("form reset ")
    setFields(
      labReportFields[category][type].map((field) => ({
        ...field,
        value: "",
        unit: field.unit || "",
        normalRange: field.normalRange || "",
      }))
    );
  };

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.name === fieldName ? { ...field, value } : field
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(reportDate);
    const labReportData = {
      name: `${type}`,
      date: format(reportDate, "yyyy-MM-dd"),
      report: fields.reduce((acc, field) => {
        acc[field.name] = {
          value: field.value,
          label: field.label,
          unit: field.unit,
          normalRange: field.normalRange
        };
        return acc;
      }, {}),
    };
    console.log(labReportData);
    try {
      const response = await fetch(`${Backend_URL}/api/patients/addLabReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          visitId: patientData._id,
          labReport: labReportData,
          searchWhere: searchWhere,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add lab report");
      }

      const result = await response.json();
      console.log("Lab Report added successfully:", result);
      alert("Lab Report added successfully");
      
      // Call the onSave function with the new lab report data
      onSave(labReportData);
      
      onClose(); // Close the lab report form
    } catch (error) {
      console.error("Error adding lab report:", error);
      alert("Error adding lab report");
    }
  };

  const handleAddField = () => {
    if (newField.name && newField.label && newField.unit) {
      setFields([...fields, { ...newField, value: "" }]);
      setNewField({
        name: "",
        label: "",
        unit: "",
        value: "",
        normalRange: "",
      });
    }
  };

  const handleRemoveField = (fieldName) => {
    setFields(fields.filter((field) => field.name !== fieldName));
  };

  const generatePDF = () => {
    return (
      <LabReportPDF
        reportData={{
          name: type,
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
        patientData={patientData}
      />
    );
  };

  useEffect(() => {
    if (showPDFPreview) {
      window.scrollTo(0, 0);
    }
  }, [showPDFPreview]);

  if (showPDFPreview) {
    return (
      <div className="container mx-auto p-4 max-w-6xl min-h-screen flex flex-col">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2">
          <h1 className="text-3xl font-bold">PDF Preview</h1>
          <Button onClick={() => setShowPDFPreview(false)}>Back to Form</Button>
        </div>
        <div className="flex-grow">
          <PDFViewer className="w-full h-full min-h-[calc(100vh-100px)]" showToolbar={false}>
            {generatePDF()}
          </PDFViewer>
        </div>
      </div>
    );
  }

  const handleDateChange = (date) => {
    loadReportForDate(allReports, date);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Create {type.replace(/-/g, " ")} Report
      </h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            {generatedDate && (
              <div className="text-sm text-gray-500">
                Generated on: {format(generatedDate, "PPP")}
              </div>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.name === "findings" || field.name === "impression" ? "col-span-2" : ""}>
                <Label htmlFor={field.name} className="mb-1">
                  {field.label}
                </Label>
                {field.name === "findings" || field.name === "impression" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => handleInputChange(e, field.name)}
                    className="h-32 w-full"
                  />
                ) : (
                  <div className="flex items-center">
                    <Input
                      type={field.unit ? "number" : "text"}
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={(e) => handleInputChange(e, field.name)}
                      className="mr-2"
                      step={field.unit ? "0.01" : undefined}
                    />
                    {field?.unit && (
                      <span className="text-sm text-gray-500 w-16">
                        {field?.unit}
                      </span>
                    )}
                    {!labReportFields[category][type].some(
                      (f) => f.name === field.name
                    ) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(field.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {field.normalRange && (
                  <span className="text-xs text-gray-500 mt-1">
                    Normal Range: {field.normalRange}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Add Custom Field</h2>
            <div className="flex flex-wrap space-x-2 space-y-2">
              <Input
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
              />
              <Input
                placeholder="Label"
                value={newField.label}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
              />
              <Input
                placeholder="Unit"
                value={newField.unit}
                onChange={(e) =>
                  setNewField({ ...newField, unit: e.target.value })
                }
              />
              <Input
                placeholder="Normal Range"
                value={newField.normalRange}
                onChange={(e) =>
                  setNewField({ ...newField, normalRange: e.target.value })
                }
              />
              <Button type="button" onClick={handleAddField}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button type="submit" className="w-full">
              Save Lab Report
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={() => setShowPDFPreview(true)}
            >
              Show Preview
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateLabReport;