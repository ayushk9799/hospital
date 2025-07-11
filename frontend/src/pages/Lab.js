import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import { fetchTemplates } from "../redux/slices/templatesSlice";
import TemplateLabReport from "./TemplateLabReport";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import MergedLabReportPDF from "../components/custom/reports/MergedLabReportPDF";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const Lab = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { labTestsTemplate, status, error } = useSelector(
    (state) => state.templates
  );

  const navigate = useNavigate();
  const hospital = useSelector((state) => state.hospital.hospitalInfo);

  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [merging, setMerging] = useState(false);
  const [isPatientInfoExpanded, setIsPatientInfoExpanded] = useState(true);
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setTimeout(resolve, 250);
      });
    },
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
    }
  }, [location.state]);

  const highlightMatch = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-blue-500">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
    setSelectedTest(null);
  };

  const handleReportSelection = (report, template) => {
    setSelectedReports((prev) => {
      const isSelected = prev.some((r) => r.name === report.name);
      if (isSelected) {
        return prev.filter((r) => r.name !== report.name);
      } else {
        return [...prev, {...report,sections:template.sections}];
      }
    });
  };

  const sortedLabTestsTemplate = React.useMemo(() => {
    if (!patientData?.labTests) {
      if (searchTerm) {
        return (labTestsTemplate || []).filter((template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return [];
    }

    const patientTestNames = new Set(
      patientData.labTests.map((test) => test.name.toLowerCase())
    );

    let filteredTemplates = (labTestsTemplate || []).filter((template) =>
      patientTestNames.has(template.name.toLowerCase())
    );

    if (searchTerm) {
      filteredTemplates = filteredTemplates.filter((template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredTemplates;
  }, [labTestsTemplate, patientData, searchTerm]);

  const getReportStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Sample Collected":
        return "text-[#f5a158]";
      case "Registered":
        return "text-[#b51616]";
      default:
        return "text-black-600";
    }
  };

  const handleLabReportSave = (labReport, updatedData) => {
    // Update patientData with the new lab report while preserving existing reports
    setPatientData((prevData) => {
      const existingReports = prevData.labReports || [];
      const reportIndex = existingReports.findIndex(
        (report) =>
          report.name === labReport.name &&
          new Date(report.date).toDateString() ===
            new Date(labReport.date).toDateString()
      );

      const updatedReports = [...existingReports];
      if (reportIndex !== -1) {
        // Update existing report
        updatedReports[reportIndex] = labReport;
      } else {
        // Add new report
        updatedReports.push(labReport);
      }

      return {
        ...prevData,
        ...updatedData,
        labReports: updatedReports,
      };
    });
  };

  return (
    <div className="container mx-auto p-4 flex h-[calc(100vh-55px)]">
      <div className="flex flex-col md:flex-row gap-8 w-full h-full">
        <div className="w-full md:w-1/3 flex flex-col h-full border-r border-gray-200 pr-2">
          <div className="flex items-center gap-1 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm font-bold">Laboratory Reports</div>
          </div>

          {/* Patient Info */}
          {patientData && (
            <div
              className={cn(
                "mb-4 p-2 bg-white rounded-lg border border-gray-200"
              )}
            >
              <div
                className="flex items-baseline text-sm justify-between cursor-pointer"
                onClick={() => setIsPatientInfoExpanded(!isPatientInfoExpanded)}
              >
                <div className=" font-semibold">
                  Name: {patientData.patientName}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-600 font-semibold">
                    Lab No: {patientData.labNumber}
                  </div>
                  <motion.div
                    animate={{ rotate: isPatientInfoExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isPatientInfoExpanded
                          ? "text-blue-500"
                          : "text-gray-400"
                      )}
                    />
                  </motion.div>
                </div>
              </div>
              <AnimatePresence>
                {isPatientInfoExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 text-sm font-bold pt-2 border-t border-blue-200">
                      <ul className="list-disc list-inside">
                        {patientData.labTests.map((test, index) => (
                          <li
                            key={index}
                            className={`${getReportStatusColor(
                              test.reportStatus
                            )} `}
                          >
                            {test.name}
                            <span className="text-gray-500 text-sm ml-2">
                              ({test.reportStatus})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Lab test search input */}
          <Input
            type="text"
            placeholder="Search for lab test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {/* Lab Tests List */}
          <ScrollArea className="flex-grow">
            <div className=" space-y-4">
              {/* Display labTestsTemplate */}
              {status === "succeeded" && sortedLabTestsTemplate && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Templates</h2>
                    {patientData?.labTests?.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setMerging(!merging)}
                          className="text-[13px] px-4 py-1 h-auto"
                        >
                          {merging ? "Cancel Merge" : "Select Reports"}
                        </Button>
                        {merging && (
                          <Button
                            onClick={handlePrint}
                            className="text-[13px] px-4 py-1 h-auto"
                          >
                            Merge & Print
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {sortedLabTestsTemplate.map((template) => {
                      const isSelected = selectedReports.some(
                        (report) =>
                          report.name?.toLowerCase() ===
                          template.name?.toLowerCase()
                      );
                      const hasReport = patientData?.labReports?.some(
                        (report) =>
                          report?.name?.toLowerCase() ===
                          template?.name?.toLowerCase()
                      );

                      return (
                        <Card
                          key={template._id}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors p-0 ${
                            patientData?.labTests?.some(
                              (test) =>
                                test.name.toLowerCase() ===
                                template.name.toLowerCase()
                            )
                              ? "border-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-[14px] uppercase">
                                {template?.name}
                              </CardTitle> 
                              <span className="text-gray-500 text-xs">
                                ({Object.keys(template?.fields || {}).length} fields)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!merging && (
                                <Button
                                  className={`p-1 text-[12px] h-auto ${
                                    hasReport
                                      ? "bg-green-600 hover:bg-green-700"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleTemplateSelection(template)
                                  }
                                >
                                  {hasReport ? "View Report" : "Create Report"}
                                </Button>
                              )}
                              {hasReport && merging && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleReportSelection(
                                      patientData.labReports.find(
                                        (report) =>
                                          report?.name?.toLowerCase() ===
                                          template?.name?.toLowerCase()
                                      ),template
                                    )
                                  }
                                />
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Display filtered lab categories */}
              {/* {filteredCategories.map((category) => (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle>
                      {highlightMatch(category.name, searchTerm)}
                    </CardTitle>
                    <CardDescription>
                      {highlightMatch(category.description, searchTerm)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.types.map((type) => (
                        <li
                          key={type}
                          className="cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={() =>
                            handleTestSelection(category.name, type)
                          }
                        >
                          {highlightMatch(type, searchTerm)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))} */}
            </div>
          </ScrollArea>
        </div>

        {/* Report Creation Area */}
        <div className="w-full md:w-2/3 h-full">
          <ScrollArea className="h-full">
            <div className="pr-4">
              {selectedTemplate ? (
                <TemplateLabReport
                  template={selectedTemplate}
                  patientData={patientData}
                  onClose={() => setSelectedTemplate(null)}
                  searchWhere={patientData?.type?.toLowerCase()}
                  onSave={handleLabReportSave}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xl text-gray-500">
                    Select a lab test or template to begin
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="max-w-[210mm] hidden mx-auto bg-white shadow-lg print:shadow-none print:block print:mx-0">
        <div ref={componentRef}>
          <MergedLabReportPDF
            reportsData={selectedReports}
            patientData={patientData}
            hospital={hospital}
          />
        </div>
      </div>
    </div>
  );
};

export default Lab;
