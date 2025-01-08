import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format, parse } from "date-fns";
import { Backend_URL } from "../assets/Data";
import { PDFViewer } from "@react-pdf/renderer";
import LabReportPDF from "../components/custom/reports/LabReportPDF";
import { Textarea } from "../components/ui/textarea";
import SearchSuggestion from "../components/custom/registration/CustomSearchSuggestion";
import { useSelector, useDispatch } from "react-redux";
import { addLabReport } from "../redux/slices/patientSlice";
import { useToast } from "../hooks/use-toast";

const TemplateLabReport = ({ template, patientData, onClose, searchWhere }) => {

  const [fields, setFields] = useState([]);
  const [reportDate, setReportDate] = useState(new Date());
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [generatedDate, setGeneratedDate] = useState(null);
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (template && template.fields) {
      const relevantReports = patientData?.labReports.filter(
        (report) => report.name.toLowerCase() === template.name.toLowerCase()
      );
      const latestDate = relevantReports?.length > 0 
      ? new Date(Math.max(...relevantReports.map(report => new Date(report.date))))
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
  }, [template, patientData]);

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

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.name === fieldName ? { ...field, value } : field
      )
    );
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
          visitId: patientData._id,
          labReport: labReportData,
          searchWhere: searchWhere,
        })
      );

      if (addLabReport.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Lab Report added successfully",
          variant: "success",
        });
        if (onClose) {
          onClose(labReportData);
        }
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

  const generatePDF = () => {
    return (
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
          <PDFViewer
            className="w-full h-full min-h-[calc(100vh-100px)]"
            showToolbar={false}
          >
            {generatePDF()}
          </PDFViewer>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Create {template.name} Report
      </h1>
      <Card className="p-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`flex flex-col ${
                  field.label.toLowerCase() === "findings" ||
                  field.label.toLowerCase() === "impressions"
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                <Label htmlFor={field.name} className="mb-1">
                  {field.label}
                </Label>
                {field.label.toLowerCase() === "findings" ||
                field.label.toLowerCase() === "impressions" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => handleInputChange(e, field.name)}
                    className="w-full"
                    rows={4}
                  />
                ) : field.options ? (
                  <SearchSuggestion
                    suggestions={field.options.map((option) => ({
                      name: option,
                    }))}
                    placeholder={`Select ${field.label}`}
                    value={field.value}
                    setValue={(value) =>
                      handleInputChange({ target: { value } }, field.name)
                    }
                    onSuggestionSelect={(suggestion) =>
                      handleOptionSelect(field.name, suggestion)
                    }
                  />
                ) : (
                  <div className="flex items-center">
                    <Input
                      type={field?.unit ? "number" : "text"}
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={(e) => handleInputChange(e, field.name)}
                      className="mr-2"
                      step="0.01"
                    />
                    {field.unit && (
                      <span className="text-sm text-gray-500 w-16">
                        {field.unit}
                      </span>
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

export default TemplateLabReport;
