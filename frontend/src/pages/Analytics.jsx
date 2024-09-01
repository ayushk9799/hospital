import React, { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const sampleItems = [
  {
    id: "1",
    name: "Aspirin",
    category: "Pain Relief",
    price: 5.99,
    stock: 100,
    expiryDate: "2024-12-31",
  },
  {
    id: "2",
    name: "Amoxicillin",
    category: "Antibiotics",
    price: 12.5,
    stock: 50,
    expiryDate: "2024-06-30",
  },
  {
    id: "3",
    name: "Lisinopril",
    category: "Blood Pressure",
    price: 8.75,
    stock: 75,
    expiryDate: "2025-03-31",
  },
  {
    id: "4",
    name: "Metformin",
    category: "Diabetes",
    price: 6.25,
    stock: 60,
    expiryDate: "2024-09-30",
  },
  {
    id: "5",
    name: "Ibuprofen",
    category: "Pain Relief",
    price: 4.99,
    stock: 120,
    expiryDate: "2024-11-30",
  },
  {
    id: "6",
    name: "Levothyroxine",
    category: "Thyroid",
    price: 10.0,
    stock: 40,
    expiryDate: "2025-01-31",
  },
  {
    id: "7",
    name: "Omeprazole",
    category: "Digestive Health",
    price: 7.5,
    stock: 80,
    expiryDate: "2024-10-31",
  },
  {
    id: "8",
    name: "Amlodipine",
    category: "Blood Pressure",
    price: 9.25,
    stock: 55,
    expiryDate: "2025-02-28",
  },
  {
    id: "9",
    name: "Sertraline",
    category: "Mental Health",
    price: 11.75,
    stock: 30,
    expiryDate: "2024-08-31",
  },
  {
    id: "10",
    name: "Albuterol",
    category: "Respiratory",
    price: 15.0,
    stock: 25,
    expiryDate: "2024-07-31",
  },
  {
    id: "11",
    name: "Albuterol1",
    category: "Respiratory",
    price: 15.0,
    stock: 25,
    expiryDate: "2024-07-31",
  },
];

export default function PharmacyItemsList() {
  const [items, setItems] = useState(sampleItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = [
    "All",
    ...new Set(sampleItems.map((item) => item.category)),
  ];

  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (item) => categoryFilter === "All" || item.category === categoryFilter
    );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Pharmacy Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.stock < 30
                        ? "destructive"
                        : item.stock < 60
                        ? "warning"
                        : "success"
                    }
                  >
                    {item.stock}
                  </Badge>
                </TableCell>
                <TableCell>{item.expiryDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredItems.length
            )}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
            {filteredItems.length} items
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
