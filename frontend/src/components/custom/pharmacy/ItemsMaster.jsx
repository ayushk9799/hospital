import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../../redux/slices/pharmacySlice";
import { Search, Filter, ChevronLeft, ChevronRight, Pencil, Trash, FileDown, Plus, ListFilter, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import AddItemDialog from "./itemMaster/AddItemDialog";
import EditItemDialog from "./itemMaster/EditItemDialog";

export default function ItemsMaster() {
  const dispatch = useDispatch();
  const {items, error, itemsStatus} = useSelector((state) => state.pharmacy);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const types = ["All", ...new Set(items.map((item) => item.type))];

  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [itemsStatus, dispatch]);

  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => typeFilter === "All" || item.type === typeFilter);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
    setItemToEdit(item);
    setIsEditItemDialogOpen(true);
  };

  const handleDelete = (id) => {
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
    setItemToEdit(null);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="ml-2 font-semibold">Pharmacy Inventory</CardTitle>
        <CardDescription>Manage and view item information</CardDescription>
      </CardHeader>
      <CardContent>
        {itemsStatus === "succeeded" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search items..." value={searchTerm} onChange={handleSearch} className="pl-8" />
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
                      <DropdownMenuItem key={type} onClick={() => handleTypeChange(type)}>
                        {type}
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
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <PackageX className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">No items found</p>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>CP</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className='capitalize'>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell cl>{item.supplier.name}</TableCell>
                        <TableCell>₹{item.CP.toFixed(2)}</TableCell>
                        <TableCell>₹{item.MRP.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.quantity < 30
                                ? "destructive"
                                : item.quantity < 60
                                ? "warning"
                                : "success"
                            }
                          >
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell className="flex">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id)}>
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
                    <Button variant="outline" size="sm" onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange("next")} disabled={currentPage === totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      <AddItemDialog isOpen={isAddItemDialogOpen} onClose={handleCloseAddItemDialog} />
      <EditItemDialog isOpen={isEditItemDialogOpen} onClose={handleCloseEditItemDialog} item={itemToEdit} />
    </Card>
  );
}
