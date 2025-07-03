import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../components/ui/select";
import { permissionGroups } from "../assets/Data";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, X, ChevronLeft } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createStaffMember,
  updateStaffMember,
} from "../redux/slices/staffSlice";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Separator } from "../components/ui/separator";

export default function AddStaff() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { staffId } = useParams();
  const { status, error } = useSelector((state) => state.staff);
  const { userData } = useSelector((state) => state.user);
  const departments = useSelector((state) => state.departments.departments);
  // const { userData } = useSelector((state) => state.user);

  // Define initial form state
  const initialFormState = {
    roles: [],
    permissions: [],
    name: "",
    username: "",
    password: "",
    employeeID: "",
    aadharNumber: "",
    contactNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    hireDate: "",
    yearsOfExperience: "",
    shift: {
      type: "",
      hours: {
        start: "",
        end: "",
      },
    },
    salary: "",
    payrollInfo: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
    department: [],
    qualifications: [],
    certifications: [],
    address: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editMode, setEditMode] = useState(false);

  const [errors, setErrors] = useState({});
  const [newQualification, setNewQualification] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Check if user has permission to create staff
  const hasCreateStaffPermission =
    userData.permissions?.includes("create_staff");
  const hasEditStaffPermission = userData.permissions?.includes("edit_staff");

  // Reset form function
  const resetForm = () => {
    setFormData(JSON.parse(JSON.stringify(initialFormState))); // Deep clone to ensure clean state
    setErrors({});
    setNewQualification("");
    setNewCertification("");
  };
  useEffect(() => {}, [formData]);

  useEffect(() => {
    if (location.state?.editMode && location.state?.staffData) {
      if (!hasEditStaffPermission) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to edit staff members.",
        });
        navigate(-1);
        return;
      }
      setEditMode(true);
      setFormData(location.state.staffData);
    } else if (staffId) {
      setEditMode(true);
    } else if (!hasCreateStaffPermission) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create staff members.",
      });
      navigate(-1);
      return;
    } else {
      // Reset form when adding new staff
      setEditMode(false);
      resetForm();
    }
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const keys = id.split(".");
    if (keys.length === 2) {
      const [parent, child] = id.split(".");

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (keys.length === 3) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: {
            ...prev[keys[0]][keys[1]],
            [keys[2]]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleReset = () => {
    resetForm();
  };

  const handleSelectChange = (id, value) => {
    if (id.includes(".")) {
      const [parent, child] = id.split(".");

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleCheckboxChange = (id, checked) => {
    const currentRoles = formData.roles || [];
    const updatedRoles = checked
      ? [...currentRoles, id]
      : currentRoles?.filter((role) => role !== id);

    setFormData({ ...formData, roles: updatedRoles });
  };

  // const handleDepartmentChange = (department, checked) => {
  //   const updatedDepartments = checked
  //     ? [...formData.department, department]
  //     : formData.department?.filter((dep) => dep !== department);
  //   setFormData({ ...formData, department: updatedDepartments });
  // };
  const handleDepartmentChange = (department, checked) => {
    // Ensure formData.department is always an array
    const currentDepartments = formData.department || [];

    // Update the department list based on the checked state
    const updatedDepartments = checked
      ? [...currentDepartments, department] // Add the department if checked
      : currentDepartments?.filter((dep) => dep !== department); // Remove if unchecked

    // Update the formData with the new department list

    setFormData({ ...formData, department: updatedDepartments });
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData((prevData) => ({
        ...prevData,
        qualifications: [
          ...(prevData.qualifications || []),
          newQualification.trim(),
        ],
      }));
      setNewQualification("");
    }
  };

  const removeQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, qualifications: updatedQualifications });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData((prevData) => ({
        ...prevData,
        certifications: [
          ...(prevData.certifications || []),
          newCertification.trim(),
        ],
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter(
      (_, i) => i !== index
    );

    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.roles?.includes("admin") && !formData.username.trim()) {
      newErrors.username = "Username is required for admin";
    }
    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = "At least one role is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create a clean data object by removing empty fields
        const cleanData = Object.entries(formData).reduce(
          (acc, [key, value]) => {
            // Preserve all fields in edit mode except empty objects
            if (editMode) {
              // Only exclude completely empty nested objects
              if (key === "shift") {
                if (value.type || value.hours?.start || value.hours?.end) {
                  acc[key] = value;
                }
              } else if (key === "payrollInfo") {
                const hasPayrollData = Object.values(value).some(
                  (v) => v.trim() !== ""
                );
                if (hasPayrollData) acc[key] = value;
              } else {
                acc[key] = value;
              }
              return acc;
            }

            // Original logic for new entries
            if (key === "shift") {
              if (value.type && value.hours?.start && value.hours?.end) {
                acc[key] = value;
              }
              return acc;
            }

            // Handle payrollInfo nested object
            if (key === "payrollInfo") {
              const cleanPayrollInfo = Object.entries(value).reduce(
                (payroll, [field, val]) => {
                  if (val && val.trim() !== "") {
                    payroll[field] = val;
                  }
                  return payroll;
                },
                {}
              );

              if (Object.keys(cleanPayrollInfo).length > 0) {
                acc[key] = cleanPayrollInfo;
              }
              return acc;
            }

            // Handle arrays - only include if they have elements
            if (Array.isArray(value)) {
              if (value.length > 0) {
                acc[key] = value;
              }
              return acc;
            }

            // Handle string fields
            if (typeof value === "string") {
              if (value.trim() !== "") {
                acc[key] = value;
              }
              return acc;
            }

            // Handle other non-empty values
            if (value !== null && value !== undefined && value !== "") {
              acc[key] = value;
            }

            return acc;
          },
          {}
        );

        if (editMode) {
          await dispatch(
            updateStaffMember({ id: formData._id, data: cleanData })
          ).unwrap();
          toast({
            variant: "success",
            title: "Staff Updated",
            description: "Staff member has been updated successfully.",
          });
        } else {
          await dispatch(createStaffMember(cleanData)).unwrap();
          toast({
            variant: "success",
            title: "Staff Added",
            description: "Staff member has been added successfully.",
          });
        }
        navigate("/staff");
      } catch (error) {
        toast({
          title: "Error",
          description:
            error ||
            `Failed to ${
              editMode ? "update" : "add"
            } staff member. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter((p) => p !== permissionId),
    }));
  };

  const handleSelectAllInGroup = (groupPermissions, checked) => {
    const permissionIds = groupPermissions.map((permission) => permission.id);

    setFormData((prev) => {
      const currentPermissions = new Set(prev.permissions || []);

      permissionIds.forEach((id) => {
        if (checked) {
          currentPermissions.add(id);
        } else {
          currentPermissions.delete(id);
        }
      });

      return {
        ...prev,
        permissions: Array.from(currentPermissions),
      };
    });
  };

  const renderPermissionsSection = () => (
    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Staff Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Patient & Clinical */}
          <div className="space-y-6">
            {/* Patient Management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  Patient Management
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSelectAllInGroup(
                      permissionGroups["Patient Management"],
                      true
                    )
                  }
                  className="h-7 px-2 text-xs"
                >
                  Select All
                </Button>
              </div>
              <div className="space-y-2 grid grid-cols-2">
                {permissionGroups["Patient Management"].map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={(formData.permissions || []).includes(
                        permission.id
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, checked)
                      }
                    />
                    <label htmlFor={permission.id} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Inventory Management
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSelectAllInGroup(
                    permissionGroups["Inventory Management"],
                    true
                  )
                }
                className="h-7 px-2 text-xs"
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2">
              {permissionGroups["Inventory Management"].map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={permission.id}
                    checked={(formData.permissions || []).includes(
                      permission.id
                    )}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked)
                    }
                  />
                  <label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Hospital Management
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSelectAllInGroup(
                    permissionGroups["Hospital Management"],
                    true
                  )
                }
                className="h-7 px-2 text-xs"
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2 grid grid-cols-2">
              {permissionGroups["Hospital Management"].map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={permission.id}
                    checked={(formData.permissions || []).includes(
                      permission.id
                    )}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked)
                    }
                  />
                  <label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </div>

          {/* Financial Management */}
          <div className="space-y-2 ">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Financial Management
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSelectAllInGroup(
                    permissionGroups["Financial Management"],
                    true
                  )
                }
                className="h-7 px-2 text-xs"
              >
                Select All
              </Button>
            </div>
            <div className="grid grid-cols-2 space-y-2">
              {permissionGroups["Financial Management"].map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={permission.id}
                    checked={(formData.permissions || []).includes(
                      permission.id
                    )}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked)
                    }
                  />
                  <label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </label>
                </div>
              ))}
              <div
                key="delete_payments"
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id="delete_payments"
                  checked={(formData.permissions || []).includes(
                    "delete_payments"
                  )}
                  onCheckedChange={(checked) =>
                    handlePermissionChange("delete_payments", checked)
                  }
                />
                <label htmlFor="delete_payments" className="text-sm">
                  Delete Payments
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 space-y-2">
              {permissionGroups["Expense/Return"]?.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={permission.id}
                    checked={(formData.permissions || []).includes(
                      permission.id
                    )}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked)
                    }
                  />
                  <label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Staff, Hospital & Other Management */}
          <div className="space-y-6">
            {/* Staff Management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  Staff Management
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSelectAllInGroup(
                      permissionGroups["Staff Management"],
                      true
                    )
                  }
                  className="h-7 px-2 text-xs"
                >
                  Select All
                </Button>
              </div>
              <div className="space-y-2 grid grid-cols-2">
                {permissionGroups["Staff Management"].map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={(formData.permissions || []).includes(
                        permission.id
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, checked)
                      }
                    />
                    <label htmlFor={permission.id} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>

            {/* Doctor Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  Doctor Section
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSelectAllInGroup(
                      permissionGroups["Doctor Section"],
                      true
                    )
                  }
                  className="h-7 px-2 text-xs"
                >
                  Select All
                </Button>
              </div>
              <div className="space-y-2">
                {permissionGroups["Doctor Section"]?.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={(formData.permissions || []).includes(
                        permission.id
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, checked)
                      }
                    />
                    <label htmlFor={permission.id} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasCreateStaffPermission && !editMode) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to create staff members.",
    });
    navigate(-1);
    return null;
  }

  if (editMode && !hasEditStaffPermission) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to edit staff members.",
    });
    navigate(-1);
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {editMode ? "Edit" : "Add New"} Staff Member
        </h2>
      </div>
      <p className="text-gray-600 mb-4">
        Fill in the details of the {editMode ? "existing" : "new"} staff member
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:col-span-2 lg:col-span-3 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && (
                <span className="text-red-500 text-sm">{errors.name}</span>
              )}
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleInputChange}
              />
              {errors.username && (
                <span className="text-red-500 text-sm">{errors.username}</span>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password}</span>
              )}
            </div>

            <div>
              <Label htmlFor="employeeID">Employee ID</Label>
              <Input
                id="employeeID"
                value={formData.employeeID}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="aadharNumber">Aadhar Number</Label>
              <Input
                id="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                maxLength={12}
                placeholder="Enter 12-digit Aadhar number"
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="shift.type">Shift Type</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("shift.type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                  <SelectItem value="Rotating">Rotating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <Label>Shift Hours</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="shift.hours.start">Start Time</Label>
                  <Input
                    id="shift.hours.start"
                    type="time"
                    value={formData?.shift?.hours?.start}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="shift.hours.end">End Time</Label>
                  <Input
                    id="shift.hours.end"
                    type="time"
                    value={formData?.shift?.hours?.end}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.bankName">Bank Name</Label>
              <Input
                id="payrollInfo.bankName"
                value={formData?.payrollInfo?.bankName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.accountNumber">Account Number</Label>
              <Input
                id="payrollInfo.accountNumber"
                value={formData?.payrollInfo?.accountNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.ifscCode">IFSC Code</Label>
              <Input
                id="payrollInfo.ifscCode"
                value={formData?.payrollInfo?.ifscCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:col-span-1">
            <div>
              <Label>Roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "pharmacist",
                  "admin",
                  "nurse",
                  "receptionist",
                  "doctor",
                  "technician",
                  "lab technician",
                  "manager",
                  "accountant",
                ].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={formData.roles?.includes(role)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(role, checked)
                      }
                    />
                    <label
                      htmlFor={role}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role
                        .split(" ")
                        ?.map(
                          (word) =>
                            word.charAt(0)?.toUpperCase() + word.slice(1)
                        )
                        ?.join(" ")}
                    </label>
                  </div>
                ))}
              </div>
              {errors.roles && (
                <span className="text-red-500 text-sm">{errors.roles}</span>
              )}
            </div>
            <div></div>
            <div>
              <Label>Departments</Label>
              <div className="grid grid-cols-2 gap-2">
                {departments
                  ?.map((d) => d.name)
                  .map((dep) => (
                    <div key={dep} className="flex items-center space-x-2">
                      <Checkbox
                        id={`department-${dep}`}
                        checked={formData.department?.includes(dep)}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange(dep, checked)
                        }
                      />
                      <label
                        htmlFor={`department-${dep}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dep}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <ul className="list-disc pl-5 mb-2">
                {formData.qualifications?.map((qual, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{qual}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2">
                <Input
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add new qualification"
                />
                <Button type="button" onClick={addQualification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <ul className="list-disc pl-5 mb-2">
                {formData.certifications?.map((cert, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{cert}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add new certification"
                />
                <Button type="button" onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {renderPermissionsSection()}

        <div className="mt-4 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMode ? "Updating..." : "Adding..."}
              </>
            ) : editMode ? (
              "Update Staff"
            ) : (
              "Add Staff"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
