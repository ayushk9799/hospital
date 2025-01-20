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
  }, []);

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
    pageStyle: `
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      
      body * {
        visibility: hidden;
      }
      
      .page, .page * {
        visibility: visible;
      }
      
      .page {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 20mm;
      }

      .no-print {
        display: none !important;
      }

      .page {
font-family: "Tinos, serif";
background-color: white;
width: 210mm;
min-height: 297mm;
margin: 0 auto;
box-sizing: border-box;
}

.header {
margin-bottom: 5px;
border-bottom: 1px solid #000000;
padding-bottom: 2px;
}

.clinic-name {
font-size: 24pt;
text-align: center;
font-family: "Tinos, serif";
margin-bottom: 3mm;
color: #1a5f7a;
font-weight: bold;
}

.clinic-info {
font-size: 10pt;
text-align: center;
color: #333333;
margin-bottom: 2mm;
}

.doctor-info {
font-size: 12pt;
text-align: center;
margin-top: 3mm;
letter-spacing: 1pt;
color: #1a5f7a;
}

.report-container {
margin-top: 5px;
border-top: 2px solid #ecf0f1;
border-bottom: 2px solid #ecf0f1;
}

.report-row {
display: flex;
border-bottom: 1px solid #ecf0f1;
padding: 3px 0;
align-items: center;
}

.report-row.header {
background-color: #f8f9fa;
}
.header-name{
  width:30%;
  font-size: 20px;
  font-weight: bold;
  padding-right: 2mm;

}
.header-unit{
  width:20%;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
.header-value{
  width:25%;
  font-size: 20px;
  font-weight: bold;
   text-align: center;
}
.header-range{
  width:25%;
  font-size: 20px;
  font-weight: bold;
text-align: right;
}

.test-name {
width: 30%;
font-size: 10pt;
color: #2c3e50;
font-weight: bold;
padding-right: 2mm;
}

.test-value {
width: 25%;
font-size: 10pt;
text-align: center;
}

.test-unit {
width: 20%;
font-size: 10pt;
text-align: center;
}

.test-range {
width: 25%;
font-size: 10pt;
text-align: right;
}

.patient-details {
display: flex;
margin-top: 5px;
padding: 3px;
background-color: #f8f9fa;
border-radius: 2mm;
}

.patient-column {
flex: 1;
padding: 0 2mm;
}

.patient-info {
display: flex;
margin-bottom: 2mm;
align-items: center;
}

.patient-label {
font-size: 10pt;
font-weight: bold;
color: #34495e;
margin-right: 2mm;
min-width: 20mm;
}

.patient-value {
font-size: 10pt;
color: #2c3e50;
}

.report-title {
text-align: center;
margin: 10px 0;
}

.report-title h2 {
margin: 0;
font-size: 1.5rem;
font-weight: bold;
}

/* Print specific styles */
@media print {
@page {
  size: A4;
}

body * {
  visibility: hidden;
}

.page, .page * {
  visibility: visible;
}

.page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  padding:20px;
}

.no-print {
  display: none !important;
}

/* Ensure all styles are applied in print */
.page * {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
} 
    }
  `,
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
