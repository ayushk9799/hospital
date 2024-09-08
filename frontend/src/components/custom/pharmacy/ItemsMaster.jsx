import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash,
  FileDown,
  Plus,
  ListFilter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import AddItemDialog from "./itemMaster/AddItemDialog"; // Import the AddItemDialog component
import EditItemDialog from "./itemMaster/EditItemDialog"; // Import the EditItemDialog component

export const sampleItems = [
  {
    id: "1",
    name: "Aspirin",
    category: "Pain Relief",
    price: 5.99,
    stock: 100,
    expiryDate: "2024-12-31",
    MRP: 6.99,
    types: "Tablet",
  },
  {
    id: "2",
    name: "Amoxicillin",
    category: "Antibiotics",
    price: 12.5,
    stock: 50,
    expiryDate: "2024-06-30",
    MRP: 14.0,
    types: "Capsule",
  },
  {
    id: "3",
    name: "Lisinopril",
    category: "Blood Pressure",
    price: 8.75,
    stock: 75,
    expiryDate: "2025-03-31",
    MRP: 10.0,
    types: "Tablet",
  },
  {
    id: "4",
    name: "Metformin",
    category: "Diabetes",
    price: 6.25,
    stock: 60,
    expiryDate: "2024-09-30",
    MRP: 7.5,
    types: "Tablet",
  },
  {
    id: "5",
    name: "Ibuprofen",
    category: "Pain Relief",
    price: 4.99,
    stock: 120,
    expiryDate: "2024-11-30",
    MRP: 5.99,
    types: "Tablet",
  },
  {
    id: "6",
    name: "Levothyroxine",
    category: "Thyroid",
    price: 10.0,
    stock: 40,
    expiryDate: "2025-01-31",
    MRP: 12.0,
    types: "Tablet",
  },
  {
    id: "7",
    name: "Omeprazole",
    category: "Digestive Health",
    price: 7.5,
    stock: 80,
    expiryDate: "2024-10-31",
    MRP: 9.0,
    types: "Capsule",
  },
  {
    id: "8",
    name: "Amlodipine",
    category: "Blood Pressure",
    price: 9.25,
    stock: 55,
    expiryDate: "2025-02-28",
    MRP: 11.0,
    types: "Tablet",
  },
  {
    id: "9",
    name: "Sertraline",
    category: "Mental Health",
    price: 11.75,
    stock: 30,
    expiryDate: "2024-08-31",
    MRP: 13.5,
    types: "Tablet",
  },
  {
    id: "10",
    name: "Albuterol",
    category: "Respiratory",
    price: 15.0,
    stock: 25,
    expiryDate: "2024-07-31",
    MRP: 17.0,
    types: "Inhaler",
  },
  {
    id: "11",
    name: "Simvastatin",
    category: "Cholesterol",
    price: 9.99,
    stock: 45,
    expiryDate: "2025-04-30",
    MRP: 11.5,
    types: "Tablet",
  },
  {
    id: "12",
    name: "Metoprolol",
    category: "Blood Pressure",
    price: 8.5,
    stock: 70,
    expiryDate: "2025-05-31",
    MRP: 10.0,
    types: "Tablet",
  },
  {
    id: "13",
    name: "Atorvastatin",
    category: "Cholesterol",
    price: 10.25,
    stock: 55,
    expiryDate: "2025-06-30",
    MRP: 12.0,
    types: "Tablet",
  },
  {
    id: "14",
    name: "Gabapentin",
    category: "Nerve Pain",
    price: 7.75,
    stock: 65,
    expiryDate: "2025-07-31",
    MRP: 9.0,
    types: "Capsule",
  },
  {
    id: "15",
    name: "Hydrochlorothiazide",
    category: "Diuretics",
    price: 6.5,
    stock: 80,
    expiryDate: "2025-08-31",
    MRP: 7.75,
    types: "Tablet",
  },
  {
    id: "16",
    name: "Furosemide",
    category: "Diuretics",
    price: 5.75,
    stock: 90,
    expiryDate: "2025-09-30",
    MRP: 6.99,
    types: "Tablet",
  },
  {
    id: "17",
    name: "Citalopram",
    category: "Mental Health",
    price: 11.0,
    stock: 35,
    expiryDate: "2025-10-31",
    MRP: 13.0,
    types: "Tablet",
  },
  {
    id: "18",
    name: "Losartan",
    category: "Blood Pressure",
    price: 9.0,
    stock: 60,
    expiryDate: "2025-11-30",
    MRP: 10.5,
    types: "Tablet",
  },
  {
    id: "19",
    name: "Clopidogrel",
    category: "Blood Thinner",
    price: 12.0,
    stock: 40,
    expiryDate: "2025-12-31",
    MRP: 14.0,
    types: "Tablet",
  },
  {
    id: "20",
    name: "Montelukast",
    category: "Respiratory",
    price: 13.5,
    stock: 50,
    expiryDate: "2026-01-31",
    MRP: 15.5,
    types: "Tablet",
  },
  {
    id: "21",
    name: "Montelukast1",
    category: "Respiratory",
    price: 13.5,
    stock: 50,
    expiryDate: "2026-01-31",
    MRP: 15.5,
    types: "Tablet",
  },
];

export default function ItemsMaster() {
  const [items, setItems] = useState(sampleItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed from 5 to 10
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false); // State to control dialog visibility
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false); // State to control edit dialog visibility
  const [itemToEdit, setItemToEdit] = useState(null); // State to store the item being edited

  const categories = [
    "All",
    ...new Set(sampleItems.map((item) => item.category)),
  ];

  const types = ["All", ...new Set(sampleItems.map((item) => item.types))];

  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (item) => categoryFilter === "All" || item.category === categoryFilter
    )
    .filter((item) => typeFilter === "All" || item.types === typeFilter);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item); // Set the item to be edited
    setIsEditItemDialogOpen(true); // Open the edit dialog
  };

  const handleDelete = (id) => {
    // Implement delete functionality here
    console.log(`Delete item with id: ${id}`);
  };

  const handleAddItemClick = () => {
    setIsAddItemDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setIsAddItemDialogOpen(false);
  };

  const handleCloseEditItemDialog = () => {
    setIsEditItemDialogOpen(false);
    setItemToEdit(null); // Clear the item being edited
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className=" ml-2font-semibold">Pharmacy Inventory</CardTitle>
        <CardDescription>Manage and view item information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {typeFilter === "All" ? "Select type" : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {types.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleTypeChange(type)}
                  >
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {categoryFilter === "All"
                    ? "Select category"
                    : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleAddItemClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id} >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.types}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell>₹{item.price.toFixed(2)}</TableCell>
                <TableCell>₹{item.MRP.toFixed(2)}</TableCell>
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
                <TableCell className="flex ">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)} // Pass the item to handleEdit
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-2">
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
      <AddItemDialog isOpen={isAddItemDialogOpen} onClose={handleCloseAddItemDialog} />
      <EditItemDialog
        isOpen={isEditItemDialogOpen}
        onClose={handleCloseEditItemDialog}
        item={itemToEdit} // Pass the item to the dialog
      />
    </Card>
  );
}
