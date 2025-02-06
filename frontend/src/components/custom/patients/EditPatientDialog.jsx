import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import MemoizedInput from "../registration/MemoizedInput";
import { FloatingLabelSelect } from "../registration/PatientInfoForm";
import {
  SelectItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../../ui/select";
import { useDispatch, useSelector } from 'react-redux';
import { differenceInYears } from "date-fns";
import {editPatient} from '../../../redux/slices/patientSlice'
import { useToast } from "../../../hooks/use-toast";

const EditPatientDialog = ({ open, setOpen, patientData }) => {
  console.log('abc', patientData);
  
    const {editPatientStatus} = useSelector(state=>state.patients)
    const { toast } = useToast();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    registrationNumber: '',
    guardianName: '',
    relation: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patientData) {
      setFormData({
        name: patientData?.name || '',
        contactNumber: patientData?.contactNumber || '',
        address: patientData?.address || '',
        dateOfBirth: patientData?.dateOfBirth ? 
          new Date(patientData?.dateOfBirth).toISOString().split('T')[0] : '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        registrationNumber: patientData?.registrationNumber || '',
        guardianName: patientData?.guardianName || '',
        relation: patientData?.relation || '',
      });
    }
  }, [patientData]);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      contactNumber: '',
      address: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      registrationNumber: '',
      guardianName: '',
      relation: '',
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value;
    const age = dateOfBirth
      ? differenceInYears(new Date(), new Date(dateOfBirth))
      : "";
    handleInputChange({ target: { id: "dateOfBirth", value: dateOfBirth } });
    handleInputChange({ target: { id: "age", value: age.toString() } });
  };

  const handleAgeChange = (e) => {
    const age = e.target.value;
    handleInputChange({ target: { id: "age", value: age } });
    handleInputChange({ target: { id: "dateOfBirth", value: "" } });
  };

  const handleSelectChange = (id, value) => {
    handleInputChange({ target: { id, value } });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required";
    if (!formData.dateOfBirth && !formData.age) newErrors.age = "Age or Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (validateForm()) {
      try {
        const patientID = patientData?._id;
        formData.type = patientData?.type;
        formData.visitID = patientData?.visitID;
        await dispatch(editPatient({ patientData : formData, patientID })).unwrap();
        
        toast({
          variant: "success",
          title: "Success",
          description: "Patient record has been updated successfully",
        });
        
        handleClose();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update patient",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <MemoizedInput
            id="registrationNumber"
            label="UHID Number"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            disabled
          />
          <MemoizedInput
            id="name"
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
          />

          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Select
              id="relation"
              value={formData.relation}
              onValueChange={(value) =>
                handleInputChange({
                  target: { id: "relation", value },
                })
              }
            >
              <SelectTrigger
                className={errors.relation ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Husband">Husband</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Wife">Wife</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>

            <MemoizedInput
              id="guardianName"
              value={formData.guardianName}
              onChange={handleInputChange}
              label={`${formData.relation ? formData.relation + "'s Name" : "Guardian's Name"}`}
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="w-full sm:w-30 relative">
              <MemoizedInput
                id="age"
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleAgeChange}
                error={errors.age}
              />
            </div>
            <div className="flex-grow relative hidden sm:block">
              <MemoizedInput
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                tabIndex={-1}
                value={formData.dateOfBirth}
                onChange={handleDobChange}
              />
            </div>
          </div>

         

          <FloatingLabelSelect
            id="gender"
            label="Gender"
            value={formData.gender || ''}
            onValueChange={(value) => handleSelectChange("gender", value)}
            error={errors.gender}
          >
            {["Male", "Female", "Other"].map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender}
              </SelectItem>
            ))}
          </FloatingLabelSelect>

          <MemoizedInput
            id="contactNumber"
            label="Contact Number"
            type="tel"
            value={formData.contactNumber}
            onChange={handleInputChange}
            error={errors.contactNumber}
          />

          <MemoizedInput
            id="address"
            label="Address"
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
          />

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={editPatientStatus === 'loading'}
            >
              {editPatientStatus === 'loading' ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
