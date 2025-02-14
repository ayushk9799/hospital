import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Backend_URL } from "../assets/Data";

export default function AllLabTests() {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTests, setFilteredTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch lab tests from your API
    const fetchTests = async () => {
      try {
        const response = await fetch(`${Backend_URL}/api/lab/tests`);
        const data = await response.json();
        if (data.success) {
          setTests(data.tests);
          setFilteredTests(data.tests);
        }
      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
      }
    };

    fetchTests();
  }, []);

  useEffect(() => {
    const filtered = tests.filter((test) =>
      Object.values(test).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredTests(filtered);
  }, [searchTerm, tests]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-yellow-600";
      case "Pending":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Lab Tests</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <Button onClick={() => navigate("/lab/registration")}>
              New Registration
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lab Number</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test._id}>
                  <TableCell>{test.labNumber}</TableCell>
                  <TableCell>{test.patientName}</TableCell>
                  <TableCell>
                    {format(new Date(test.bookingDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {test.labTests.map((t) => t.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    <span className={getStatusColor(test.status)}>
                      {test.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    ₹{test.paymentInfo.totalAmount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      onClick={() => navigate(`/lab/reports/${test._id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
