import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addLabReport } from "../redux/slices/patientSlice";
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
import { useReactToPrint } from "react-to-print";
import LabReportPDF from "../components/custom/reports/LabReportPDF";
import SearchSuggestion from "../components/custom/registration/CustomSearchSuggestion";
import { useSelector } from "react-redux";
import { useToast } from "../hooks/use-toast";

const CreateLabReport = ({
  category,
  type,
  completeType,
  patientData,
  formData,
  onClose,
  onSave,
  searchWhere,
}) => {
  console.log(patientData);
  console.log(category,type)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    unit: "",
    value: "",
    normalRange: "",
  });
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const [reportDate, setReportDate] = useState(new Date());
  const [generatedDate, setGeneratedDate] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setTimeout(resolve, 250);
      });
    }
  });

  useEffect(() => {
    if (labReportFields[category] && labReportFields[category][type]) {
      // const relevantReports =
      //   patientData?.labReports?.filter((report) => report.name === type) || [];
      const relevantReports = formData 
      ? formData.investigations?.filter((report) => report.name === type) || []
      : patientData?.labReports?.filter((report) => report.name === type) || [];
      setAllReports(relevantReports);
      const latestDate = relevantReports?.length > 0 
      ? new Date(Math.max(...relevantReports.map(report => new Date(report.date))))
      : new Date();
      if (relevantReports.length > 0) {
        loadReportForDate(relevantReports, latestDate);
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
      console.log(selectedReport)
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
    console.log(report)
    setFields(
      labReportFields[category][type].map((field) => ({
        ...field,
        value: isNaN(report?.report?.[field.name]?.value)? report?.report?.[field.name]?.value || "" : Number(report?.report?.[field.name]?.value) || "",
        unit: field.unit || "",
        normalRange: field.normalRange || "",
      }))
    );
  };
console.log(fields)
  const resetForm = () => {
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
      name: `${type}`,
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

        if (onSave) {
          onSave(labReportData);
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
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="sticky top-0 bg-white shadow-md p-4 mb-4 flex justify-between items-center no-print">
          <h1 className="text-2xl font-bold">Lab Report Preview</h1>
          <div className="flex gap-4">
            <Button
              onClick={handlePrint}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Print Report
            </Button>
            <Button onClick={() => setShowPDFPreview(false)} variant="outline">
              Back to Form
            </Button>
          </div>
        </div>
        <div className="max-w-[210mm] hidden mx-auto bg-white shadow-lg print:shadow-none  print:block print:mx-0">
          <div ref={componentRef}>
            <LabReportPDF
              reportData={{
                name: type,
                completeType:completeType,
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
  }

  const handleDateChange = (date) => {
    loadReportForDate(allReports, date);
  };

  return (
    <div className="container mx-auto  max-w-6xl">
      <div className="hidden">
        <div ref={componentRef}>
          <LabReportPDF
            reportData={{
              name: type,
              completeType:completeType,
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
      <h1 className="text-3xl font-bold mb-2 text-center">
        Create {type.replace(/-/g, " ")} Report
      </h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
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
            <div className="flex space-x-4">
              <Button type="submit" className="bg-primary text-white">
                Save Lab Report
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
              >
                Print Report
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.name === "findings" || field.name === "impression"
                    ? "col-span-2"
                    : ""
                }
              >
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
        </form>
      </Card>
    </div>
  );
};

export default CreateLabReport;
