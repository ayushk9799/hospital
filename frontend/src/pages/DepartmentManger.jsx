import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import AddDepartmentDialog from "../components/custom/settings/AddDepartmentDialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../redux/slices/departmentSlice";
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

const DepartmentManger = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments, status, error } = useSelector(
    (state) => state.departments
  );

  useEffect(() => {
    if (status !== "idle") {
      dispatch(fetchDepartments());
    }
  }, [dispatch]);

  const handleBack = () => {
    navigate(-1);
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
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
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
    </div>
  );
};

export default DepartmentManger;
