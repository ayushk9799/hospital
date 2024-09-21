import React, { useState } from "react";
import { Link } from "react-router-dom";
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

const Lab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState({ bookingDate: "" });
  const [searchWhere, setSearchWhere] = useState("opd");
  const [patientData, setPatientData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

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
        <span key={index} className="text-blue-500" >
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
      alert("Please provide both name and booking date for name-based search.");
      return;
    }
    if (!searchQuery.bookingDate) {
      alert("Booking date is required for all search types.");
      return;
    }
    searchQuery.bookingDate = searchQuery.bookingDate
      .split("-")
      .reverse()
      .join("-");
    console.log(
      "Searching for patient with",
      searchType,
      searchQuery,
      "in",
      searchWhere
    );
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
            searchQuery,
            searchType,
            searchWhere,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }
      const data = await response.json();
      console.log("Patient search results:", data);
      if (data.length > 0) {
        setPatientData(data[0]); // Set the first patient's data
      } else {
        setPatientData(null);
        alert("No patients found");
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      alert("Error searching for patient");
    }
  };

  const handleTestSelection = (category, type) => {
    setSelectedTest({ category, type });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Laboratory Reports</h1>

      <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-120px)]">
        {/* Left side: Search UI and results */}
        <div className="w-full md:w-1/3 flex flex-col">
          <div className="space-y-4 mb-4">
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
                <div className="w-1/3">
                  <Select
                    onValueChange={(value) => {
                      setSearchType(value);
                      setSearchQuery({ bookingDate: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">
                        Registration No.
                      </SelectItem>
                      <SelectItem value="name">
                        Name And Booking Date
                      </SelectItem>
                      <SelectItem value="mobile">Mobile No.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-2/3">
                  <Input
                    type="text"
                    name={searchType}
                    placeholder={`Enter ${searchType || "patient"} details`}
                    value={searchQuery[searchType] || ""}
                    onChange={handleSearchInputChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1/3">
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
                <div className="w-2/3">
                  <Label className="block mb-1">&nbsp;</Label>{" "}
                  {/* This empty label ensures alignment */}
                  <Button
                    onClick={handlePatientSearch}
                    className="w-full"
                    disabled={
                      !searchQuery[searchType] || !searchQuery.bookingDate
                    }
                  >
                    Search
                  </Button>
                </div>
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

          {/* Scrollable search results */}
          <ScrollArea className="flex-grow">
            <div className="pr-4"> {/* Add padding-right for scrollbar */}
              {/* Display patient lab tests if found */}
              {patientData && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-4">
                    Lab Tests for {patientData.patientName}
                  </h2>
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
                            onClick={() => handleTestSelection(category.name.toLowerCase(), type.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-"))}
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

        {/* Right side: Lab UI */}
        <ScrollArea className="w-full md:w-2/3">
          <div className="pr-4"> {/* Add padding-right for scrollbar */}
            {selectedTest ? (
              <CreateLabReport
                category={selectedTest.category}
                type={selectedTest.type}
                onClose={() => setSelectedTest(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-gray-500">Select a lab test to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Lab;
