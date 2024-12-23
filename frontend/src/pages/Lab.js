import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast"; // Make sure this path is correct
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Backend_URL, labCategories } from "../assets/Data";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import CreateLabReport from "./CreateLabReport";
import { ScrollArea } from "../components/ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import { fetchTemplates } from "../redux/slices/templatesSlice";
import TemplateLabReport from "./TemplateLabReport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

const Lab = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { labTestsTemplate, status, error } = useSelector(
    (state) => state.templates
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState({ bookingDate: "" });
  const [searchWhere, setSearchWhere] = useState("opd");
  const [patientData, setPatientData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isPatientSelectionOpen, setIsPatientSelectionOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTemplates());
    }
  }, [status, dispatch]);

  const filteredCategories = labCategories.filter((category) =>
    category.types.some((type) =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Helper function to highlight matched text
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

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientSearch = async () => {
    if (
      searchType === "name" &&
      (!searchQuery.name || !searchQuery.bookingDate)
    ) {
      toast({
        title: "Error",
        description:
          "Please provide both name and booking date for name-based search.",
        variant: "destructive",
      });
      return;
    }
    if (!searchQuery.bookingDate) {
      toast({
        title: "Error",
        description: "Booking date is required for all search types.",
        variant: "destructive",
      });
      return;
    }

   
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/complexsearch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            searchQuery: {
              ...searchQuery,
              bookingDate: searchQuery.bookingDate,
            },
            searchType,
            searchWhere,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }
      const data = await response.json();

      if (data.length > 0) {
        setPatients(data);
        if (data.length === 1) {
          setPatientData(data[0]);
        } else {
          setIsPatientSelectionOpen(true);
        }
      } else {
        setPatients([]);
        setPatientData(null);
        toast({
          title: "No patients found",
          description:
            "No patient details found with the provided information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching for the patient.",
        variant: "destructive",
      });
    }
  };

  const handleTestSelection = (category, type,completeType) => {
    setSelectedTemplate(null);
    setSelectedTest({ category, type ,completeType});
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
    setSelectedTest(null); // Clear any selected individual test
  };

  const handlePatientSelection = (patient) => {
    setPatientData(patient);
    setIsPatientSelectionOpen(false);
  };

  return (
    <div className="container mx-auto p-4 flex h-screen">
      <div className="flex flex-col md:flex-row gap-8 w-full h-full">
        <div className="w-full md:w-1/3 flex flex-col h-full">
          <div className="text-3xl font-bold mb-6">Laboratory Reports</div>
          <div className="space-y-4 mb-4 max-w-md">
            {/* Search UI */}
            <RadioGroup
              defaultValue="opd"
              onValueChange={setSearchWhere}
              className="flex space-x-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opd" id="opd" />
                <Label htmlFor="opd">OPD</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ipd" id="ipd" />
                <Label htmlFor="ipd">IPD</Label>
              </div>
            </RadioGroup>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Select
                  onValueChange={(value) => {
                    setSearchType(value);
                    setSearchQuery({ bookingDate: "" });
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Search type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">
                      Registration No.
                    </SelectItem>
                    <SelectItem value="name">Name And Booking Date</SelectItem>
                    <SelectItem value="mobile">Mobile No.</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  name={searchType}
                  placeholder={`Enter ${searchType || "patient"} details`}
                  value={searchQuery[searchType] || ""}
                  onChange={handleSearchInputChange}
                  className="flex-grow"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-[140px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor="bookingDate"
                          className="block mb-1 cursor-help"
                        >
                          Visit Date
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Date when the patient visited or was recommended for
                          lab test, or when the lab test was ordered.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    value={searchQuery.bookingDate || ""}
                    onChange={handleSearchInputChange}
                  />
                </div>
                <Button
                  onClick={handlePatientSearch}
                  className="flex-grow"
                  disabled={
                    !searchQuery[searchType] || !searchQuery.bookingDate
                  }
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Lab test search input */}
            <Input
              type="text"
              placeholder="Search for lab test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="lab-test-search-input"
            />
          </div>

          {/* First ScrollArea */}
          <ScrollArea className="flex-grow">
            <div className="pr-4">
              {/* Display patient lab tests if found */}
              {patientData && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-4">
                    Lab Tests for {patientData.patientName}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Contact: {patientData.contactNumber}
                  </p>
                  {patientData.labTests && patientData.labTests.length > 0 ? (
                    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                      <ul className="list-disc list-inside space-y-2">
                        {patientData.labTests.map((test, index) => (
                          <li key={index} className="text-gray-700">
                            {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No lab tests found for this patient
                    </p>
                  )}
                </div>
              )}

              {/* Display labTestsTemplate */}
              {status === "succeeded" && labTestsTemplate && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-4">
                    Lab Test Templates
                  </h2>
                  <div className="space-y-4">
                    {labTestsTemplate.map((template) => (
                      <Card
                        key={template._id}
                        className="h-fit cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleTemplateSelection(template)}
                      >
                        <CardHeader>
                          <CardTitle className="transition-colors duration-200">
                            {template.name.toUpperCase()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">
                            Fields: {Object.keys(template.fields).length}
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            {Object.entries(template.fields).map(
                              ([fieldName, fieldData]) => (
                                <li
                                  key={fieldName}
                                  className="text-sm text-gray-700"
                                >
                                  {fieldData.label || fieldName}
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Display filtered lab categories */}
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <Card key={category.name} className="h-fit">
                    <CardHeader>
                      <CardTitle className="transition-colors duration-200">
                        {highlightMatch(category.name, searchTerm)}
                      </CardTitle>
                      <CardDescription>
                        {highlightMatch(category.description, searchTerm)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {category.types.map((type) => (
                          <li
                            key={type}
                            className="hover:text-blue-500 transition-colors duration-200 cursor-pointer"
                            onClick={() =>
                              handleTestSelection(
                                category.name.toLowerCase(),
                                type
                                  .toLowerCase()
                                  .replace(/[()]/g, "")
                                  .replace(/\s+/g, "-"),
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
            </div>
          </ScrollArea>
        </div>

        {/* Second ScrollArea */}
        <div className="w-full md:w-2/3 h-full">
          <ScrollArea className="h-full">
            <div className="pr-4">
              {selectedTemplate ? (
                <TemplateLabReport
                  template={selectedTemplate}
                  patientData={patientData}
                  onClose={() => setSelectedTemplate(null)}
                  searchWhere={searchWhere}
                />
              ) : selectedTest ? (
                <CreateLabReport
                  category={selectedTest.category.replace(" ", "-")}
                  type={selectedTest.type}
                  completeType={selectedTest.completeType}
                  patientData={patientData}
                  onClose={() => setSelectedTest(null)}
                  searchWhere={searchWhere}
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

      {/* Add this Dialog component for patient selection */}
      <Dialog
        open={isPatientSelectionOpen}
        onOpenChange={setIsPatientSelectionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Patient</DialogTitle>
            <DialogDescription>
              Multiple patients found. Please select one:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handlePatientSelection(patient)}
              >
                <p className="font-semibold">{patient.patientName}</p>
                <p className="text-sm text-gray-600">
                  Contact: {patient.contactNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Registration No: {patient.registrationNumber}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lab;
