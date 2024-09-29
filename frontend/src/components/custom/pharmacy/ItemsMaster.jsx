// toast is not shown when the item is updated->fixed this
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fetchItems, deleteInventoryItem, setDeleteInventoryItemStatusIdle } from "../../../redux/slices/pharmacySlice";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash, FileDown, Plus, ListFilter, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import EditItemDialog from "./itemMaster/EditItemDialog";
import { useToast } from "../../../hooks/use-toast";
import AddItemDialog from "./itemMaster/AddItemDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function ItemsMaster() {
  const dispatch = useDispatch();
  const {items, itemsStatus, deleteInventoryItemStatus} = useSelector((state) => state.pharmacy);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteInventoryItem(itemToDelete._id))
      .unwrap()
      .then(() => {
        setDeleteConfirmation("");
        toast({
          title: "Item deleted successfully",
          description: `${itemToDelete.name} has been removed from the inventory.`,
          variant: "default",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to delete item",
          description: error.message || "An error occurred while deleting the item.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDeleteDialogOpen(false);
      });
  };

  const handleCloseEditItemDialog = () => {
    setIsEditItemDialogOpen(false);
    setItemToEdit(null);
  };

  const handleOpenAddItemDialog = () => {
    setIsAddItemDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setIsAddItemDialogOpen(false);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="font-semibold">Pharmacy Inventory</CardTitle>
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
                <Button variant="outline" onClick={handleOpenAddItemDialog}>
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
                        <TableCell className="capitalize">{item?.supplier?.name || "-"}</TableCell>
                        <TableCell>₹{item.CP.toFixed(2)}</TableCell>
                        <TableCell>₹{item.MRP.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.quantity <= 100
                                ? "destructive"
                                : item.quantity <= 200
                                ? "secondary"
                                : "success"
                            }
                          >
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.expiryDate ? format(new Date(item.expiryDate), 'MMM, yyyy') : "-"}</TableCell>
                        <TableCell className="flex">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
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
      <EditItemDialog isOpen={isEditItemDialogOpen} onClose={handleCloseEditItemDialog} item={itemToEdit} />
      <AddItemDialog isOpen={isAddItemDialogOpen} onClose={handleCloseAddItemDialog} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="">
              This will permanently delete the item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="">
            <p className="text-sm mb-1">Please type <span className="font-semibold">{itemToDelete?.name}</span> to permanently delete the item.</p>
            <Input
              placeholder="Type item name"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmation !== itemToDelete?.name || deleteInventoryItemStatus === "loading"}
            >
              {deleteInventoryItemStatus === "loading" ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
              </>) : (
              "Delete"
            )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
