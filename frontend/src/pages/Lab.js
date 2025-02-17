import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Backend_URL, labCategories } from "../assets/Data";
import { ScrollArea } from "../components/ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import { fetchTemplates } from "../redux/slices/templatesSlice";
import CreateLabReport from "./CreateLabReport";
import TemplateLabReport from "./TemplateLabReport";
import { ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/button";

const Lab = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { labTestsTemplate, status, error } = useSelector(
    (state) => state.templates
  );
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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

  const filteredCategories = labCategories.filter((category) =>
    category.types.some((type) =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  const handleTestSelection = (category, type, completeType) => {
    setSelectedTemplate(null);
    setSelectedTest({ category, type, completeType });
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
    setSelectedTest(null);
  };

  const sortedLabTestsTemplate = React.useMemo(() => {
    if (!labTestsTemplate || !patientData?.labTests) return labTestsTemplate;

    return [...labTestsTemplate].sort((a, b) => {
      const aMatches = patientData.labTests.some(
        (test) => test.name.toLowerCase() === a.name.toLowerCase()
      );
      const bMatches = patientData.labTests.some(
        (test) => test.name.toLowerCase() === b.name.toLowerCase()
      );

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }, [labTestsTemplate, patientData]);

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

  return (
    <div className="container mx-auto p-4 flex h-screen">
      <div className="flex flex-col md:flex-row gap-8 w-full h-full">
        <div className="w-full md:w-1/3 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-3xl font-bold">Laboratory Reports</div>
          </div>

          {/* Patient Info */}
          {patientData && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">
                Patient: {patientData.patientName}
              </h2>
              <p className="text-gray-600">Lab No: {patientData.labNumber}</p>
              <div className="mt-2">
                <h3 className="font-medium mb-1">Ordered Tests:</h3>
                <ul className="list-disc list-inside">
                  {patientData.labTests.map((test, index) => (
                    <li
                      key={index}
                      className={`${getReportStatusColor(
                        test.reportStatus
                      )} font-medium`}
                    >
                      {test.name}
                      <span className="text-gray-500 text-sm ml-2">
                        ({test.reportStatus})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
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
            <div className="pr-4 space-y-4">
              {/* Display labTestsTemplate */}
              {status === "succeeded" && sortedLabTestsTemplate && (
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-4">Lab Test Templates</h2>
                  <div className="space-y-4">
                    {sortedLabTestsTemplate.map((template) => (
                      <Card
                        key={template._id}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                          patientData?.labTests?.some(
                            (test) =>
                              test.name.toLowerCase() ===
                              template.name.toLowerCase()
                          )
                            ? "border-2 border-blue-500"
                            : ""
                        }`}
                        onClick={() => handleTemplateSelection(template)}
                      >
                        <CardHeader>
                          <CardTitle>{template.name.toUpperCase()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Fields: {Object.keys(template.fields).length}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Display filtered lab categories */}
              {filteredCategories.map((category) => (
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
                            handleTestSelection(
                              category.name.toLowerCase(),
                              type,
                              type
                            )
                          }
                        >
                          {highlightMatch(type, searchTerm)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
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
                />
              ) : selectedTest ? (
                <CreateLabReport
                  category={selectedTest.category.replace(" ", "-")}
                  type={selectedTest.type}
                  completeType={selectedTest.completeType}
                  patientData={patientData}
                  onClose={() => setSelectedTest(null)}
                  searchWhere={patientData?.type?.toLowerCase()}
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
    </div>
  );
};

export default Lab;
