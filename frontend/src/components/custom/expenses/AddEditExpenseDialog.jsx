import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpense,
  updateExpense,
} from "../../../redux/slices/expenseSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { format, parseISO, startOfDay } from "date-fns";
import SearchSuggestion from "../registration/CustomSearchSuggestion";

const EXPENSE_CATEGORIES = [
  { _id: "1", name: "Supplies" },
  { _id: "2", name: "Utilities" },
  { _id: "3", name: "Salaries" },
  { _id: "4", name: "Equipment" },
  { _id: "5", name: "Maintenance" },
  { _id: "6", name: "OPDReturn" },
];

const AddEditExpenseDialog = ({ isOpen, onClose, expenseToEdit }) => {
  const dispatch = useDispatch();
  const { createExpenseStatus, updateExpenseStatus } = useSelector(
    (state) => state.expenses
  );
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
    amountPaid: "",
    paymentMethod: "",
  });
  const [errors, setErrors] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (expenseToEdit) {
      const expenseDate = new Date(expenseToEdit.date);
      setFormData({
        category: expenseToEdit.category,
        description: expenseToEdit.description,
        amount: expenseToEdit.amount.toString(),
        date: format(expenseDate, "yyyy-MM-dd"),
        amountPaid: expenseToEdit.amountPaid.toString(),
        paymentMethod: expenseToEdit.paymentMethod || "",
      });
    } else {
      setFormData({
        category: "",
        description: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        amountPaid: "",
        paymentMethod: "",
      });
    }
  }, [expenseToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };

      if (name === "amount") {
        updatedData.amountPaid = value;
      }

      return updatedData;
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      category: "",
      description: "",
      amount: "",
      date: "",
      paymentMethod: "",
    };

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      amountPaid: parseFloat(formData.amountPaid),
      date: new Date(formData.date).toISOString(),
    };

    const action = expenseToEdit
      ? updateExpense({ ...expenseData, _id: expenseToEdit._id })
      : createExpense(expenseData);

    dispatch(action)
      .unwrap()
      .then(() => {
        toast({
          title: `Expense ${expenseToEdit ? "updated" : "added"} successfully`,
          description: `The expense has been ${
            expenseToEdit ? "updated" : "added"
          }.`,
          variant: "success",
        });
        setFormData({
          category: "",
          description: "",
          amount: "",
          date: format(new Date(), "yyyy-MM-dd"),
          amountPaid: "",
          paymentMethod: "",
        });
        onClose();
      })
      .catch((error) => {
        toast({
          title: `Failed to ${expenseToEdit ? "update" : "add"} expense`,
          description:
            error.message ||
            `There was an error ${
              expenseToEdit ? "updating" : "adding"
            } the expense. Please try again.`,
          variant: "destructive",
        });
      });
  };

  const getDescriptionPlaceholder = (category) => {
    switch (category) {
      case "OPDReturn":
        return "Enter Patient Details";
      case "Salaries":
        return "Enter Salary Description";
      case "Supplies":
        return "Enter Supply Details";
      case "Utilities":
        return "Enter Utility Bill Details";
      case "Equipment":
        return "Enter Equipment Details";
      case "Maintenance":
        return "Enter Maintenance Details";
      default:
        return "Enter description of the expense";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" sm:max-w-[425px] max-w-[90vw] rounded-lg" onOpenAutoFocus={(e)=>e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {expenseToEdit ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {expenseToEdit
              ? "Update the expense details below."
              : "Fill in the details to add a new expense."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <SearchSuggestion
                suggestions={EXPENSE_CATEGORIES}
                placeholder="Select or type category"
                value={formData.category}
                setValue={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                onSuggestionSelect={(suggestion) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: suggestion.name,
                  }))
                }
              />
              {errors.category && (
                <span className="text-sm text-red-500">{errors.category}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description/PAID To * </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={getDescriptionPlaceholder(formData.category)}
                className={
                  errors.description ? "border-red-500 ring-red-500" : ""
                }
              />
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`pl-7 ${
                      errors.amount ? "border-red-500 ring-red-500" : ""
                    }`}
                  />
                  {errors.amount && (
                    <span className="text-sm text-red-500">
                      {errors.amount}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? "border-red-500 ring-red-500" : ""}
                />
                {errors.date && (
                  <span className="text-sm text-red-500">{errors.date}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleChange({ target: { name: "paymentMethod", value } })
                }
              >
                <SelectTrigger
                  className={`w-full ${
                    errors.paymentMethod ? "border-red-500 ring-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <span className="text-sm text-red-500">
                  {errors.paymentMethod}
                </span>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                expenseToEdit
                  ? updateExpenseStatus === "loading"
                  : createExpenseStatus === "loading"
              }
              className="px-4 py-2"
            >
              {expenseToEdit
                ? updateExpenseStatus === "loading"
                  ? "Updating..."
                  : "Update Expense"
                : createExpenseStatus === "loading"
                ? "Adding..."
                : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditExpenseDialog;
