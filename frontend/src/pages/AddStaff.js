import React, { useState } from "react";
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
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { Backend_URL } from "../assets/Data";
import { useToast } from "../hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { createStaffMember } from '../redux/slices/staffSlice';

export default function AddStaff() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.staff);
  const departments=useSelector((state)=>state.departments.departments);
  console.log(departments)
  const [formData, setFormData] = useState({});

  const [errors, setErrors] = useState({});
  const [newQualification, setNewQualification] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const keys=id.split('.')
    if (keys.length===2) {
      const [parent, child] = id.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    }
    else if (keys.length===3)
      {
        setFormData(prev => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: {
              ...prev[keys[0]][keys[1]],
              [keys[2]]: value
            }
          }
        }));
      } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSelectChange = (id, value) => {
    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
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
      setFormData(prevData => ({
        ...prevData,
        qualifications: [...(prevData.qualifications || []), newQualification.trim()]
      }));
      setNewQualification("");
    }
  };

  const removeQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({ ...formData, qualifications: updatedQualifications });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prevData => ({
        ...prevData,
        certifications: [...(prevData.certifications || []), newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (formData.roles?.includes('admin')) {
      if (!formData.username) newErrors.username = "Username is required for admin";
      if (!formData.password) newErrors.password = "Password is required for admin";
    }
    if (formData.roles.length === 0) newErrors.roles = "At least one role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await dispatch(createStaffMember(formData)).unwrap();
        toast({
          title: "Success",
          description: "Staff member has been added successfully.",
        });
        handleReset();
      } catch (error) {
        toast({
          title: "Error",
          description: error || "Failed to add staff member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
  };
console.log(formData)
  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Staff Member</h2>
      <p className="text-gray-600 mb-6">Fill in the details of the new staff member</p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-4">
          <div className="grid grid-cols-3 col-span-3 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
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
                placeholder="johndoe"
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
                placeholder="********"
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
                placeholder="EMP001"
                value={formData.employeeID}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
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
                placeholder="5"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="shift.type">Shift Type</Label>
              <Select
                onValueChange={(value) => handleSelectChange("shift.type", value)}
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
            <div>
              <Label htmlFor="shift.hours.start">Shift Start Time</Label>
              <Input
                id="shift.hours.start"
                type="time"
                value={formData?.shift?.hours?.start}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="shift.hours.end">Shift End Time</Label>
              <Input
                id="shift.hours.end"
                type="time"
                value={formData?.shift?.hours?.end}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="50000"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.bankName">Bank Name</Label>
              <Input
                id="payrollInfo.bankName"
                placeholder="Bank of America"
                value={formData?.payrollInfo?.bankName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.accountNumber">Account Number</Label>
              <Input
                id="payrollInfo.accountNumber"
                placeholder="1234567890"
                value={formData?.payrollInfo?.accountNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="payrollInfo.ifscCode">IFSC Code</Label>
              <Input
                id="payrollInfo.ifscCode"
                placeholder="ABCD0001234"
                value={formData?.payrollInfo?.ifscCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {["pharmacist", "admin","nurse", "receptionist", "doctor","technician"].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={formData.roles?.includes(role)}
                      onCheckedChange={(checked) => handleCheckboxChange(role, checked)}
                    />
                    <label
                      htmlFor={role}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              {errors.roles && (
                <span className="text-red-500 text-sm">{errors.roles}</span>
              )}
            </div>
            <div>
              <Label>Departments</Label>
              <div className="grid grid-cols-2 gap-2">
                {(departments?.map((d)=>d.name)).map((dep) => (
                  <div key={dep} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${dep}`}
                      checked={formData.department?.includes(dep)}
                      onCheckedChange={(checked) => handleDepartmentChange(dep, checked)}
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
                placeholder="123 Main St, Anytown USA"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Staff Member'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}