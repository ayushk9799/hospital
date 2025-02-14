import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Backend_URL } from "../assets/Data";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { format } from "date-fns";
import { useToast } from "../hooks/use-toast";

export default function LabReportDetails() {
  const { labId } = useParams();
  const { toast } = useToast();
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    const fetchLabData = async () => {
      try {
        const response = await fetch(`${Backend_URL}/api/lab/tests/${labId}`);
        const data = await response.json();
        if (data.success) {
          setLabData(data.test);
          // Initialize test results from existing data
          const initialResults = {};
          data.test.labTests.forEach((test) => {
            initialResults[test._id] = {
              result: test.result || "",
              status: test.reportStatus || "Pending",
            };
          });
          setTestResults(initialResults);
        }
      } catch (error) {
        console.error("Failed to fetch lab data:", error);
        toast({
          title: "Error",
          description: "Failed to load lab test details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLabData();
  }, [labId, toast]);

  const handleResultChange = (testId, value) => {
    setTestResults((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], result: value },
    }));
  };

  const handleStatusChange = (testId, status) => {
    setTestResults((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], status },
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/lab/tests/${labId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tests: Object.entries(testResults).map(([testId, data]) => ({
              testId,
              ...data,
            })),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Lab results updated successfully",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lab results",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Lab test data not found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lab Test Details</CardTitle>
          <CardDescription>
            Registration Date:{" "}
            {format(new Date(labData.bookingDate), "dd/MM/yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Lab Number</Label>
              <p className="font-medium">{labData.labNumber}</p>
            </div>
            <div>
              <Label>Patient Name</Label>
              <p className="font-medium">{labData.patientName}</p>
            </div>
            <div>
              <Label>Registration Number</Label>
              <p className="font-medium">{labData.registrationNumber}</p>
            </div>
            <div>
              <Label>Contact Number</Label>
              <p className="font-medium">{labData.contactNumber}</p>
            </div>
            <div>
              <Label>Age</Label>
              <p className="font-medium">{labData.age}</p>
            </div>
            <div>
              <Label>Gender</Label>
              <p className="font-medium">{labData.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {labData.labTests.map((test) => (
              <div key={test._id} className="border-b pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Test Name</Label>
                    <p className="font-medium">{test.name}</p>
                  </div>
                  <div>
                    <Label>Result</Label>
                    <Input
                      value={testResults[test._id]?.result || ""}
                      onChange={(e) =>
                        handleResultChange(test._id, e.target.value)
                      }
                      placeholder="Enter test result"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={testResults[test._id]?.status || "Pending"}
                      onValueChange={(value) =>
                        handleStatusChange(test._id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {test.normalRange && (
                    <div>
                      <Label>Normal Range</Label>
                      <p className="text-sm text-gray-600">
                        {test.normalRange}
                      </p>
                    </div>
                  )}
                  {test.units && (
                    <div>
                      <Label>Units</Label>
                      <p className="text-sm text-gray-600">{test.units}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button onClick={handleSave}>Save Results</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
