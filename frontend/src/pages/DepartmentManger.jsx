import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import AddDepartmentDialog from "../components/custom/settings/AddDepartmentDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  updateDepartment,
  deleteDepartment,
} from "../redux/slices/departmentSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

const DepartmentManger = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newName, setNewName] = useState("");
  const { departments, status, error } = useSelector(
    (state) => state.departments
  );

  useEffect(() => {
    if (status !== "idle") {
      dispatch(fetchDepartments());
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description:
          typeof error === "string" ? error : "Failed to load departments",
      });
    }
  }, [error, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setNewName(department.name);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (newName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Department name cannot be empty",
      });
      return;
    }
    try {
      const result = await dispatch(
        updateDepartment({ id: selectedDepartment._id, name: newName })
      ).unwrap();
      setEditDialog(false);
      dispatch(fetchDepartments());
      if (result) {
        toast({
          title: "Department Updated",
          description: `Successfully renamed to "${result.name}"`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.message || "Could not update department name",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const result = await dispatch(deleteDepartment(id)).unwrap();
        if (result) {
          toast({
            title: "Department Deleted",
            description: "Department has been removed successfully",
          });
          dispatch(fetchDepartments());
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error?.message || "Could not delete department",
        });
      }
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Departments</CardTitle>
          </div>
          <AddDepartmentDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Staff Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length &&
                departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell>{department.staff?.length || 0}</TableCell>
                    <TableCell>
                      {department.staff
                        ?.map((staff) => staff.name)
                        .join(", ") || "No staff"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEdit(department)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(department._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No departments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Department Name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManger;
