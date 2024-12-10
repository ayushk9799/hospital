import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { createOPDProcedure } from "../../../redux/slices/opdProcedureSlice";
import { useDispatch } from "react-redux";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import MultiSelectInput from "../MultiSelectInput";
import { toast } from "../../../hooks/use-toast";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import MemoizedInput from "../registration/MemoizedInput";
import { Textarea } from "../../ui/textarea";
import { searchPatients } from "../../../redux/slices/patientSlice";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";
import OPDProcedureBillDialog from "./OPDProcedureBillDialog";
import SearchSuggestion from "../registration/CustomSearchSuggestion";

const OPDProcedureDialog = ({ open, onOpenChange }) => {
  const initialFormData = {
    name: "",
    registrationNumber: "",
    ipdNumber: "",
    gender: "",
    age: "",
    contactNumber: "",
    procedureName: "",
    totalAmount: "",
    amountPaid: "",
    paymentMethod: [],
    address: "",
  };
  const [showBill, setShowBill] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const proceduresList = [
    { name: "UROFLOWMETRY", amount: "" },
    { name: "UROFLOWMETRY+PVR", amount: "" },
    { name: "FOLEYS", amount: "" },
    {
      name:"CYSTOSCOPY",
      amount:"",
    },
    {
      name:"CISC",
      amount:"",
    },
    {
      name:"DJ STENT REMOVE",
      amount:"",
    },
    
    // Add more procedures as needed
  ];

  // Convert proceduresList to the format expected by SearchSuggestion
  const proceduresSuggestions = useMemo(() => 
    proceduresList.map(proc => ({
      name: `${proc.name} - ₹${proc.amount}`,
      ...proc
    }))
  , [proceduresList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Update handleProcedureSelect to work with SearchSuggestion
  const handleProcedureSelect = (suggestion) => {
    setFormData({
      ...formData,
      procedureName: suggestion.name,
      totalAmount: suggestion.amount,
    });
  };

  const handleGenderSelect = (value) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.age) newErrors.age = "Required";
    if (!formData.contactNumber) newErrors.contactNumber = "Required";
    if (!formData.procedureName) newErrors.procedureName = "Required";
    if (!formData.totalAmount) newErrors.totalAmount = "Required";
    // Add any other validations you need

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      dispatch(createOPDProcedure(formData))
        .unwrap()
        .then((res) => {
          toast({
            title: "Success",
            description: "OPD Procedure registered successfully",
            variant:"success"
          });
          setResponseData(res);
          setShowBill(true);
          onOpenChange(false);
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: "Failed to register OPD procedure",
            variant: "destructive",
          });
        });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register OPD procedure",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethodChange = (newMethods) => {
    setFormData((prev) => {
      // Get existing payment methods with their amounts
      const existingPayments = prev.paymentMethod.reduce((acc, pm) => {
        acc[pm.method] = pm.amount;
        return acc;
      }, {});

      // Create new payment method array preserving existing amounts
      const updatedPaymentMethods = newMethods.map((method) => ({
        method: method.name,
        amount: existingPayments[method.name] || "",
      }));

      return {
        ...prev,
        paymentMethod: updatedPaymentMethods,
      };
    });
  };

  const handleAmountPaidChange = (method, amount) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: prev.paymentMethod.map((pm) =>
        pm.method === method ? { ...pm, amount } : pm
      ),
      amountPaid: prev.paymentMethod.reduce(
        (sum, pm) => sum + (pm.amount ? parseFloat(pm.amount) : 0),
        0
      ),
    }));
  };
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amountPaid: prev.paymentMethod.reduce(
        (sum, pm) => sum + (pm.amount ? parseFloat(pm.amount) : 0),
        0
      ),
    }));
  }, [formData.paymentMethod]);
  const handleDialogClose = (open) => {
    if (!open) {
      setFormData(initialFormData);
      setErrors({});
    }
    onOpenChange(open);
  };

  const handleSearchClick = async () => {
    if (!formData.registrationNumber) return;

    try {
      const result = await dispatch(
        searchPatients(formData.registrationNumber)
      ).unwrap();
      if (result.results && result.results.length > 0) {
        const patient = result.results[0];
        setFormData({
          ...formData,
          name: patient.name,
          gender: patient.gender,
          age: patient.age,
          contactNumber: patient.contactNumber,
          address: patient.address || "",
        });
      } else {
        toast({
          title: "Not Found",
          description: "No patient found with this registration number",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[700px] w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              Register OPD Procedure
            </DialogTitle>
          </DialogHeader>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <MemoizedInput
                id="name"
                name="name"
                label="Patient Name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
            </div>
            <div className="space-y-2">
              <SearchSuggestion
                suggestions={proceduresSuggestions}
                placeholder="Select procedure"
                value={formData.procedureName}
                setValue={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    procedureName: value
                  }))
                }
                onSuggestionSelect={handleProcedureSelect}
              />
            </div>
           

           

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-1">
                <Select
                  value={formData.gender}
                  onValueChange={handleGenderSelect}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <MemoizedInput
                  id="age"
                  name="age"
                  type="number"
                  label="Age"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={errors.age}
                />
              </div>
            </div>
            <div>
              {" "}
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="min-h-9 h-9 no-scrollbar"
              />
            </div>
            <div>
              <MemoizedInput
                id="contactNumber"
                name="contactNumber"
                label="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange}
                error={errors.contactNumber}
              />
            </div>
            <div className="relative">
              <MemoizedInput
                id="registrationNumber"
                name="registrationNumber"
                label="UHID No"
                value={formData.registrationNumber}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={handleSearchClick}
                className="absolute right-2 top-[50%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <MemoizedInput
                id="totalAmount"
                name="totalAmount"
                label="Total Amount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                error={errors.totalAmount}
                className="w-full"
              />

              <div
                className={
                  formData.paymentMethod.length > 0
                    ? "grid grid-cols-3 gap-2"
                    : "grid grid-cols-2 gap-2"
                }
              >
                <div>
                  <MultiSelectInput
                    suggestions={[
                      { name: "Cash" },
                      { name: "UPI" },
                      { name: "Card" },
                      { name: "Insurance" },
                    ]}
                    placeholder={
                      formData.paymentMethod.length > 0
                        ? formData.paymentMethod.map((pm) => pm.method).join(",")
                        : "Payment Method"
                    }
                    selectedValues={formData.paymentMethod.map((pm) => ({
                      name: pm.method,
                    }))}
                    setSelectedValues={handlePaymentMethodChange}
                  />
                </div>
                {formData.paymentMethod.map((pm) => (
                  <MemoizedInput
                    key={pm.method}
                    id={`payment-${pm.method}`}
                    label={`${pm.method} Amount`}
                    value={pm.amount}
                    onChange={(e) =>
                      handleAmountPaidChange(pm.method, e.target.value)
                    }
                    className="bg-gray-50"
                  />
                ))}
              </div>
            </div>
          </form>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showBill && responseData && (
        <OPDProcedureBillDialog
          isOpen={showBill}
          setIsOpen={setShowBill}
          procedureData={responseData}
        />
      )}
    </>
  );
};

export default OPDProcedureDialog;
